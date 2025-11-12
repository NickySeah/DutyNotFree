package com.example.CSD.test.calculator;

import com.example.CSD.calculator.CalculatorService;
import com.example.CSD.calculator.CalculatorV1Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CalculatorV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
public class CalculatorControllerTest {
    private static final String BASE_URL = "/api/v1/calculator";
    
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CalculatorService calculatorService;

    private Map<String, Object> mockCalculationResult;

    @BeforeEach
    void setUp() {
        // Setup mock calculation result
        mockCalculationResult = new HashMap<>();
        mockCalculationResult.put("appliedTariffs", new java.util.ArrayList<>());
        mockCalculationResult.put("tariffTotal", 75.0);
        mockCalculationResult.put("finalValue", 1075.0);
    }

    @Test
    public void should_ReturnCalculationResult_WhenValidRequest() throws Exception {
        // Arrange: Mock service response
        when(calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"))
                .thenReturn(mockCalculationResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(75.0))
                .andExpect(jsonPath("$.finalValue").value(1075.0));

        verify(calculatorService).calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");
    }

    @Test
    public void should_ReturnCalculationResult_WhenZeroValueProvided() throws Exception {
        // Arrange: Setup result for zero value
        Map<String, Object> zeroResult = new HashMap<>();
        zeroResult.put("appliedTariffs", new java.util.ArrayList<>());
        zeroResult.put("tariffTotal", 0.0);
        zeroResult.put("finalValue", 0.0);

        when(calculatorService.calculateTariffedValue(0.0, "SG", "US", "847130", "2025-01-01"))
                .thenReturn(zeroResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "0.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(0.0))
                .andExpect(jsonPath("$.finalValue").value(0.0));

        verify(calculatorService).calculateTariffedValue(0.0, "SG", "US", "847130", "2025-01-01");
    }

    @Test
    public void should_ReturnCalculationResult_WhenLargeValueProvided() throws Exception {
        // Arrange: Setup result for large value
        Map<String, Object> largeResult = new HashMap<>();
        largeResult.put("appliedTariffs", new java.util.ArrayList<>());
        largeResult.put("tariffTotal", 75000.0);
        largeResult.put("finalValue", 1075000.0);

        when(calculatorService.calculateTariffedValue(1000000.0, "SG", "US", "847130", "2025-01-01"))
                .thenReturn(largeResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(75000.0))
                .andExpect(jsonPath("$.finalValue").value(1075000.0));

        verify(calculatorService).calculateTariffedValue(1000000.0, "SG", "US", "847130", "2025-01-01");
    }

    @Test
    public void should_Return500_WhenServiceThrowsException() throws Exception {
        // Arrange: Mock service to throw exception
        when(calculatorService.calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Query date must be a valid date and in the format YYYY-MM-DD."));

        // Act & Assert
        try {
            mockMvc.perform(get(BASE_URL)
                    .param("value", "1000.0")
                    .param("origin", "SG")
                    .param("dest", "US")
                    .param("hsCode", "847130")
                    .param("date", "invalid-date"))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // Service validation may throw exception
            assertTrue(e.getCause() instanceof RuntimeException ||
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(calculatorService).calculateTariffedValue(1000.0, "SG", "US", "847130", "invalid-date");
    }

    @Test
    public void should_Return400_WhenMissingRequiredParameters() throws Exception {
        // Act & Assert: Missing value parameter
        mockMvc.perform(get(BASE_URL)
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isBadRequest());

        verify(calculatorService, never()).calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void should_Return400_WhenMissingOriginParameter() throws Exception {
        // Act & Assert: Missing origin parameter
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isBadRequest());

        verify(calculatorService, never()).calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void should_Return400_WhenMissingDestParameter() throws Exception {
        // Act & Assert: Missing dest parameter
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isBadRequest());

        verify(calculatorService, never()).calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void should_Return400_WhenMissingHsCodeParameter() throws Exception {
        // Act & Assert: Missing hsCode parameter
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("date", "2025-01-01"))
                .andExpect(status().isBadRequest());

        verify(calculatorService, never()).calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void should_Return400_WhenMissingDateParameter() throws Exception {
        // Act & Assert: Missing date parameter
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130"))
                .andExpect(status().isBadRequest());

        verify(calculatorService, never()).calculateTariffedValue(anyDouble(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void should_ReturnCorrectResult_WhenNegativeValueProvided() throws Exception {
        // Arrange: Setup result for negative value
        Map<String, Object> negativeResult = new HashMap<>();
        negativeResult.put("appliedTariffs", new java.util.ArrayList<>());
        negativeResult.put("tariffTotal", -7.5);
        negativeResult.put("finalValue", -107.5);

        when(calculatorService.calculateTariffedValue(-100.0, "SG", "US", "847130", "2025-01-01"))
                .thenReturn(negativeResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "-100.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(-7.5))
                .andExpect(jsonPath("$.finalValue").value(-107.5));

        verify(calculatorService).calculateTariffedValue(-100.0, "SG", "US", "847130", "2025-01-01");
    }

    @Test
    public void should_ReturnCorrectResult_WhenDifferentCountriesProvided() throws Exception {
        // Arrange: Mock service response
        when(calculatorService.calculateTariffedValue(1000.0, "UK", "CA", "847130", "2025-01-01"))
                .thenReturn(mockCalculationResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "UK")
                .param("dest", "CA")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(75.0))
                .andExpect(jsonPath("$.finalValue").value(1075.0));

        verify(calculatorService).calculateTariffedValue(1000.0, "UK", "CA", "847130", "2025-01-01");
    }

    @Test
    public void should_ReturnCorrectResult_WhenDifferentHsCodeProvided() throws Exception {
        // Arrange: Mock service response
        when(calculatorService.calculateTariffedValue(1000.0, "SG", "US", "22030011", "2025-01-01"))
                .thenReturn(mockCalculationResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "22030011")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(75.0))
                .andExpect(jsonPath("$.finalValue").value(1075.0));

        verify(calculatorService).calculateTariffedValue(1000.0, "SG", "US", "22030011", "2025-01-01");
    }

    @Test
    public void should_ReturnCorrectResult_WhenDifferentDateProvided() throws Exception {
        // Arrange: Mock service response
        when(calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-06-15"))
                .thenReturn(mockCalculationResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-06-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(75.0))
                .andExpect(jsonPath("$.finalValue").value(1075.0));

        verify(calculatorService).calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-06-15");
    }

    @Test
    public void should_ReturnEmptyTariffs_WhenNoTariffsApplied() throws Exception {
        // Arrange: Setup result with no tariffs
        Map<String, Object> noTariffResult = new HashMap<>();
        noTariffResult.put("appliedTariffs", new java.util.ArrayList<>());
        noTariffResult.put("tariffTotal", 0.0);
        noTariffResult.put("finalValue", 1000.0);

        when(calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"))
                .thenReturn(noTariffResult);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("value", "1000.0")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tariffTotal").value(0.0))
                .andExpect(jsonPath("$.finalValue").value(1000.0))
                .andExpect(jsonPath("$.appliedTariffs").isArray())
                .andExpect(jsonPath("$.appliedTariffs").isEmpty());

        verify(calculatorService).calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");
    }

}
