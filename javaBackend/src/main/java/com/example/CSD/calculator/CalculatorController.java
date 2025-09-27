package com.example.CSD.calculator;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/calculator")   // All endpoints start with /calculator
public class CalculatorController {

    private final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    /**
     * Example GET endpoint:
     * /calculator?originCode=SG&destCode=US&hsCode=1234&value=1000
     */
    @GetMapping
    public double calculateTariffedValue(
            @RequestParam double value,
            @RequestParam String originCode,
            @RequestParam String destCode,
            @RequestParam String hsCode
    ) {
        return calculatorService.calculateTariffedValue(value, originCode, destCode, hsCode);
    }
}
