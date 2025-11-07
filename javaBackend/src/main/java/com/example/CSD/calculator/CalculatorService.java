package com.example.CSD.calculator;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.example.CSD.concession.Concession;
import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTAService;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffService;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeService;

import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    private final TariffService ts;
    private final FTAService fs;
    private final HSCodeService hs;

    public CalculatorService(TariffService ts, FTAService fs, HSCodeService hs) {
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
        Boolean hasFTA = false;                                                 // Track if an applicable FTA exists 
        Boolean hasConcession = false; //temp for debug
        Double lowestFTARate = 0.0;                                                 // Track lowest FTA rate if multple applicable FTAs exist
        for (FTA fta : ftas) {                                                  // For each FTA
            Set<HSCode> excludedHsCodes = fta.getExcludedHsCodes();                 // Retrieve the HSCodes excluded from this FTA
            if (excludedHsCodes.contains(queryHsCode)) {continue;}                  // (1) query HS Code is excluded, skip this FTA

            double curRate = fta.getDefaultRate();                                  // (2) query HS Code is included, consider this FTA
            if (fta.getAllSpecialHsCodes().contains(queryHsCode)) { 
                Set<Concession> specialConcessions = fta.getSpecialConcessions();
                Concession concession = specialConcessions.stream().filter(c -> c.getHsCode().equals(queryHsCode)).findFirst().orElse(null);
                Double concessionRate = concession.getFinalRate();
                curRate = concessionRate;
            }

            if (!hasFTA) {                                                              // First applicable FTA
                lowestFTARate = curRate;
                hasFTA = true;
            }
            else if (lowestFTARate > curRate) {                                         // Another applicable FTA that has lower rate
                lowestFTARate = curRate;
            }
        }
        Double ftaCost = originalValue * (lowestFTARate/100);                           // Calculate additional cost under FTA

        // Case 2: Tariff   (No FTA exists)
        List<Tariff> tariffs = ts.getActiveTariffs(originCode, destCode, hsCode, null, dateStr);    // Get all tariff lines between both countries
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
        
        // Determine which cost is less and build response map
        Map<String, Object> result = new HashMap<>();
        result.put("origin", originCode);
        result.put("destination", destCode);
        result.put("hsCode", hsCode);
        result.put("originalValue", originalValue);
        result.put("appliedDate", dateStr);
        
        if (hasFTA && ftaCost.compareTo(tariffTotal) <= 0) {                             // If applicable FTA exists AND fta cost lower than tariff costs 
            // Find the FTA that was applied (lowest rate)
            FTA appliedFTA = null;
            for (FTA fta : ftas) {
                Set<HSCode> excludedHsCodes = fta.getExcludedHsCodes();
                if (excludedHsCodes.contains(queryHsCode)) continue;
                
                double curRate = fta.getDefaultRate();
                if (fta.getAllSpecialHsCodes().contains(queryHsCode)) {
                    Set<Concession> specialConcessions = fta.getSpecialConcessions();
                    Concession concession = specialConcessions.stream()
                        .filter(c -> c.getHsCode().equals(queryHsCode))
                        .findFirst().orElse(null);
                    if (concession != null) {
                        curRate = concession.getFinalRate();
                    }
                }
                
                if (curRate == lowestFTARate) {
                    appliedFTA = fta;
                    break;
                }
            }
            
            result.put("standardRate", tariffs.isEmpty() ? null : tariffs.get(0).getStandardRate());
            result.put("adjustedRate", lowestFTARate);
            result.put("agreementName", appliedFTA != null ? 
                (appliedFTA.getPartyA().getCountry() != null ? 
                    appliedFTA.getPartyA().getCountry().getName() : "Bloc") + "-" +
                (appliedFTA.getPartyB().getCountry() != null ? 
                    appliedFTA.getPartyB().getCountry().getName() : "Bloc") + " FTA" : "FTA");
            result.put("ftaApplied", true);
            result.put("finalValue", originalValue + ftaCost);
            result.put("tariffCost", ftaCost);
            return result;
        }
        else {                                                                          // If no applicable FTA exists OR fta cost higher than tariff costs 
            Double standardRate = tariffs.isEmpty() ? null : 
                (tariffs.get(0).getStandardRate() != null ? tariffs.get(0).getStandardRate() : null);
            result.put("standardRate", standardRate);
            result.put("adjustedRate", null);
            result.put("agreementName", null);
            result.put("ftaApplied", false);
            result.put("finalValue", originalValue + tariffTotal);
            result.put("tariffCost", tariffTotal);
            return result;
        }
    }
}
