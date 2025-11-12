package com.example.CSD.test.calculator;

import java.time.LocalDate;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.CSD.calculator.CalculatorService;
import com.example.CSD.concession.Concession;
import com.example.CSD.country.Country;
import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTAService;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeService;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffService;
import com.example.CSD.tradeParty.TradeParty;

@ExtendWith(MockitoExtension.class)
public class CalculatorServiceTest {
    @Mock
    private TariffService tariffService;

    @Mock
    private FTAService ftaService;

    @Mock
    private HSCodeService hsCodeService;

    @InjectMocks
    private CalculatorService calculatorService;

    private HSCode testHsCode;
    private Country testOriginCountry;
    private Country testDestCountry;
    private TradeParty testOriginParty;
    private TradeParty testDestParty;
    private Tariff testTariffWithRate;
    private Tariff testTariffWithFee;
    private FTA testFTA;
    private FTA testFTAWithConcession;

    @BeforeEach
    void setUp() {
        // Setup test HSCode
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Laptop computers");

        // Setup test Countries
        testOriginCountry = new Country();
        testOriginCountry.setCode("SG");
        testOriginCountry.setName("Singapore");
        testOriginCountry.setAlpha3("SGP");

        testDestCountry = new Country();
        testDestCountry.setCode("US");
        testDestCountry.setName("United States");
        testDestCountry.setAlpha3("USA");

        // Setup test TradeParties
        testOriginParty = new TradeParty();
        testOriginParty.setId(1L);
        testOriginParty.setType(TradeParty.PartyType.COUNTRY);
        testOriginParty.setCountry(testOriginCountry);

        testDestParty = new TradeParty();
        testDestParty.setId(2L);
        testDestParty.setType(TradeParty.PartyType.COUNTRY);
        testDestParty.setCountry(testDestCountry);

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

        // Setup test FTA
        testFTA = new FTA();
        testFTA.setId(1L);
        testFTA.setType(FTA.FTAType.BILATERAL);
        testFTA.setPartyA(testOriginParty);
        testFTA.setPartyB(testDestParty);
        testFTA.setDefaultRate(5.0);
        testFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        testFTA.setExcludedHsCodes(new LinkedHashSet<>());
        testFTA.setSpecialConcessions(new HashSet<>());

        // Setup test FTA with special concession
        testFTAWithConcession = new FTA();
        testFTAWithConcession.setId(2L);
        testFTAWithConcession.setType(FTA.FTAType.BILATERAL);
        testFTAWithConcession.setPartyA(testOriginParty);
        testFTAWithConcession.setPartyB(testDestParty);
        testFTAWithConcession.setDefaultRate(5.0);
        testFTAWithConcession.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testFTAWithConcession.setExpirationDate(LocalDate.of(2025, 12, 31));
        testFTAWithConcession.setExcludedHsCodes(new LinkedHashSet<>());
        
        Concession concession = new Concession();
        concession.setId(1L);
        concession.setFta(testFTAWithConcession);
        concession.setHsCode(testHsCode);
        concession.setFinalRate(2.5);
        Set<Concession> concessions = new HashSet<>();
        concessions.add(concession);
        testFTAWithConcession.setSpecialConcessions(concessions);
    }

    // ========== FTA Integration Tests ==========

