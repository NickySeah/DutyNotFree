package com.example.CSD.calculator;

import java.util.*;

public interface CalculatorService {
    /**
     * Calculate total cost for a product based on tariffs/FTAs.
     * 
     * @param originalValue The original value of the product.
     * @param originCode    The origin country code.
     * @param destCode      The destination country code.
     * @param hsCode        The HS code of the product.
     * @param dateStr       The date string for tariff applicability.
     * @return A map containing the detailed breakdown of tariffs/FTA, additonal cost and final cost.
     */
    public Map<String, Object> calculateTariffedValue(double originalValue,String originCode,String destCode,String hsCode,String dateStr);
}
