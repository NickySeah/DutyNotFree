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

import com.example.CSD.bloc.Bloc;
import com.example.CSD.calculator.CalculatorServiceImpl;
import com.example.CSD.concession.Concession;
import com.example.CSD.country.Country;
import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTAServiceImpl;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeServiceImpl;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffServiceImpl;
import com.example.CSD.tradeParty.TradeParty;

@ExtendWith(MockitoExtension.class)
public class CalculatorServiceTest {
    @Mock
    private TariffServiceImpl tariffService;

    @Mock
    private FTAServiceImpl ftaService;

    @Mock
    private HSCodeServiceImpl hsCodeService;

    @InjectMocks
    private CalculatorServiceImpl calculatorService;

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
        // HS code
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Laptop computers");

        // Countries
        testOriginCountry = new Country();
        testOriginCountry.setCode("SG");
        testOriginCountry.setName("Singapore");
        testOriginCountry.setAlpha3("SGP");

        testDestCountry = new Country();
        testDestCountry.setCode("US");
        testDestCountry.setName("United States");
        testDestCountry.setAlpha3("USA");

        // Trade parties
        testOriginParty = new TradeParty();
        testOriginParty.setId(1L);
        testOriginParty.setType(TradeParty.PartyType.COUNTRY);
        testOriginParty.setCountry(testOriginCountry);

        testDestParty = new TradeParty();
        testDestParty.setId(2L);
        testDestParty.setType(TradeParty.PartyType.COUNTRY);
        testDestParty.setCountry(testDestCountry);

        // Tariff with ad-valorem rate
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

        // Tariff with flat fee
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

        // FTA default
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

        // FTA with special concession
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

    // ========= Basic behaviour: FTA vs Tariff =========

    @Test
    public void calculateTariffedValue_ShouldUseFTA_WhenFTACheaperThanTariff() {
        // FTA 5%, Tariff 7.5% => choose FTA
        List<FTA> ftas = List.of(testFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // FTA cost = 50, Tariff cost = 75 → additional cost should be 50
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(50.0, (Double) result.get("tariffTotal"), 0.01);

        @SuppressWarnings("unchecked")
        Map<String, Object> appliedFTA = (Map<String, Object>) result.get("appliedFTA");
        assertNotNull(appliedFTA); // FTA selected

        @SuppressWarnings("unchecked")
        List<Tariff> appliedTariffs = (List<Tariff>) result.get("appliedTariffs");
        assertEquals(1, appliedTariffs.size()); // still returned for info
    }

    @Test
    public void calculateTariffedValue_ShouldUseTariff_WhenNoFTAExists() {
        List<FTA> ftas = Collections.emptyList();
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Tariff cost = 75
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(75.0, (Double) result.get("tariffTotal"), 0.01);

        assertNull(result.get("appliedFTA"));
        @SuppressWarnings("unchecked")
        List<Tariff> appliedTariffs = (List<Tariff>) result.get("appliedTariffs");
        assertEquals(1, appliedTariffs.size());
    }

    @Test
    public void calculateTariffedValue_ShouldPickLowestFTARate_WhenMultipleFTAsExist() {
        FTA fta1 = new FTA();
        fta1.setId(10L);
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testOriginParty);
        fta1.setPartyB(testDestParty);
        fta1.setDefaultRate(5.0);
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new HashSet<>());

        FTA fta2 = new FTA();
        fta2.setId(11L);
        fta2.setType(FTA.FTAType.BILATERAL);
        fta2.setPartyA(testOriginParty);
        fta2.setPartyB(testDestParty);
        fta2.setDefaultRate(3.0); // lowest
        fta2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta2.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta2.setExcludedHsCodes(new LinkedHashSet<>());
        fta2.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = List.of(fta1, fta2);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // 3% is cheapest: additional cost 30
        assertEquals(1030.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(30.0, (Double) result.get("tariffTotal"), 0.01);
    }

