package com.example.CSD.calculator;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.Map;

import com.example.CSD.concession.Concession;
import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTAServiceImpl;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffServiceImpl;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeServiceImpl;

import org.springframework.stereotype.Service;

@Service
public class CalculatorServiceImpl implements CalculatorService {
    private final TariffServiceImpl ts;
    private final FTAServiceImpl fs;
    private final HSCodeServiceImpl hs;

    public CalculatorServiceImpl(TariffServiceImpl ts, FTAServiceImpl fs, HSCodeServiceImpl hs) {
        this.ts = ts;
        this.fs = fs;
        this.hs = hs;
    }

    /**
     * Calculate total cost for a product based on tariffs.
     *
     * Formula: (apply each tariff -> value*rate OR value+fee) + original value
     */
    public Map<String, Object> calculateTariffedValue(
            double originalValue,
            String originCode,
            String destCode,
            String hsCode,
            String dateStr
    ) { 
        // Case 1: FTA
        List<FTA> ftas = fs.getActiveFTA(null,originCode,destCode,dateStr);     // Get all FTA between both countries
        HSCode queryHsCode = hs.getHSCode(hsCode, null).get(0);     
        FTA bestFTA = null;                                                     // Track if an applicable FTA exists 
        Double lowestFTARate = 0.0;                                             // Track lowest FTA rate if multple applicable FTAs exist
        Double ftaCost = 0.0;                                                   // Calculate additional cost under FTA
        for (FTA fta : ftas) {                                                  // For each FTA
            Set<HSCode> excludedHsCodes = fta.getExcludedHsCodes();                 // Retrieve the HSCodes excluded from this FTA
            if (excludedHsCodes.contains(queryHsCode)) {continue;}                  // (1) query HS Code is excluded, skip this FTA

            double curRate = fta.getDefaultRate();                                  // (2) query HS Code is included, consider this FTA
            if (fta.getAllSpecialHsCodes().contains(queryHsCode)) {                     // Queried HS code part of special concession 
                Set<Concession> specialConcessions = fta.getSpecialConcessions();
                Concession concession = specialConcessions.stream().filter(c -> c.getHsCode().equals(queryHsCode)).findFirst().orElse(null);
                Double concessionRate = concession.getFinalRate();
                curRate = concessionRate;
            }

            if (bestFTA == null || curRate < lowestFTARate) {                       // First applicable FTA OR better FTA
                lowestFTARate = curRate;
                bestFTA = fta;
                ftaCost = originalValue * (lowestFTARate/100);
            }
        }
        Boolean hasFTA = bestFTA != null;

        // Case 2: Tariff
        List<Tariff> tariffs = ts.getActiveTariffs(originCode, destCode, hsCode, null, dateStr);    // Get all tariff lines between both countries
        Boolean hasTariffs = !tariffs.isEmpty();
        List<String> tRate = new ArrayList<>();
        Double tariffTotal = 0.0;                                                                   // Track total tariff cost
        for (Tariff tariff : tariffs) {                                                             // For each tariff line
            if (tariff.getStandardRate() != null) {                                                     // (1) tariff uses ad valorem rate
                tariffTotal += originalValue * tariff.getStandardRate() / 100;
                tRate.add(tariff.getTariffType()+": "+tariff.getStandardRate()+"%");
            } 
            else if (tariff.getFlatFee() != null) {                                                     // (2) tariff uses flat tariff fee
                tariffTotal += tariff.getFlatFee();
                tRate.add(tariff.getTariffType()+": $"+tariff.getFlatFee());
            } 
        }
        
        // Determine which cost is less
        Map<String, Object> result = new HashMap<>();
        Object appliedFTA = null;
        List<Tariff> appliedTariffs = null;
        Double additionalCost = 0.0;

        Map<String, Object> ftaMap = new HashMap<String,Object>();              // Extract relevant info to be displayed
        if (hasFTA) {
            ftaMap.put("name", bestFTA.getName());
            ftaMap.put("partyA", bestFTA.getPartyA().getName());
            ftaMap.put("partyB", bestFTA.getPartyB().getName());
            ftaMap.put("appliedRate", lowestFTARate);
            ftaMap.put("effectiveDate", bestFTA.getEffectiveDate());
            ftaMap.put("expirationDate", bestFTA.getExpirationDate());
        }

        if (hasFTA && hasTariffs) {     // BOTH FTA & Tariffs are applicable -> Take one with less cost
            appliedFTA = ftaCost <= tariffTotal ? ftaMap : null;
            appliedTariffs = ftaCost <= tariffTotal ? tariffs : new ArrayList<>();
            additionalCost = ftaCost <= tariffTotal ? ftaCost : tariffTotal;
        }
        else if (hasFTA) {              // Only FTA applicable
            appliedFTA =  ftaMap;
            appliedTariffs = new ArrayList<>();
            additionalCost = ftaCost;
        }
        else if (hasTariffs) {          // Only Tariff applicable
            appliedFTA = null;
            appliedTariffs = tariffs;
            additionalCost = tariffTotal;
        }
        else {                          // Nothing applicable
            appliedFTA = null;
            appliedTariffs = new ArrayList<>();
            additionalCost = 0.0;

        }
        result.put("appliedFTA", appliedFTA);
        result.put("appliedTariffs", appliedTariffs);
        result.put("tariffTotal", additionalCost);
        result.put("finalValue", originalValue + additionalCost);
        return result;
    }
}
