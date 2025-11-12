package com.example.CSD.test.fta;

import java.time.LocalDate;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.concession.Concession;
import com.example.CSD.concession.ConcessionRepository;
import com.example.CSD.country.Country;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tradeParty.TradeParty;
import com.example.CSD.tradeParty.TradePartyRepository;
import com.example.CSD.fta.*;

@ExtendWith(MockitoExtension.class)
public class FTAServiceTest {
    @Mock
    private FTARepository agreements;

    @Mock
    private TradePartyRepository parties;

    @Mock
    private HSCodeRepository hsCodes;

    @Mock
    private ConcessionRepository concessions;

    @InjectMocks
    private FTAService ftaService;

    private TradeParty testPartyA;
    private TradeParty testPartyB;
    private Country testCountryA;
    private Country testCountryB;
    private HSCode testHsCode;
    private FTA testFTA;

    @BeforeEach
    public void setUp() {
        // Setup test Countries (using 3-digit numeric codes as per validateTradeParty logic)
        testCountryA = new Country();
        testCountryA.setCode("702"); // Singapore numeric code
        testCountryA.setName("Singapore");
        testCountryA.setAlpha3("SGP");

        testCountryB = new Country();
        testCountryB.setCode("840"); // United States numeric code
        testCountryB.setName("United States");
        testCountryB.setAlpha3("USA");

        // Setup test TradeParties
        testPartyA = new TradeParty();
        testPartyA.setId(1L);
        testPartyA.setType(TradeParty.PartyType.COUNTRY);
        testPartyA.setCountry(testCountryA);

        testPartyB = new TradeParty();
        testPartyB.setId(2L);
        testPartyB.setType(TradeParty.PartyType.COUNTRY);
        testPartyB.setCountry(testCountryB);

        // Setup test HSCode
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Laptop computers");

        // Setup test FTA
        testFTA = new FTA();
        testFTA.setId(1L);
        testFTA.setType(FTA.FTAType.BILATERAL);
        testFTA.setPartyA(testPartyA);
        testFTA.setPartyB(testPartyB);
        testFTA.setDefaultRate(5.0);
        testFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        testFTA.setExcludedHsCodes(new LinkedHashSet<>());
        testFTA.setSpecialConcessions(new HashSet<>());
    }

    // ========== getFTA() Tests ==========
    @Test
    public void listFTAs_ShouldReturnAllFTAs_WhenListFTAsCalled() {
        // Arrange
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        when(agreements.findAll()).thenReturn(ftas);

        // Act
        List<FTA> result = ftaService.listFTAs();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(5.0, result.get(0).getDefaultRate());
        verify(agreements).findAll();
    }

