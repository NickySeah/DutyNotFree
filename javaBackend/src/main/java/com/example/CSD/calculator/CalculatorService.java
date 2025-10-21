package com.example.CSD.calculator;

import java.util.List;
import java.util.Set;

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
        boolean hasFTA = false;                                                 // Track if an applicable FTA exists 
        double lowestRate = -1;                                                 // Track lowest FTA rate if multple applicable FTAs exist
        for (FTA fta : ftas) {                                                  // For each FTA
            Set<HSCode> excludedHsCodes = fta.getExcludedHsCodes();                 // Retrieve the HSCodes excluded from this FTA
            if (excludedHsCodes.contains(queryHsCode)) {continue;}                  // (1) query HS Code is excluded, skip this FTA

            double curRate = fta.getDefaultRate();                                  // (2) query HS Code is included, consider this FTA
            if (lowestRate==-1) {                                                       // First applicable FTA
                lowestRate = curRate;
                hasFTA = true;
            }
            else if (lowestRate > curRate) {                                            // Another applicable FTA that is lower
                lowestRate = curRate;
            }
        }

        if (hasFTA) {                                                           // If applicable FTA exists
            double ftaCost = originalValue * (lowestRate/100);                      // Calculate additional cost under FTA
            return originalValue + ftaCost;                                         // Return final cost
        }

        // Case 2: Tariff   (No FTA exists)
        List<Tariff> tariffs = ts.getActiveTariffs(originCode, destCode, hsCode, null, dateStr);    // Get all tariff lines between both countries
        double tariffTotal = 0.0;                                                                   // Track total tariff cost
        for (Tariff tariff : tariffs) {                                                             // For each tariff line
            if (tariff.getStandardRate() != null) {                                                     // (1) tariff uses ad valorem rate
                tariffTotal += originalValue * tariff.getStandardRate() / 100;
            } 
            else if (tariff.getFlatFee() != null) {                                                     // (2) tariff uses flat tariff fee
                tariffTotal += tariff.getFlatFee();
            } 
        }

        return originalValue + tariffTotal;                                                         // Returns final cost = tariffs + base value
    }
}
