package com.example.CSD.calculator;

import java.util.List;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    private final TariffRepository tariffRepository;

    public CalculatorService(TariffRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
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
            String hsCode
    ) {
        // 1. Get all tariffs matching the product trade route & HS code
        List<Tariff> tariffs = tariffRepository.findByFilters(originCode, destCode, hsCode, null);

        // 2. Apply each tariff in sequence
        double tariffTotal = 0.0;
        for (Tariff tariff : tariffs) {
    if ("RATE".equalsIgnoreCase(tariff.getTariffType()) && tariff.getStandardRate() != null) {
        tariffTotal += originalValue * tariff.getStandardRate();
    } else if ("FEE".equalsIgnoreCase(tariff.getTariffType()) && tariff.getFlatFee() != null) {
        tariffTotal += originalValue + tariff.getFlatFee();
    } else {
        throw new IllegalArgumentException("Unknown tariff type or missing rate/fee: " + tariff.getTariffType());
    }
}


        // 3. Final cost = tariffs + base value
        return originalValue + tariffTotal;
    }
}
