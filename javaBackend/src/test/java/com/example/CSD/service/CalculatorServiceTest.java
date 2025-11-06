package com.example.CSD.service;

import com.example.CSD.calculator.CalculatorService;
import com.example.CSD.country.Country;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CalculatorServiceTest {

    @Mock
    private TariffRepository tariffRepository;

    @InjectMocks
    private CalculatorService calculatorService;

    private HSCode testHsCode;
    private Country testOriginCountry;
    private Country testDestCountry;
    private Tariff testTariffWithRate;
    private Tariff testTariffWithFee;

    @BeforeEach
    void setUp() {
        // Setup test HSCode
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Test Description");

        // Setup test Countries
        testOriginCountry = new Country();
        testOriginCountry.setCode("SG");
        testOriginCountry.setName("Singapore");
        testOriginCountry.setAlpha3("SGP");

        testDestCountry = new Country();
        testDestCountry.setCode("US");
        testDestCountry.setName("United States");
        testDestCountry.setAlpha3("USA");

        // Setup test Tariff with rate
        testTariffWithRate = new Tariff();
        testTariffWithRate.setId(1L);
        testTariffWithRate.setHsCode(testHsCode);
        testTariffWithRate.setOriginCountry(testOriginCountry);
        testTariffWithRate.setDestCountry(testDestCountry);
        testTariffWithRate.setTariffType("Standard");
        testTariffWithRate.setStandardRate(7.5);
        testTariffWithRate.setFlatFee(null);
        testTariffWithRate.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testTariffWithRate.setExpirationDate(LocalDate.of(2025, 12, 31));

        // Setup test Tariff with fee
        testTariffWithFee = new Tariff();
        testTariffWithFee.setId(2L);
        testTariffWithFee.setHsCode(testHsCode);
        testTariffWithFee.setOriginCountry(testOriginCountry);
        testTariffWithFee.setDestCountry(testDestCountry);
        testTariffWithFee.setTariffType("Flat");
        testTariffWithFee.setStandardRate(null);
        testTariffWithFee.setFlatFee(50.0);
        testTariffWithFee.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testTariffWithFee.setExpirationDate(LocalDate.of(2025, 12, 31));
    }

    @Test
    public void should_ReturnExpectedValue_WhenValidInputsWithSingleRateProvided() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(75.0, result.get("tariffTotal")); // 1000 * 7.5 / 100
        assertEquals(1075.0, result.get("finalValue")); // 1000 + 75
        assertEquals(tariffs, result.get("appliedTariffs"));
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ReturnExpectedValue_WhenValidInputsWithSingleFeeProvided() {
        // Arrange: Mock repository to return tariff with fee
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithFee);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(50.0, result.get("tariffTotal")); // Flat fee
        assertEquals(1050.0, result.get("finalValue")); // 1000 + 50
        assertEquals(tariffs, result.get("appliedTariffs"));
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ReturnExpectedValue_WhenMultipleTariffsProvided() {
        // Arrange: Mock repository to return multiple tariffs (rate + fee)
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        tariffs.add(testTariffWithFee);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(125.0, result.get("tariffTotal")); // 75 (rate) + 50 (fee)
        assertEquals(1125.0, result.get("finalValue")); // 1000 + 125
        assertEquals(tariffs, result.get("appliedTariffs"));
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ReturnZeroTariff_WhenNoTariffsExist() {
        // Arrange: Mock repository to return empty list
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(new ArrayList<>());

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("tariffTotal"));
        assertEquals(1000.0, result.get("finalValue")); // Original value unchanged
        assertTrue(((List<?>) result.get("appliedTariffs")).isEmpty());
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ReturnZero_WhenOriginalValueIsZero() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(0.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("tariffTotal")); // 0 * 7.5 / 100 = 0
        assertEquals(0.0, result.get("finalValue")); // 0 + 0
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ReturnCorrectValue_WhenOriginalValueIsNegative() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act: Negative value should still calculate (though may not be realistic)
        Map<String, Object> result = calculatorService.calculateTariffedValue(-100.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(-7.5, result.get("tariffTotal")); // -100 * 7.5 / 100 = -7.5
        assertEquals(-107.5, result.get("finalValue")); // -100 + (-7.5)
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ThrowException_WhenInvalidDateFormatProvided() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "invalid-date"));

        assertTrue(exception.getMessage().contains("Query date must be a valid date") ||
                   exception.getMessage().contains("format YYYY-MM-DD"));
        verify(tariffRepository, never()).findActiveTariffsByFilters(anyString(), anyString(), anyString(), any(), any());
    }

    @Test
    public void should_ReturnDeterministicResult_WhenSameInputsRepeated() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act: Call with same inputs twice
        Map<String, Object> result1 = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");
        Map<String, Object> result2 = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Results should be identical
        assertEquals(result1.get("tariffTotal"), result2.get("tariffTotal"));
        assertEquals(result1.get("finalValue"), result2.get("finalValue"));
        assertEquals(result1.get("appliedTariffs"), result2.get("appliedTariffs"));
    }

    @Test
    public void should_CalculateCorrectly_WhenMultipleRatesProvided() {
        // Arrange: Create another tariff with different rate
        Tariff tariff2 = new Tariff();
        tariff2.setId(3L);
        tariff2.setHsCode(testHsCode);
        tariff2.setOriginCountry(testOriginCountry);
        tariff2.setDestCountry(testDestCountry);
        tariff2.setTariffType("Reduced");
        tariff2.setStandardRate(5.0);
        tariff2.setFlatFee(null);
        tariff2.setEffectiveDate(LocalDate.of(2025, 1, 1));

        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate); // 7.5%
        tariffs.add(tariff2); // 5.0%
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(125.0, result.get("tariffTotal")); // (1000 * 7.5 / 100) + (1000 * 5.0 / 100) = 75 + 50
        assertEquals(1125.0, result.get("finalValue")); // 1000 + 125
        assertEquals(2, ((List<?>) result.get("appliedTariffs")).size());
    }

    @Test
    public void should_CalculateCorrectly_WhenMultipleFeesProvided() {
        // Arrange: Create another tariff with different fee
        Tariff tariff2 = new Tariff();
        tariff2.setId(3L);
        tariff2.setHsCode(testHsCode);
        tariff2.setOriginCountry(testOriginCountry);
        tariff2.setDestCountry(testDestCountry);
        tariff2.setTariffType("Additional");
        tariff2.setStandardRate(null);
        tariff2.setFlatFee(25.0);
        tariff2.setEffectiveDate(LocalDate.of(2025, 1, 1));

        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithFee); // 50.0
        tariffs.add(tariff2); // 25.0
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(75.0, result.get("tariffTotal")); // 50 + 25
        assertEquals(1075.0, result.get("finalValue")); // 1000 + 75
        assertEquals(2, ((List<?>) result.get("appliedTariffs")).size());
    }

    @Test
    public void should_HandleLargeValues_WhenCalculating() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act: Large value
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(75000.0, result.get("tariffTotal")); // 1000000 * 7.5 / 100
        assertEquals(1075000.0, result.get("finalValue")); // 1000000 + 75000
    }

    @Test
    public void should_HandleSmallDecimalValues_WhenCalculating() {
        // Arrange: Mock repository to return tariff with rate
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act: Small decimal value
        Map<String, Object> result = calculatorService.calculateTariffedValue(0.01, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.00075, (Double) result.get("tariffTotal"), 0.000001); // 0.01 * 7.5 / 100
        assertEquals(0.01075, (Double) result.get("finalValue"), 0.000001); // 0.01 + 0.00075
    }

    @Test
    public void should_ThrowException_WhenDateIsNull() {
        // Note: This test checks behavior when dateStr is null (though method signature requires non-null)
        // In practice, Spring will validate @RequestParam, but we test the service logic
        // LocalDate.parse(null) throws NullPointerException, which might be caught and rethrown
        Exception exception = assertThrows(Exception.class, () ->
            calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", null));

        // Should throw either RuntimeException or NullPointerException
        assertTrue(exception instanceof RuntimeException || exception instanceof NullPointerException);
    }

    @Test
    public void should_ThrowException_WhenDateIsEmpty() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", ""));

        assertTrue(exception.getMessage().contains("Query date must be a valid date") ||
                   exception.getMessage().contains("format YYYY-MM-DD"));
    }

    @Test
    public void should_CalculateCorrectly_WhenRateIsZero() {
        // Arrange: Create tariff with zero rate
        Tariff zeroRateTariff = new Tariff();
        zeroRateTariff.setId(4L);
        zeroRateTariff.setHsCode(testHsCode);
        zeroRateTariff.setOriginCountry(testOriginCountry);
        zeroRateTariff.setDestCountry(testDestCountry);
        zeroRateTariff.setTariffType("Free");
        zeroRateTariff.setStandardRate(0.0);
        zeroRateTariff.setFlatFee(null);
        zeroRateTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));

        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(zeroRateTariff);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("tariffTotal")); // 1000 * 0 / 100 = 0
        assertEquals(1000.0, result.get("finalValue")); // 1000 + 0
    }

    @Test
    public void should_CalculateCorrectly_WhenFeeIsZero() {
        // Arrange: Create tariff with zero fee
        Tariff zeroFeeTariff = new Tariff();
        zeroFeeTariff.setId(5L);
        zeroFeeTariff.setHsCode(testHsCode);
        zeroFeeTariff.setOriginCountry(testOriginCountry);
        zeroFeeTariff.setDestCountry(testDestCountry);
        zeroFeeTariff.setTariffType("Free");
        zeroFeeTariff.setStandardRate(null);
        zeroFeeTariff.setFlatFee(0.0);
        zeroFeeTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));

        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(zeroFeeTariff);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", null, LocalDate.of(2025, 1, 1)))
                .thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("tariffTotal")); // Flat fee = 0
        assertEquals(1000.0, result.get("finalValue")); // 1000 + 0
    }

}