    @Test
    public void getFTAByID_ShouldReturnFTA_WhenGetFTAByIDCalled() {
        // Arrange
        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));

        // Act
        FTA result = ftaService.getFTAByID(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(5.0, result.getDefaultRate());
        verify(agreements).findById(1L);
    }

    @Test
    public void getFTAByID_ShouldThrowException_WhenFTANotFound() {
        // Arrange
        when(agreements.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getFTAByID(999L));

        assertTrue(exception.getMessage().contains("No FTA with id 999 exist"));
        verify(agreements).findById(999L);
    }


    @Test
    public void getFTA_ShouldReturnAllFTAs_WhenNoFiltersProvided() {
        // Arrange
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);
        when(agreements.findAll()).thenReturn(ftas);

        // Act
        List<FTA> result = ftaService.getFTA(null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAll();
    }

    @Test
    public void getFTA_ShouldFilterByType_WhenTypeProvided() {
        // Arrange
        List<FTA> bilateralFTAs = new ArrayList<>();
        bilateralFTAs.add(testFTA);
        when(agreements.findAllByType(FTA.FTAType.BILATERAL)).thenReturn(bilateralFTAs);

        // Act
        List<FTA> result = ftaService.getFTA("BILATERAL", null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAllByType(FTA.FTAType.BILATERAL);
    }

    @Test
    public void getFTA_ShouldThrowException_WhenInvalidTypeProvided() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getFTA("INVALID", null, null));

        assertTrue(exception.getMessage().contains("is not a valid FTA type"));
    }

    @Test
    public void getFTA_ShouldFilterByParties_WhenPartiesProvided() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act
        List<FTA> result = ftaService.getFTA(null, "702", "840");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(parties).findByCountryCode("702");
        verify(parties).findByCountryCode("840");
    }

    @Test
    public void getFTA_ShouldThrowException_WhenSamePartyProvided() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getFTA(null, "702", "702"));

        assertTrue(exception.getMessage().contains("Same country/bloc cannot have a FTA with itself"));
    }

    @Test
    public void getFTA_ShouldThrowException_WhenPartyNotFound() {
        // Arrange: "XX" is not 3 digits, so it will be treated as a bloc code
        when(parties.findByBlocCode("XX")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getFTA(null, "XX", null));

        assertTrue(exception.getMessage().contains("No country/bloc found with code: XX"));
    }

    @Test
    public void getFTA_ShouldFilterByTypeAndPartyA_WhenTypeAndPartyAProvided() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        
        List<FTA> bilateralFTAs = new ArrayList<>();
        bilateralFTAs.add(testFTA);
        when(agreements.findAllByType(FTA.FTAType.BILATERAL)).thenReturn(bilateralFTAs);

        // Act
        List<FTA> result = ftaService.getFTA("BILATERAL", "702", null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAllByType(FTA.FTAType.BILATERAL);
        verify(parties).findByCountryCode("702");
    }

    @Test
    public void getFTA_ShouldFilterByTypeAndPartyB_WhenTypeAndPartyBProvided() {
        // Arrange
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> bilateralFTAs = new ArrayList<>();
        bilateralFTAs.add(testFTA);
        when(agreements.findAllByType(FTA.FTAType.BILATERAL)).thenReturn(bilateralFTAs);

        // Act
        List<FTA> result = ftaService.getFTA("BILATERAL", null, "840");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAllByType(FTA.FTAType.BILATERAL);
        verify(parties).findByCountryCode("840");
    }

    @Test
    public void getFTA_ShouldFilterByPartyAOnly_WhenOnlyPartyAProvided() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act
        List<FTA> result = ftaService.getFTA(null, "702", null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAll();
        verify(parties).findByCountryCode("702");
    }

    @Test
    public void getFTA_ShouldFilterByPartyBOnly_WhenOnlyPartyBProvided() {
        // Arrange
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act
        List<FTA> result = ftaService.getFTA(null, null, "840");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(agreements).findAll();
        verify(parties).findByCountryCode("840");
    }

    @Test
    public void getFTA_ShouldFilterOutNonMatchingFTAs_WhenPartyDoesNotMatch() {
        // Arrange: Create a different FTA that won't match
        TradeParty otherParty = new TradeParty();
        otherParty.setId(3L);
        otherParty.setType(TradeParty.PartyType.COUNTRY);
        Country otherCountry = new Country();
        otherCountry.setCode("036"); // Australia
        otherCountry.setName("Australia");
        otherCountry.setAlpha3("AUS");
        otherParty.setCountry(otherCountry);

        FTA otherFTA = new FTA();
        otherFTA.setId(2L);
        otherFTA.setType(FTA.FTAType.BILATERAL);
        otherFTA.setPartyA(otherParty);
        otherFTA.setPartyB(testPartyB);
        otherFTA.setDefaultRate(3.0);
        otherFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        otherFTA.setExpirationDate(LocalDate.of(2025, 12, 31));

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        allFTAs.add(otherFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act: Filter by partyA = "702"
        List<FTA> result = ftaService.getFTA(null, "702", null);

        // Assert: Should only return testFTA, not otherFTA
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testFTA.getId(), result.get(0).getId());
    }

    @Test
    public void getFTA_ShouldReturnEmptyList_WhenNoFTAsMatchFilters() {
        // Arrange: Create a completely different party that won't match
        TradeParty differentParty = new TradeParty();
        differentParty.setId(3L);
        differentParty.setType(TradeParty.PartyType.COUNTRY);
        Country differentCountry = new Country();
        differentCountry.setCode("036"); // Australia
        differentCountry.setName("Australia");
        differentCountry.setAlpha3("AUS");
        differentParty.setCountry(differentCountry);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        
        List<FTA> allFTAs = new ArrayList<>();
        // Add an FTA with completely different parties
        FTA nonMatchingFTA = new FTA();
        nonMatchingFTA.setId(2L);
        nonMatchingFTA.setType(FTA.FTAType.BILATERAL);
        nonMatchingFTA.setPartyA(differentParty); // Different party
        nonMatchingFTA.setPartyB(differentParty); // Different party
        allFTAs.add(nonMatchingFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act: Filter by partyA = "702" but FTA has completely different parties
        List<FTA> result = ftaService.getFTA(null, "702", null);

        // Assert: Should return empty list
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    public void getFTA_ShouldMatchBlocMembership_ForPartyAWhenBlocContainsCountry() {
        // Arrange: Create a bloc that includes testCountryA
        TradeParty blocParty = new TradeParty();
        blocParty.setId(3L);
        blocParty.setType(TradeParty.PartyType.BLOC);

        Bloc bloc = new Bloc();
        bloc.setCode("ASEAN");
        bloc.setName("Association of Southeast Asian Nations");
        LinkedHashSet<Country> members = new LinkedHashSet<>();
        members.add(testCountryA);
        bloc.setMemberCountries(members);
        bloc.setTradeParty(blocParty);
        blocParty.setBloc(bloc);

        FTA blocFTA = new FTA();
        blocFTA.setId(3L);
        blocFTA.setType(FTA.FTAType.PLURILATERAL);
        blocFTA.setPartyA(blocParty);
        blocFTA.setPartyB(testPartyB);
        blocFTA.setDefaultRate(4.0);
        blocFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        blocFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        blocFTA.setExcludedHsCodes(new LinkedHashSet<>());
        blocFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(blocFTA);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(agreements.findAll()).thenReturn(ftas);

        // Act: Query by the country code that belongs to the bloc
        List<FTA> result = ftaService.getFTA(null, "702", null);

        // Assert: Bloc FTA should be matched via bloc membership
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(blocFTA.getId(), result.get(0).getId());
    }

    @Test
    public void getFTA_ShouldMatchBlocMembership_ForPartyBWhenBlocContainsCountry() {
        // Arrange: Create a bloc that includes testCountryB
        TradeParty blocParty = new TradeParty();
        blocParty.setId(4L);
        blocParty.setType(TradeParty.PartyType.BLOC);

        Bloc bloc = new Bloc();
        bloc.setCode("USMCA");
        bloc.setName("United States-Mexico-Canada Agreement");
        LinkedHashSet<Country> members = new LinkedHashSet<>();
        members.add(testCountryB);
        bloc.setMemberCountries(members);
        bloc.setTradeParty(blocParty);
        blocParty.setBloc(bloc);

        FTA blocFTA = new FTA();
        blocFTA.setId(4L);
        blocFTA.setType(FTA.FTAType.PLURILATERAL);
        blocFTA.setPartyA(testPartyA);
        blocFTA.setPartyB(blocParty);
        blocFTA.setDefaultRate(3.0);
        blocFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        blocFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        blocFTA.setExcludedHsCodes(new LinkedHashSet<>());
        blocFTA.setSpecialConcessions(new HashSet<>());

        List<FTA> ftas = new ArrayList<>();
        ftas.add(blocFTA);

        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(agreements.findAll()).thenReturn(ftas);

        // Act: Query by the country code that belongs to the bloc
        List<FTA> result = ftaService.getFTA(null, null, "840");

        // Assert: Bloc FTA should be matched via bloc membership
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(blocFTA.getId(), result.get(0).getId());
    }

    // ========== getActiveFTA() Tests ==========

    @Test
    public void getActiveFTA_ShouldReturnActiveFTAs_WhenDateProvided() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act
        List<FTA> result = ftaService.getActiveFTA(null, "702", "840", "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size()); // FTA is active on 2025-06-01
        verify(agreements).findAll();
    }

    @Test
    public void getActiveFTA_ShouldFilterOutInactiveFTAs_WhenDateBeforeEffective() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act: Query date before effective date
        List<FTA> result = ftaService.getActiveFTA(null, "702", "840", "2024-12-31");

        // Assert: Should be filtered out
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    public void getActiveFTA_ShouldFilterOutInactiveFTAs_WhenDateAfterExpiration() {
        // Arrange
        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> allFTAs = new ArrayList<>();
        allFTAs.add(testFTA);
        when(agreements.findAll()).thenReturn(allFTAs);

        // Act: Query date after expiration date
        List<FTA> result = ftaService.getActiveFTA(null, "702", "840", "2026-01-01");

        // Assert: Should be filtered out
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    public void getActiveFTA_ShouldThrowException_WhenInvalidDateFormat() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getActiveFTA(null, null, null, "invalid-date"));

        assertTrue(exception.getMessage().contains("format YYYY-MM-DD"));
    }

    @Test
    public void getActiveFTA_ShouldThrowException_WhenDateIsNull() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.getActiveFTA(null, null, null, null));

        assertTrue(exception.getMessage().contains("valid date in the format YYYY-MM-DD"));
    }

    // ========== createFTA() Tests ==========

    @Test
    public void createFTA_ShouldCreateFTA_WhenValidRequest() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        request.setExpirationDate("2025-12-31");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.createFTA(request);

        // Assert
        assertNotNull(result);
        assertEquals(5.0, result.getDefaultRate());
        verify(parties).findByCountryCode("702");
        verify(parties).findByCountryCode("840");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenPartyAMissing() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA(null);
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("FTA cannot have no/one party involved") ||
                   exception.getMessage().contains("No country/bloc found"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenSamePartiesProvided() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("702");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Same country/bloc cannot have a FTA with itself") ||
                   exception.getMessage().contains("two valid parties"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenNegativeDefaultRate() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(-5.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Default rate under FTA cannot be negative"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenEffectiveDateAfterExpirationDate() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-12-31");
        request.setExpirationDate("2025-01-01"); // Before effective date

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        lenient().when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Effective date cannot be after expiration date"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldCreatePlurilateralFTA_WhenBlocInvolved() {
        // Arrange
        TradeParty blocParty = new TradeParty();
        blocParty.setId(3L);
        blocParty.setType(TradeParty.PartyType.BLOC);

        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("ASEAN");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByBlocCode("ASEAN")).thenReturn(Optional.of(blocParty));
        when(agreements.findByParties(testPartyA, blocParty)).thenReturn(new ArrayList<>());
        when(agreements.save(any(FTA.class))).thenAnswer(invocation -> {
            FTA fta = invocation.getArgument(0);
            fta.setId(1L);
            return fta;
        });

        // Act
        FTA result = ftaService.createFTA(request);

        // Assert
        assertNotNull(result);
        assertEquals(FTA.FTAType.PLURILATERAL, result.getType());
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenDateOverlapsWithExistingFTA() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-06-01");
        request.setExpirationDate("2025-12-31");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        
        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(testFTA); // Existing FTA: 2025-01-01 to 2025-12-31
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("overlaps"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldCreateFTAWithExcludedHSCodes_WhenExcludedCodesProvided() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        Set<String> excludedCodes = new HashSet<>();
        excludedCodes.add("847130");
        request.setExcludedHsCodes(excludedCodes);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());
        when(agreements.save(any(FTA.class))).thenAnswer(invocation -> {
            FTA fta = invocation.getArgument(0);
            fta.setId(1L);
            return fta;
        });

        // Act
        FTA result = ftaService.createFTA(request);

        // Assert
        assertNotNull(result);
        assertTrue(result.getExcludedHsCodes().contains(testHsCode));
        verify(hsCodes).findByCode("847130");
    }

    @Test
    public void createFTA_ShouldThrowException_WhenExcludedHSCodeNotFound() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        Set<String> excludedCodes = new HashSet<>();
        excludedCodes.add("999999");
        request.setExcludedHsCodes(excludedCodes);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("999999")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("HS Code '999999' not found"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldCreateFTAWithConcessions_WhenConcessionsProvided() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        
        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(2.5);
        Set<FTAConcessionRequest> concessions = new HashSet<>();
        concessions.add(concessionRequest);
        request.setConcessions(concessions);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());
        when(agreements.save(any(FTA.class))).thenAnswer(invocation -> {
            FTA fta = invocation.getArgument(0);
            fta.setId(1L);
            return fta;
        });

        // Act
        FTA result = ftaService.createFTA(request);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getSpecialConcessions().size());
        verify(hsCodes).findByCode("847130");
    }

    @Test
    public void createFTA_ShouldThrowException_WhenCreateFTAHasMissingPartyB() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("FTA cannot have no/one party involved"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenCreateFTAHasNegativeDefaultRate() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(-1.0);
        request.setEffectiveDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Default rate under FTA cannot be negative"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenCreateFTADatesInvalid() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-12-31");
        request.setExpirationDate("2025-01-01");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Effective date cannot be after expiration date"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenCreateFTAConcessionRateNegative() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(-1.0);
        Set<FTAConcessionRequest> concessions = new HashSet<>();
        concessions.add(concessionRequest);
        request.setConcessions(concessions);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("Final rate cannot be empty or negative"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldSwapParties_WhenExistingFTAPartiesReversed() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2026-01-01");
        request.setExpirationDate("2026-12-31");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        FTA existing = new FTA();
        existing.setId(10L);
        existing.setType(FTA.FTAType.BILATERAL);
        existing.setPartyA(testPartyB); // reversed order
        existing.setPartyB(testPartyA);
        existing.setDefaultRate(4.0);
        existing.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existing.setExpirationDate(LocalDate.of(2025, 12, 31));
        existing.setExcludedHsCodes(new LinkedHashSet<>());
        existing.setSpecialConcessions(new HashSet<>());

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existing);
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);
        when(agreements.save(any(FTA.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FTA result = ftaService.createFTA(request);

        // Assert
        assertNotNull(result);
        verify(agreements).findByParties(testPartyA, testPartyB);
        assertEquals(LocalDate.of(2026, 1, 1), result.getEffectiveDate());
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenCreateFTADateOverlapsExisting() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-06-01");
        request.setExpirationDate("2025-12-31");

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));

        FTA existing = new FTA();
        existing.setId(11L);
        existing.setType(FTA.FTAType.BILATERAL);
        existing.setPartyA(testPartyA);
        existing.setPartyB(testPartyB);
        existing.setDefaultRate(4.0);
        existing.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existing.setExpirationDate(LocalDate.of(2025, 12, 31));
        existing.setExcludedHsCodes(new LinkedHashSet<>());
        existing.setSpecialConcessions(new HashSet<>());

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existing);
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("overlap"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenConcessionRateEqualsDefaultRate() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        
        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(5.0); // Same as default rate
        Set<FTAConcessionRequest> concessions = new HashSet<>();
        concessions.add(concessionRequest);
        request.setConcessions(concessions);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("redundant as its rate matches default rate"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void createFTA_ShouldThrowException_WhenConcessionHSCodeIsExcluded() {
        // Arrange
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("702");
        request.setPartyB("840");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");
        
        Set<String> excludedCodes = new HashSet<>();
        excludedCodes.add("847130");
        request.setExcludedHsCodes(excludedCodes);
        
        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(2.5);
        Set<FTAConcessionRequest> concessions = new HashSet<>();
        concessions.add(concessionRequest);
        request.setConcessions(concessions);

        when(parties.findByCountryCode("702")).thenReturn(Optional.of(testPartyA));
        when(parties.findByCountryCode("840")).thenReturn(Optional.of(testPartyB));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.createFTA(request));

        assertTrue(exception.getMessage().contains("cannot have a special concession as it is marked as excluded"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    // ========== updateFTA() Tests ==========

    @Test
    public void updateFTA_ShouldUpdateDefaultRate_WhenDefaultRateProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setDefaultRate(6.0);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(agreements).findById(1L);
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateNegativeDefaultRate() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setDefaultRate(-5.0);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("Default rate under FTA cannot be negative"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldUpdateEffectiveDate_WhenEffectiveDateProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-02-01");

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(new ArrayList<>());
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateDateInvalid() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-12-31");
        request.setExpirationDate("2025-01-01"); // Before effective date

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("start date") && exception.getMessage().contains("end date"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldAddHSCodeToExcluded_WhenExcludeHSCodesProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> excludeCodes = new HashSet<>();
        excludeCodes.add("847130");
        request.setExcludeHSCodes(excludeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldRemoveHSCodeFromExcluded_WhenIncludeHSCodesProvided() {
        // Arrange
        Set<HSCode> excludedCodes = new LinkedHashSet<>();
        excludedCodes.add(testHsCode);
        testFTA.setExcludedHsCodes(excludedCodes);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> includeCodes = new HashSet<>();
        includeCodes.add("847130");
        request.setIncludeHSCodes(includeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldAddConcession_WhenAddConcessionsProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(2.5);
        Set<FTAConcessionRequest> addConcessions = new HashSet<>();
        addConcessions.add(concessionRequest);
        request.setAddConcessions(addConcessions);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldRemoveConcession_WhenRemoveConcessionsProvided() {
        // Arrange
        Concession concession = new Concession();
        concession.setId(1L);
        concession.setFta(testFTA);
        concession.setHsCode(testHsCode);
        concession.setFinalRate(2.5);
        Set<Concession> concessions = new HashSet<>();
        concessions.add(concession);
        testFTA.setSpecialConcessions(concessions);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> removeConcessions = new HashSet<>();
        removeConcessions.add("847130");
        request.setRemoveConcessions(removeConcessions);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateDateOverlapsWithExisting() {
        // Arrange: Create an existing FTA with overlapping dates
        FTA existingFTA = new FTA();
        existingFTA.setId(2L);
        existingFTA.setType(FTA.FTAType.BILATERAL);
        existingFTA.setPartyA(testPartyA);
        existingFTA.setPartyB(testPartyB);
        existingFTA.setDefaultRate(3.0);
        existingFTA.setEffectiveDate(LocalDate.of(2025, 6, 1));
        existingFTA.setExpirationDate(LocalDate.of(2025, 12, 31));

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-07-01"); // Overlaps with existing (2025-06-01 to 2025-12-31)
        request.setExpirationDate("2025-11-30");

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("overlaps") || exception.getMessage().contains("overlap"));
        verify(agreements).findByParties(testPartyA, testPartyB);
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldUpdateExpirationDateOnly_WhenOnlyExpirationDateProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setExpirationDate("2026-12-31"); // Only expiration date

        List<FTA> existingFTAs = new ArrayList<>(); // No overlapping FTAs

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldUpdateBothDates_WhenBothDatesProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2026-01-01");
        request.setExpirationDate("2026-12-31");

        List<FTA> existingFTAs = new ArrayList<>(); // No overlapping FTAs

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateDateStartsBeforeExistingEnds() {
        // Arrange: Existing FTA ends on 2025-12-31, new FTA starts on 2025-12-01 (overlaps)
        FTA existingFTA = new FTA();
        existingFTA.setId(2L);
        existingFTA.setType(FTA.FTAType.BILATERAL);
        existingFTA.setPartyA(testPartyA);
        existingFTA.setPartyB(testPartyB);
        existingFTA.setDefaultRate(3.0);
        existingFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existingFTA.setExpirationDate(LocalDate.of(2025, 12, 31));

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-12-01"); // Starts before existing ends
        request.setExpirationDate("2026-06-30");

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("overlap") || exception.getMessage().contains("starts before"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateDateEndsAfterExistingStarts() {
        // Arrange: Existing FTA starts on 2026-01-01, new FTA ends on 2026-06-30 (overlaps)
        FTA existingFTA = new FTA();
        existingFTA.setId(2L);
        existingFTA.setType(FTA.FTAType.BILATERAL);
        existingFTA.setPartyA(testPartyA);
        existingFTA.setPartyB(testPartyB);
        existingFTA.setDefaultRate(3.0);
        existingFTA.setEffectiveDate(LocalDate.of(2026, 1, 1));
        existingFTA.setExpirationDate(LocalDate.of(2026, 12, 31));

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-06-01");
        request.setExpirationDate("2026-06-30"); // Ends after existing starts

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("overlap") || exception.getMessage().contains("ends after"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenUpdateOverlapsWithOngoingFTA() {
        // Arrange: Existing FTA with null expiration (ongoing)
        FTA ongoingFTA = new FTA();
        ongoingFTA.setId(2L);
        ongoingFTA.setType(FTA.FTAType.BILATERAL);
        ongoingFTA.setPartyA(testPartyA);
        ongoingFTA.setPartyB(testPartyB);
        ongoingFTA.setDefaultRate(3.0);
        ongoingFTA.setEffectiveDate(LocalDate.of(2024, 1, 1));
        ongoingFTA.setExpirationDate(null); // Ongoing FTA

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-06-01"); // Overlaps with ongoing FTA
        request.setExpirationDate("2025-12-31");

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(ongoingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("overlap") || exception.getMessage().contains("Ongoing"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldRemoveExcludedHSCode_WhenIncludeHSCodesProvided() {
        // Arrange
        LinkedHashSet<HSCode> excluded = new LinkedHashSet<>();
        excluded.add(testHsCode);
        testFTA.setExcludedHsCodes(excluded);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> includeCodes = new HashSet<>();
        includeCodes.add("847130");
        request.setIncludeHSCodes(includeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        assertFalse(result.getExcludedHsCodes().contains(testHsCode));
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenIncludeHSCodeNotCurrentlyExcluded() {
        // Arrange: No excluded HS codes yet
        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> includeCodes = new HashSet<>();
        includeCodes.add("847130");
        request.setIncludeHSCodes(includeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("is not excluded in this FTA"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldAddExcludedHSCode_WhenExcludeHSCodesProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> excludeCodes = new HashSet<>();
        excludeCodes.add("010190");
        request.setExcludeHSCodes(excludeCodes);

        HSCode newHsCode = new HSCode();
        newHsCode.setCode("010190");
        newHsCode.setDescription("Live horses");

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("010190")).thenReturn(Optional.of(newHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        assertTrue(result.getExcludedHsCodes().contains(newHsCode));
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenExcludeHSCodeAlreadyExcluded() {
        // Arrange
        LinkedHashSet<HSCode> excluded = new LinkedHashSet<>();
        excluded.add(testHsCode);
        testFTA.setExcludedHsCodes(excluded);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> excludeCodes = new HashSet<>();
        excludeCodes.add("847130");
        request.setExcludeHSCodes(excludeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("has already been excluded"));
        verify(agreements, never()).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenExcludeHSCodeHasSpecialConcession() {
        // Arrange: Existing concession for the HS code prevents exclusion
        Concession concession = new Concession();
        concession.setId(5L);
        concession.setFta(testFTA);
        concession.setHsCode(testHsCode);
        concession.setFinalRate(2.5);

        HashSet<Concession> concessions = new HashSet<>();
        concessions.add(concession);
        testFTA.setSpecialConcessions(concessions);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> excludeCodes = new HashSet<>();
        excludeCodes.add("847130");
        request.setExcludeHSCodes(excludeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("associated with a special concession"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldRemoveOnlySpecifiedConcession_WhenMultipleConcessionsExist() {
        // Arrange
        Concession concessionToRemove = new Concession();
        concessionToRemove.setId(6L);
        concessionToRemove.setFta(testFTA);
        concessionToRemove.setHsCode(testHsCode);
        concessionToRemove.setFinalRate(2.5);

        HSCode anotherHsCode = new HSCode();
        anotherHsCode.setCode("010130");
        anotherHsCode.setDescription("Purebred breeding animals");

        Concession remainingConcession = new Concession();
        remainingConcession.setId(7L);
        remainingConcession.setFta(testFTA);
        remainingConcession.setHsCode(anotherHsCode);
        remainingConcession.setFinalRate(1.5);

        HashSet<Concession> concessions = new HashSet<>();
        concessions.add(concessionToRemove);
        concessions.add(remainingConcession);
        testFTA.setSpecialConcessions(concessions);

        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> removeCodes = new HashSet<>();
        removeCodes.add("847130");
        request.setRemoveConcessions(removeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getSpecialConcessions().size());
        assertTrue(result.getSpecialConcessions().stream().anyMatch(c -> c.getHsCode().equals(anotherHsCode)));
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldThrowException_WhenRemoveConcessionNotFound() {
        // Arrange: No concessions exist for the HS code
        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> removeCodes = new HashSet<>();
        removeCodes.add("847130");
        request.setRemoveConcessions(removeCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.updateFTA(1L, request));

        assertTrue(exception.getMessage().contains("No concession found"));
        verify(parties, never()).save(any(TradeParty.class));
    }

    @Test
    public void updateFTA_ShouldUpdateWithAddExcludedHSCodes_WhenAddExcludedCodesProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        Set<String> addExcludedCodes = new HashSet<>();
        addExcludedCodes.add("847130");
        request.setExcludeHSCodes(addExcludedCodes);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldUpdateWithAddConcessions_WhenAddConcessionsProvided() {
        // Arrange
        FTAUpdateRequest request = new FTAUpdateRequest();
        FTAConcessionRequest concessionRequest = new FTAConcessionRequest();
        concessionRequest.setHsCode("847130");
        concessionRequest.setFinalRate(2.5);
        Set<FTAConcessionRequest> addConcessions = new HashSet<>();
        addConcessions.add(concessionRequest);
        request.setAddConcessions(addConcessions);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert
        assertNotNull(result);
        verify(hsCodes).findByCode("847130");
        verify(agreements).save(any(FTA.class));
        // Verify concession was added to the FTA
        assertTrue(result.getSpecialConcessions().size() > 0 || testFTA.getSpecialConcessions().size() > 0);
    }

    @Test
    public void updateFTA_ShouldAllowUpdate_WhenNewFTAEndsBeforeExistingStarts() {
        // Arrange: New FTA ends before existing starts (no overlap)
        FTA existingFTA = new FTA();
        existingFTA.setId(2L);
        existingFTA.setType(FTA.FTAType.BILATERAL);
        existingFTA.setPartyA(testPartyA);
        existingFTA.setPartyB(testPartyB);
        existingFTA.setDefaultRate(3.0);
        existingFTA.setEffectiveDate(LocalDate.of(2026, 1, 1));
        existingFTA.setExpirationDate(LocalDate.of(2026, 12, 31));

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2025-01-01");
        request.setExpirationDate("2025-12-31"); // Ends before existing starts (2026-01-01)

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert: Should succeed (no overlap)
        assertNotNull(result);
        verify(agreements).save(any(FTA.class));
    }

    @Test
    public void updateFTA_ShouldAllowUpdate_WhenNewFTAStartsAfterExistingEnds() {
        // Arrange: New FTA starts after existing ends (no overlap)
        FTA existingFTA = new FTA();
        existingFTA.setId(2L);
        existingFTA.setType(FTA.FTAType.BILATERAL);
        existingFTA.setPartyA(testPartyA);
        existingFTA.setPartyB(testPartyB);
        existingFTA.setDefaultRate(3.0);
        existingFTA.setEffectiveDate(LocalDate.of(2024, 1, 1));
        existingFTA.setExpirationDate(LocalDate.of(2024, 12, 31));

        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setEffectiveDate("2026-01-01"); // Starts after existing ends (2024-12-31)
        request.setExpirationDate("2026-12-31");

        List<FTA> existingFTAs = new ArrayList<>();
        existingFTAs.add(existingFTA);

        when(agreements.findById(1L)).thenReturn(Optional.of(testFTA));
        when(agreements.findByParties(testPartyA, testPartyB)).thenReturn(existingFTAs);
        when(agreements.save(any(FTA.class))).thenReturn(testFTA);

        // Act
        FTA result = ftaService.updateFTA(1L, request);

        // Assert: Should succeed (no overlap)
        assertNotNull(result);
        verify(agreements).save(any(FTA.class));
    }

    // ========== deleteFTA() Tests ==========
    @Test
    public void deleteFTA_ShouldDeleteFTA_WhenExists() {
        // Arrange
        when(agreements.existsById(1L)).thenReturn(true);
        doNothing().when(agreements).deleteById(1L);

        // Act
        ftaService.deleteFTA(1L);

        // Assert
        verify(agreements).existsById(1L);
        verify(agreements).deleteById(1L);
    }

    @Test
    public void deleteFTA_ShouldThrowException_WhenDeleteFTANotFound() {
        // Arrange
        when(agreements.existsById(999L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ftaService.deleteFTA(999L));

        assertTrue(exception.getMessage().contains("No FTA found with id 999"));
        verify(agreements).existsById(999L);
        verify(agreements, never()).deleteById(any());
    }
}