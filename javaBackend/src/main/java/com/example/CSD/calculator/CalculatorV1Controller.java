package com.example.CSD.calculator;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Calculator Controller", description = "Calculates tariffed value based on origin, destination, HS code, and product value")
@RestController
@RequestMapping("/api/v1/calculator")   // All endpoints start with /calculator
public class CalculatorV1Controller {

    private final CalculatorService calculatorService;

    public CalculatorV1Controller(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    /**
     * Example GET endpoint:
     * /calculator?originCode=SG&destCode=US&hsCode=1234&value=1000
     */
    @GetMapping
    @Operation(
        summary = "Calculate tariffed value",
        description = "Returns the tariffed value of a product based on origin country, destination country, HS code, and declared value"
    )
@   ApiResponses({
        @ApiResponse(responseCode = "200", description = "Calculation successful")
    })
    public Map<String, Object> calculateTariffedValue(
            @RequestParam double value,
            @RequestParam String origin,
            @RequestParam String dest,
            @RequestParam String hsCode,
            @RequestParam String date
    ) {
        return calculatorService.calculateTariffedValue(value, origin, dest, hsCode, date);
    }
}