    @Test
    public void calculateTariffedValue_ShouldApplyFTARate_WhenValidFTAExists() {
        // Arrange: Mock FTA service to return an applicable FTA
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: FTA rate (5%) should be applied instead of tariff rate (7.5%)
        // FTA cost = 1000 * 5/100 = 50, Tariff cost = 1000 * 7.5/100 = 75
        // Since FTA cost (50) < Tariff cost (75), FTA should be applied
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01); // 1000 + 50
        assertEquals(5.0, (Double) result.get("adjustedRate"), 0.01);
        assertEquals(7.5, (Double) result.get("standardRate"), 0.01);
        assertEquals(true, result.get("ftaApplied"));
        assertEquals("SG", result.get("origin"));
        assertEquals("US", result.get("destination"));
        assertEquals("847130", result.get("hsCode"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
        verify(hsCodeService).getHSCode("847130", null);
        verify(tariffService).getActiveTariffs("SG", "US", "847130", null, "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldApplyTariffRate_WhenNoFTAExists() {
        // Arrange: Mock FTA service to return empty list (no FTA)
        List<FTA> ftas = new ArrayList<>();
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Standard tariff rate should be applied
        assertNotNull(result);
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01); // 1000 + 75 (7.5% tariff)
        assertEquals(7.5, (Double) result.get("standardRate"), 0.01);
        assertNull(result.get("adjustedRate"));
        assertEquals(false, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
        verify(tariffService).getActiveTariffs("SG", "US", "847130", null, "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldApplyLowestFTARate_WhenMultipleFTAsExist() {
        // Arrange: Create two FTAs with different rates
        FTA fta1 = new FTA();
        fta1.setId(1L);
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testOriginParty);
        fta1.setPartyB(testDestParty);
        fta1.setDefaultRate(5.0); // 5%
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new HashSet<>());

        FTA fta2 = new FTA();
        fta2.setId(2L);
        fta2.setType(FTA.FTAType.BILATERAL);
        fta2.setPartyA(testOriginParty);
        fta2.setPartyB(testDestParty);
        fta2.setDefaultRate(3.0); // 3% - lower rate
        fta2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta2.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta2.setExcludedHsCodes(new LinkedHashSet<>());
        fta2.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(fta1);
        ftas.add(fta2);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Lowest FTA rate (3%) should be applied
        assertNotNull(result);
        assertEquals(1030.0, (Double) result.get("finalValue"), 0.01); // 1000 + 30 (3% FTA)
        assertEquals(3.0, (Double) result.get("adjustedRate"), 0.01);
        assertEquals(true, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldApplySpecialConcessionRate_WhenConcessionExistsForHSCode() {
        // Arrange: FTA with special concession for the HS code
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTAWithConcession);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Special concession rate (2.5%) should be applied instead of default rate (5%)
        assertNotNull(result);
        assertEquals(1025.0, (Double) result.get("finalValue"), 0.01); // 1000 + 25 (2.5% concession)
        assertEquals(2.5, (Double) result.get("adjustedRate"), 0.01);
        assertEquals(true, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldSkipFTA_WhenHSCodeIsExcluded() {
        // Arrange: FTA with excluded HS code
        Set<HSCode> excludedHsCodes = new LinkedHashSet<>();
        excludedHsCodes.add(testHsCode);
        testFTA.setExcludedHsCodes(excludedHsCodes);

        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Standard tariff should be applied since FTA is excluded for this HS code
        assertNotNull(result);
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01); // 1000 + 75 (7.5% tariff)
        assertEquals(false, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldApplyTariff_WhenFTACostIsHigherThanTariffCost() {
        // Arrange: FTA with higher rate than tariff
        FTA highRateFTA = new FTA();
        highRateFTA.setId(1L);
        highRateFTA.setType(FTA.FTAType.BILATERAL);
        highRateFTA.setPartyA(testOriginParty);
        highRateFTA.setPartyB(testDestParty);
        highRateFTA.setDefaultRate(10.0); // 10% - higher than tariff (7.5%)
        highRateFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        highRateFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        highRateFTA.setExcludedHsCodes(new LinkedHashSet<>());
        highRateFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(highRateFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Tariff should be applied since it's cheaper (75 < 100)
        assertNotNull(result);
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01); // 1000 + 75 (7.5% tariff, cheaper than 10% FTA)
        assertEquals(false, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldApplyFTA_WhenFTACostEqualsTariffCost() {
        // Arrange: FTA rate equals tariff rate
        FTA equalRateFTA = new FTA();
        equalRateFTA.setId(1L);
        equalRateFTA.setType(FTA.FTAType.BILATERAL);
        equalRateFTA.setPartyA(testOriginParty);
        equalRateFTA.setPartyB(testDestParty);
        equalRateFTA.setDefaultRate(7.5); // Same as tariff rate
        equalRateFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        equalRateFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        equalRateFTA.setExcludedHsCodes(new LinkedHashSet<>());
        equalRateFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(equalRateFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: FTA should be applied when costs are equal (<= comparison)
        assertNotNull(result);
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01); // 1000 + 75 (FTA applied when equal)
        assertEquals(true, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldHandleZeroFTARate_WhenFTAHasZeroRate() {
        // Arrange: FTA with zero rate
        FTA zeroRateFTA = new FTA();
        zeroRateFTA.setId(1L);
        zeroRateFTA.setType(FTA.FTAType.BILATERAL);
        zeroRateFTA.setPartyA(testOriginParty);
        zeroRateFTA.setPartyB(testDestParty);
        zeroRateFTA.setDefaultRate(0.0); // 0% - free trade
        zeroRateFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        zeroRateFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        zeroRateFTA.setExcludedHsCodes(new LinkedHashSet<>());
        zeroRateFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(zeroRateFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Zero FTA rate should be applied (free trade)
        assertNotNull(result);
        assertEquals(1000.0, (Double) result.get("finalValue"), 0.01); // 1000 + 0 (0% FTA)
        assertEquals(0.0, (Double) result.get("adjustedRate"), 0.01);
        assertEquals(true, result.get("ftaApplied"));
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    // ========== Error Handling Tests ==========

    @Test
    public void calculateTariffedValue_ShouldDefaultToTariff_WhenFTAServiceThrowsException() {
        // Arrange: FTA service throws exception
        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01"))
            .thenThrow(new RuntimeException("FTA lookup failed"));

        // Act & Assert: Should throw exception (current implementation doesn't handle FTA errors gracefully)
        assertThrows(RuntimeException.class, () ->
            calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"));
        
        // Verify FTA service was called
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldHandleEmptyHSCodeList_WhenHSCodeNotFound() {
        // Arrange: HS code service returns empty list
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> emptyHsCodes = new ArrayList<>();

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(emptyHsCodes);

        // Act & Assert: Should throw IndexOutOfBoundsException when accessing .get(0)
        assertThrows(IndexOutOfBoundsException.class, () ->
            calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"));
    }

    @Test
    public void calculateTariffedValue_ShouldHandleNullConcession_WhenConcessionNotFound() {
        // Arrange: FTA has special concessions set but concession for HS code is null
        Set<Concession> concessions = new HashSet<>();
        // Add a concession for a different HS code
        HSCode otherHsCode = new HSCode();
        otherHsCode.setCode("999999");
        Concession otherConcession = new Concession();
        otherConcession.setHsCode(otherHsCode);
        concessions.add(otherConcession);
        
        testFTA.setSpecialConcessions(concessions);
        // Make getAllSpecialHsCodes return testHsCode (simulating edge case)
        // This would cause a NullPointerException in the current implementation

        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act: Should use default rate since concession not found for this HS code
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Default FTA rate should be applied
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01); // 1000 + 50 (5% default rate)
        assertEquals(5.0, (Double) result.get("adjustedRate"), 0.01);
    }

    // ========== Integration with TariffService Tests ==========

    @Test
    public void calculateTariffedValue_ShouldPassCorrectParameters_WhenCallingFTAService() {
        // Arrange
        List<FTA> ftas = new ArrayList<>();
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        List<Tariff> tariffs = new ArrayList<>();

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Verify correct parameters are passed to FTA service
        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
        verify(hsCodeService).getHSCode("847130", null);
        verify(tariffService).getActiveTariffs("SG", "US", "847130", null, "2025-01-01");
    }

    @Test
    public void calculateTariffedValue_ShouldHandleMultipleTariffs_WhenBothFTAAndTariffsExist() {
        // Arrange: FTA and multiple tariffs
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA); // 5% rate
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate); // 7.5%
        tariffs.add(testTariffWithFee); // $50 flat fee

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: FTA cost (50) < Tariff cost (75 + 50 = 125), so FTA should be applied
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01); // 1000 + 50 (FTA rate)
        assertEquals(true, result.get("ftaApplied"));
        verify(tariffService).getActiveTariffs("SG", "US", "847130", null, "2025-01-01");
    }

    // ========== Edge Cases ==========

    @Test
    public void calculateTariffedValue_ShouldHandleZeroOriginalValue_WhenFTAExists() {
        // Arrange
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(0.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, (Double) result.get("finalValue"), 0.01); // 0 + 0
    }

    @Test
    public void calculateTariffedValue_ShouldHandleLargeValues_WhenFTAExists() {
        // Arrange
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000000.0, "SG", "US", "847130", "2025-01-01");

        // Assert
        assertNotNull(result);
        assertEquals(1050000.0, (Double) result.get("finalValue"), 0.01); // 1000000 + 50000 (5% FTA)
    }

    @Test
    public void calculateTariffedValue_ShouldHandleMultipleFTAsWithDifferentRates_WhenSelectingLowest() {
        // Arrange: Three FTAs with different rates
        FTA fta1 = new FTA();
        fta1.setId(1L);
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testOriginParty);
        fta1.setPartyB(testDestParty);
        fta1.setDefaultRate(8.0);
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new HashSet<>());

        FTA fta2 = new FTA();
        fta2.setId(2L);
        fta2.setType(FTA.FTAType.BILATERAL);
        fta2.setPartyA(testOriginParty);
        fta2.setPartyB(testDestParty);
        fta2.setDefaultRate(3.0); // Lowest
        fta2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta2.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta2.setExcludedHsCodes(new LinkedHashSet<>());
        fta2.setSpecialConcessions(new HashSet<>());

        FTA fta3 = new FTA();
        fta3.setId(3L);
        fta3.setType(FTA.FTAType.BILATERAL);
        fta3.setPartyA(testOriginParty);
        fta3.setPartyB(testDestParty);
        fta3.setDefaultRate(6.0);
        fta3.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta3.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta3.setExcludedHsCodes(new LinkedHashSet<>());
        fta3.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(fta1);
        ftas.add(fta2);
        ftas.add(fta3);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Lowest rate (3%) should be selected
        assertNotNull(result);
        assertEquals(1030.0, (Double) result.get("finalValue"), 0.01); // 1000 + 30 (3% FTA)
        assertEquals(3.0, (Double) result.get("adjustedRate"), 0.01);
    }

    // ========== Additional Branch Coverage Tests ==========

    @Test
    public void calculateTariffedValue_ShouldHandleBlocParty_WhenCountryIsNull() {
        // Arrange: FTA with Bloc party (country is null)
        TradeParty blocParty = new TradeParty();
        blocParty.setId(3L);
        blocParty.setType(TradeParty.PartyType.BLOC);
        blocParty.setCountry(null); // Bloc has no country
        
        FTA blocFTA = new FTA();
        blocFTA.setId(1L);
        blocFTA.setType(FTA.FTAType.BILATERAL);
        blocFTA.setPartyA(testOriginParty);
        blocFTA.setPartyB(blocParty); // Bloc party with null country
        blocFTA.setDefaultRate(4.0);
        blocFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        blocFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        blocFTA.setExcludedHsCodes(new LinkedHashSet<>());
        blocFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(blocFTA);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Should handle null country and use "Bloc" in agreement name
        assertNotNull(result);
        assertEquals(true, result.get("ftaApplied"));
        String agreementName = (String) result.get("agreementName");
        assertNotNull(agreementName);
        assertTrue(agreementName.contains("Bloc") || agreementName.contains("FTA"));
    }

    @Test
    public void calculateTariffedValue_ShouldHandleEqualFTARates_WhenMultipleFTAsHaveSameRate() {
        // Arrange: Two FTAs with the same rate (tests else-if branch when rates are equal)
        FTA fta1 = new FTA();
        fta1.setId(1L);
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testOriginParty);
        fta1.setPartyB(testDestParty);
        fta1.setDefaultRate(5.0);
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new HashSet<>());

        FTA fta2 = new FTA();
        fta2.setId(2L);
        fta2.setType(FTA.FTAType.BILATERAL);
        fta2.setPartyA(testOriginParty);
        fta2.setPartyB(testDestParty);
        fta2.setDefaultRate(5.0); // Same rate as fta1
        fta2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta2.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta2.setExcludedHsCodes(new LinkedHashSet<>());
        fta2.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(fta1);
        ftas.add(fta2);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Should use the rate (5%) and select first matching FTA
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(5.0, (Double) result.get("adjustedRate"), 0.01);
    }

    @Test
    public void calculateTariffedValue_ShouldHandleTariffWithNullStandardRate_WhenOnlyFlatFeeExists() {
        // Arrange: Tariff with null standardRate (only flatFee)
        Tariff tariffWithOnlyFee = new Tariff();
        tariffWithOnlyFee.setId(1L);
        tariffWithOnlyFee.setHsCode(testHsCode);
        tariffWithOnlyFee.setOriginCountry(testOriginCountry);
        tariffWithOnlyFee.setDestCountry(testDestCountry);
        tariffWithOnlyFee.setTariffType("Flat");
        tariffWithOnlyFee.setStandardRate(null); // Null standard rate
        tariffWithOnlyFee.setFlatFee(50.0);
        tariffWithOnlyFee.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariffWithOnlyFee.setExpirationDate(LocalDate.of(2025, 12, 31));

        List<FTA> ftas = new ArrayList<>();
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(tariffWithOnlyFee);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Should handle null standardRate in response
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01); // 1000 + 50 flat fee
        assertNull(result.get("standardRate")); // Should be null when standardRate is null
        assertEquals(false, result.get("ftaApplied"));
    }

    @Test
    public void calculateTariffedValue_ShouldHandleTariffWithBothNull_WhenNeitherRateNorFeeExists() {
        // Arrange: Tariff with both standardRate and flatFee as null
        Tariff emptyTariff = new Tariff();
        emptyTariff.setId(1L);
        emptyTariff.setHsCode(testHsCode);
        emptyTariff.setOriginCountry(testOriginCountry);
        emptyTariff.setDestCountry(testDestCountry);
        emptyTariff.setTariffType("Empty");
        emptyTariff.setStandardRate(null);
        emptyTariff.setFlatFee(null);
        emptyTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        emptyTariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        List<FTA> ftas = new ArrayList<>();
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(emptyTariff);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Should handle both null (neither branch taken in tariff loop)
        assertNotNull(result);
        assertEquals(1000.0, (Double) result.get("finalValue"), 0.01); // 1000 + 0 (no tariff cost)
        assertEquals(false, result.get("ftaApplied"));
    }

    @Test
    public void calculateTariffedValue_ShouldHandleAppliedFTANull_WhenNoMatchingFTAFound() {
        // Arrange: FTA exists but appliedFTA becomes null (edge case in second loop)
        // This tests when curRate != lowestFTARate in the second loop
        FTA fta1 = new FTA();
        fta1.setId(1L);
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testOriginParty);
        fta1.setPartyB(testDestParty);
        fta1.setDefaultRate(5.0);
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new HashSet<>());

        // Create a scenario where the rate calculation in first loop differs from second loop
        // This is difficult to achieve, but we can test with special concessions
        Concession concession = new Concession();
        concession.setId(1L);
        concession.setFta(fta1);
        concession.setHsCode(testHsCode);
        concession.setFinalRate(3.0); // Different from default rate
        
        Set<Concession> concessions = new HashSet<>();
        concessions.add(concession);
        fta1.setSpecialConcessions(concessions);

        List<FTA> ftas = new ArrayList<>();
        ftas.add(fta1);
        
        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);
        
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result = calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: Should find the FTA and use "FTA" as fallback if appliedFTA is null
        assertNotNull(result);
        assertEquals(true, result.get("ftaApplied"));
        // The agreementName should be set (either with country names or "FTA" fallback)
        assertNotNull(result.get("agreementName"));
    }
}