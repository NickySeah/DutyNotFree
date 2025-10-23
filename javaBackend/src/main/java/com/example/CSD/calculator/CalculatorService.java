package com.example.CSD.calculator;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
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
    public double calculateTariffedValue(
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
        
        // Determine which cost is less
        System.out.println(ftaCost + " vs " + tariffTotal);
        if (hasFTA && ftaCost.compareTo(tariffTotal) <= 0) {                             // If applicable FTA exists AND fta cost lower than tariff costs 
            System.out.printf("\nFree Trade Agreement %s:\nRate Applied %.3f%%\nCost: $%.2f\n", hasConcession?"(Special Concession)":"",lowestFTARate,ftaCost);
            return originalValue + ftaCost;                                                 // Return final cost = fta rate + base value
        }
        else {                                                                          // If no applicable FTA exists OR fta cost higher than tariff costs 
            System.out.printf("\nTariff:\nRate Applied %s\nCost: $%.2f\n", tRate.toString(), tariffTotal);
            return originalValue + tariffTotal;                                             // Returns final cost = tariffs + base value
        }
    }
}
