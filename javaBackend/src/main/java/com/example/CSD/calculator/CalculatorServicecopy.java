package com.example.CSD.calculator;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class CalculatorServicecopy {

    private final TariffRepository tariffRepository;

    public CalculatorServicecopy(TariffRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    // /**
    //  * Calculate total cost for a product based on tariffs.
    //  *
    //  * Formula: (apply each tariff -> value*rate OR value+fee) + original value
    //  */
    // public Map<String, Object> calculateTariffedValue(
    //         double originalValue,
    //         String originCode,
    //         String destCode,
    //         String hsCode,
    //         String dateStr
    // ) {
    //     // 1. Get all tariffs matching the trade route & HS code at a given date
    //     LocalDate effectiveDate = null;
    //     try {
    //         effectiveDate =LocalDate.parse(dateStr);
    //     }
    //     catch (DateTimeException e) {                                               // (!) Given in invalid format   
    //         throw new RuntimeException("Query date must be a valid date and in the format YYYY-MM-DD.");
    //     }

    //     List<Tariff> tariffs = tariffRepository.findActiveTariffsByFilters(originCode, destCode, hsCode, null, effectiveDate);

    //     // 2. Apply each tariff in sequence
    //     double tariffTotal = 0.0;
    //     for (Tariff tariff : tariffs) {
    //         System.out.printf("Debug: from %s to %s for %s - %s: rate %s%% OR fee $%s - start %s to end %s\n",                  //TODO: to see what tariffs are applied via terminal
    //                 tariff.getOriginCountry().getName(), tariff.getDestCountry().getName(), tariff.getHsCode().getDescription(),
    //                 tariff.getTariffType(),
    //                 tariff.getStandardRate() != null ? tariff.getStandardRate() : "N/A",
    //                 tariff.getFlatFee() != null ? tariff.getFlatFee() : "N/A",
    //                 tariff.getEffectiveDate(), tariff.getExpirationDate() != null ? tariff.getExpirationDate() : "N/A"
    //         );

    //         if (tariff.getStandardRate() != null) {
    //             tariffTotal += originalValue * tariff.getStandardRate() / 100;
    //         } 
    //         else if (tariff.getFlatFee() != null) {
    //             tariffTotal += tariff.getFlatFee();
    //         } 
    //     }

    //     // 3. Final cost = tariffs + base value
    //     Map<String, Object> result = new HashMap<>();
    //     result.put("appliedTariffs", tariffs);
    //     result.put("tariffTotal", tariffTotal);
    //     result.put("finalValue", originalValue + tariffTotal);
    //     return result;
    // }
}