    @Test
    public void calculateTariffedValue_ShouldUseConcessionRate_WhenConcessionExists() {
        List<FTA> ftas = List.of(testFTAWithConcession); // 2.5% via concession
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // 2.5% FTA is cheaper than 7.5% tariff: 25
        assertEquals(1025.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(25.0, (Double) result.get("tariffTotal"), 0.01);
    }

    @Test
    public void calculateTariffedValue_ShouldSkipFTA_WhenHSCodeExcluded() {
        Set<HSCode> excluded = new LinkedHashSet<>();
        excluded.add(testHsCode);
        testFTA.setExcludedHsCodes(excluded);

        List<FTA> ftas = List.of(testFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // FTA skipped → only 7.5% tariff
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01);
        assertNull(result.get("appliedFTA"));
    }

    @Test
    public void calculateTariffedValue_ShouldUseTariff_WhenFTACostHigher() {
        // FTA 10% vs tariff 7.5% → choose tariff
        FTA highRateFTA = new FTA();
        highRateFTA.setId(20L);
        highRateFTA.setType(FTA.FTAType.BILATERAL);
        highRateFTA.setPartyA(testOriginParty);
        highRateFTA.setPartyB(testDestParty);
        highRateFTA.setDefaultRate(10.0);
        highRateFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        highRateFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        highRateFTA.setExcludedHsCodes(new LinkedHashSet<>());
        highRateFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = List.of(highRateFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // 10% (100) vs 7.5% (75) → use 75
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(75.0, (Double) result.get("tariffTotal"), 0.01);
        assertNull(result.get("appliedFTA"));
    }

    @Test
    public void calculateTariffedValue_ShouldUseFTA_WhenFTACostEqualsTariffCost() {
        // FTA 7.5% == tariff 7.5% → FTA wins because of <=
        FTA equalFTA = new FTA();
        equalFTA.setId(21L);
        equalFTA.setType(FTA.FTAType.BILATERAL);
        equalFTA.setPartyA(testOriginParty);
        equalFTA.setPartyB(testDestParty);
        equalFTA.setDefaultRate(7.5);
        equalFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        equalFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        equalFTA.setExcludedHsCodes(new LinkedHashSet<>());
        equalFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = List.of(equalFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Both 75 → FTA chosen
        assertEquals(1075.0, (Double) result.get("finalValue"), 0.01);
        @SuppressWarnings("unchecked")
        Map<String, Object> appliedFTA = (Map<String, Object>) result.get("appliedFTA");
        assertNotNull(appliedFTA);
    }

    @Test
    public void calculateTariffedValue_ShouldHandleZeroFTARate() {
        FTA zeroFTA = new FTA();
        zeroFTA.setId(22L);
        zeroFTA.setType(FTA.FTAType.BILATERAL);
        zeroFTA.setPartyA(testOriginParty);
        zeroFTA.setPartyB(testDestParty);
        zeroFTA.setDefaultRate(0.0);
        zeroFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        zeroFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        zeroFTA.setExcludedHsCodes(new LinkedHashSet<>());
        zeroFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = List.of(zeroFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        assertEquals(1000.0, (Double) result.get("finalValue"), 0.01); // free trade
        assertEquals(0.0, (Double) result.get("tariffTotal"), 0.01);
    }

    // ========= Error / edge handling =========

    @Test
    public void calculateTariffedValue_ShouldPropagateException_WhenFTAServiceFails() {
        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01"))
                .thenThrow(new RuntimeException("FTA lookup failed"));

        assertThrows(RuntimeException.class, () ->
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"));
    }

    @Test
    public void calculateTariffedValue_ShouldThrow_WhenHSCodeNotFound_ListEmpty() {
        List<FTA> ftas = List.of(testFTA);
        List<HSCode> empty = Collections.emptyList();

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(empty);

        assertThrows(IndexOutOfBoundsException.class, () ->
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01"));
    }

    @Test
    public void calculateTariffedValue_ShouldCallAllDependencies_WithCorrectParams() {
        List<FTA> ftas = Collections.emptyList();
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = Collections.emptyList();

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        verify(ftaService).getActiveFTA(null, "SG", "US", "2025-01-01");
        verify(hsCodeService).getHSCode("847130", null);
        verify(tariffService).getActiveTariffs("SG", "US", "847130", null, "2025-01-01");
    }

    // ========= Tariff variations =========

    @Test
    public void calculateTariffedValue_ShouldWorkWithFlatFeeOnlyTariff() {
        Tariff feeOnly = new Tariff();
        feeOnly.setId(30L);
        feeOnly.setHsCode(testHsCode);
        feeOnly.setOriginCountry(testOriginCountry);
        feeOnly.setDestCountry(testDestCountry);
        feeOnly.setTariffType("Flat");
        feeOnly.setStandardRate(null);
        feeOnly.setFlatFee(50.0);
        feeOnly.setEffectiveDate(LocalDate.of(2025, 1, 1));
        feeOnly.setExpirationDate(LocalDate.of(2025, 12, 31));

        List<FTA> ftas = Collections.emptyList();
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(feeOnly);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(50.0, (Double) result.get("tariffTotal"), 0.01);
    }

    @Test
    public void calculateTariffedValue_ShouldIgnoreTariff_WhenBothRateAndFeeNull() {
        Tariff emptyTariff = new Tariff();
        emptyTariff.setId(31L);
        emptyTariff.setHsCode(testHsCode);
        emptyTariff.setOriginCountry(testOriginCountry);
        emptyTariff.setDestCountry(testDestCountry);
        emptyTariff.setTariffType("Empty");
        emptyTariff.setStandardRate(null);
        emptyTariff.setFlatFee(null);
        emptyTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        emptyTariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        List<FTA> ftas = Collections.emptyList();
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(emptyTariff);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Tariff contributes 0
        assertEquals(1000.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(0.0, (Double) result.get("tariffTotal"), 0.01);
    }

    // ========= A couple of simple value-scale checks =========

    @Test
    public void calculateTariffedValue_ShouldHandleZeroOriginalValue() {
        List<FTA> ftas = List.of(testFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(0.0, "SG", "US", "847130", "2025-01-01");

        assertEquals(0.0, (Double) result.get("finalValue"), 0.01);
    }

    @Test
    public void calculateTariffedValue_ShouldHandleLargeOriginalValue() {
        List<FTA> ftas = List.of(testFTA); // 5%
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1_000_000.0, "SG", "US", "847130", "2025-01-01");

        // 5% of 1,000,000 = 50,000
        assertEquals(1_050_000.0, (Double) result.get("finalValue"), 0.01);
    }

    // ========= Bloc coverage (TradeParty.getName() for BLOC) =========

    @Test
    public void calculateTariffedValue_ShouldHandleBlocPartyName() {
        TradeParty blocParty = new TradeParty();
        blocParty.setId(100L);
        blocParty.setType(TradeParty.PartyType.BLOC);

        Bloc bloc = new Bloc();
        bloc.setName("ASEAN");
        bloc.setTradeParty(blocParty);
        blocParty.setBloc(bloc);

        FTA blocFTA = new FTA();
        blocFTA.setId(101L);
        blocFTA.setType(FTA.FTAType.BILATERAL);
        blocFTA.setPartyA(testOriginParty);
        blocFTA.setPartyB(blocParty);
        blocFTA.setDefaultRate(4.0);
        blocFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        blocFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        blocFTA.setExcludedHsCodes(new LinkedHashSet<>());
        blocFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = List.of(blocFTA);
        List<HSCode> hsCodes = List.of(testHsCode);
        List<Tariff> tariffs = List.of(testTariffWithRate);

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        assertNotNull(result);

        @SuppressWarnings("unchecked")
        Map<String, Object> appliedFTA = (Map<String, Object>) result.get("appliedFTA");
        assertNotNull(appliedFTA);
        assertEquals("ASEAN", appliedFTA.get("partyB")); // TradeParty.getName() used bloc.getName()
    }

    @Test
    public void calculateTariffedValue_ShouldUseOnlyFTA_WhenNoTariffsExist() {
        // Arrange: one valid FTA, but NO tariffs
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);  // defaultRate = 5%

        List<HSCode> hsCodes = new ArrayList<>();
        hsCodes.add(testHsCode);

        List<Tariff> tariffs = new ArrayList<>(); // empty → hasTariffs = false

        when(ftaService.getActiveFTA(null, "SG", "US", "2025-01-01")).thenReturn(ftas);
        when(hsCodeService.getHSCode("847130", null)).thenReturn(hsCodes);
        when(tariffService.getActiveTariffs("SG", "US", "847130", null, "2025-01-01")).thenReturn(tariffs);

        // Act
        Map<String, Object> result =
                calculatorService.calculateTariffedValue(1000.0, "SG", "US", "847130", "2025-01-01");

        // Assert: only FTA applied (5% of 1000 = 50)
        assertNotNull(result);
        assertEquals(1050.0, (Double) result.get("finalValue"), 0.01);
        assertEquals(50.0, (Double) result.get("tariffTotal"), 0.01);

        // appliedFTA should be non-null; appliedTariffs should be an empty list
        @SuppressWarnings("unchecked")
        Map<String, Object> appliedFTA = (Map<String, Object>) result.get("appliedFTA");
        assertNotNull(appliedFTA);

        @SuppressWarnings("unchecked")
        List<Tariff> appliedTariffs = (List<Tariff>) result.get("appliedTariffs");
        assertNotNull(appliedTariffs);
        assertTrue(appliedTariffs.isEmpty());
    }
}