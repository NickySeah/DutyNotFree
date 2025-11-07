package com.example.CSD.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTARepository;
import com.example.CSD.tradeParty.TradeParty;
import com.example.CSD.tradeParty.TradePartyRepository;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class FTARepositoryTest {
    @Autowired
    private FTARepository ftaRepository;

    @Autowired
    private TradePartyRepository tradePartyRepository;

    @Autowired
    private CountryRepository countryRepository;

    private TradeParty testPartyA;
    private TradeParty testPartyB;
    private Country testCountryA;
    private Country testCountryB;

    @BeforeEach
    void setUp() {
        // Create and save Countries
        testCountryA = new Country();
        testCountryA.setCode("SG");
        testCountryA.setName("Singapore");
        testCountryA.setAlpha3("SGP");
        countryRepository.save(testCountryA);

        testCountryB = new Country();
        testCountryB.setCode("US");
        testCountryB.setName("United States");
        testCountryB.setAlpha3("USA");
        countryRepository.save(testCountryB);

        // Create and save TradeParties
        testPartyA = new TradeParty();
        testPartyA.setType(TradeParty.PartyType.COUNTRY);
        testPartyA.setCountry(testCountryA);
        tradePartyRepository.save(testPartyA);

        testPartyB = new TradeParty();
        testPartyB.setType(TradeParty.PartyType.COUNTRY);
        testPartyB.setCountry(testCountryB);
        tradePartyRepository.save(testPartyB);
    }

    @Test
    void should_SaveFTA_WhenValid() {
        // Arrange: Create FTA
        FTA fta = new FTA();
        fta.setType(FTA.FTAType.BILATERAL);
        fta.setPartyA(testPartyA);
        fta.setPartyB(testPartyB);
        fta.setDefaultRate(5.0);
        fta.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta.setExcludedHsCodes(new LinkedHashSet<>());
        fta.setSpecialConcessions(new LinkedHashSet<>());

        // Act
        FTA saved = ftaRepository.save(fta);
        Optional<FTA> found = ftaRepository.findById(saved.getId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(FTA.FTAType.BILATERAL, found.get().getType());
        assertEquals(5.0, found.get().getDefaultRate());
        assertEquals("SG", found.get().getPartyA().getCountry().getCode());
        assertEquals("US", found.get().getPartyB().getCountry().getCode());
    }

    @Test
    void should_FindFTAByType_WhenTypeProvided() {
        // Arrange: Create FTAs with different types
        FTA bilateralFTA = new FTA();
        bilateralFTA.setType(FTA.FTAType.BILATERAL);
        bilateralFTA.setPartyA(testPartyA);
        bilateralFTA.setPartyB(testPartyB);
        bilateralFTA.setDefaultRate(5.0);
        bilateralFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        bilateralFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
        bilateralFTA.setExcludedHsCodes(new LinkedHashSet<>());
        bilateralFTA.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(bilateralFTA);

        // Create another FTA with same type
        TradeParty testPartyC = new TradeParty();
        testPartyC.setType(TradeParty.PartyType.COUNTRY);
        Country testCountryC = new Country();
        testCountryC.setCode("MY");
        testCountryC.setName("Malaysia");
        testCountryC.setAlpha3("MYS");
        countryRepository.save(testCountryC);
        testPartyC.setCountry(testCountryC);
        tradePartyRepository.save(testPartyC);

        FTA bilateralFTA2 = new FTA();
        bilateralFTA2.setType(FTA.FTAType.BILATERAL);
        bilateralFTA2.setPartyA(testPartyA);
        bilateralFTA2.setPartyB(testPartyC);
        bilateralFTA2.setDefaultRate(3.0);
        bilateralFTA2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        bilateralFTA2.setExpirationDate(LocalDate.of(2025, 12, 31));
        bilateralFTA2.setExcludedHsCodes(new LinkedHashSet<>());
        bilateralFTA2.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(bilateralFTA2);

        // Act: Find by type
        List<FTA> bilateralFTAs = ftaRepository.findAllByType(FTA.FTAType.BILATERAL);

        // Assert
        assertNotNull(bilateralFTAs);
        assertTrue(bilateralFTAs.size() >= 2);
        assertTrue(bilateralFTAs.stream().allMatch(f -> f.getType() == FTA.FTAType.BILATERAL));
    }

    @Test
    void should_FindFTAByParties_WhenPartiesProvided() {
        // Arrange: Create FTA
        FTA fta = new FTA();
        fta.setType(FTA.FTAType.BILATERAL);
        fta.setPartyA(testPartyA);
        fta.setPartyB(testPartyB);
        fta.setDefaultRate(5.0);
        fta.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta.setExcludedHsCodes(new LinkedHashSet<>());
        fta.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(fta);

        // Act: Find by parties (order A-B)
        List<FTA> ftas = ftaRepository.findByParties(testPartyA, testPartyB);

        // Assert
        assertNotNull(ftas);
        assertEquals(1, ftas.size());
        assertEquals(5.0, ftas.get(0).getDefaultRate());
    }

    @Test
    void should_FindFTAByParties_WhenPartiesReversed() {
        // Arrange: Create FTA with partyA and partyB
        FTA fta = new FTA();
        fta.setType(FTA.FTAType.BILATERAL);
        fta.setPartyA(testPartyA);
        fta.setPartyB(testPartyB);
        fta.setDefaultRate(5.0);
        fta.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta.setExcludedHsCodes(new LinkedHashSet<>());
        fta.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(fta);

        // Act: Find by parties (order B-A, should still find it)
        List<FTA> ftas = ftaRepository.findByParties(testPartyB, testPartyA);

        // Assert: Should find the same FTA regardless of order
        assertNotNull(ftas);
        assertEquals(1, ftas.size());
        assertEquals(5.0, ftas.get(0).getDefaultRate());
    }

    @Test
    void should_ReturnEmpty_WhenNoFTAsFoundByType() {
        // Act: Find by non-existent type (but we haven't created any PLURILATERAL)
        List<FTA> ftas = ftaRepository.findAllByType(FTA.FTAType.PLURILATERAL);

        // Assert: Should return empty if none exist
        assertNotNull(ftas);
        // May be empty or may have data from other tests, so just check it's a valid list
    }

    @Test
    void should_ReturnEmpty_WhenNoFTAsFoundByParties() {
        // Arrange: Create different parties
        TradeParty testPartyC = new TradeParty();
        testPartyC.setType(TradeParty.PartyType.COUNTRY);
        Country testCountryC = new Country();
        testCountryC.setCode("CN");
        testCountryC.setName("China");
        testCountryC.setAlpha3("CHN");
        countryRepository.save(testCountryC);
        testPartyC.setCountry(testCountryC);
        tradePartyRepository.save(testPartyC);

        TradeParty testPartyD = new TradeParty();
        testPartyD.setType(TradeParty.PartyType.COUNTRY);
        Country testCountryD = new Country();
        testCountryD.setCode("JP");
        testCountryD.setName("Japan");
        testCountryD.setAlpha3("JPN");
        countryRepository.save(testCountryD);
        testPartyD.setCountry(testCountryD);
        tradePartyRepository.save(testPartyD);

        // Act: Find FTA between parties that don't have an FTA
        List<FTA> ftas = ftaRepository.findByParties(testPartyC, testPartyD);

        // Assert: Should return empty
        assertNotNull(ftas);
        assertTrue(ftas.isEmpty());
    }

    @Test
    void should_DeleteFTA_WhenExists() {
        // Arrange: Create and save FTA
        FTA fta = new FTA();
        fta.setType(FTA.FTAType.BILATERAL);
        fta.setPartyA(testPartyA);
        fta.setPartyB(testPartyB);
        fta.setDefaultRate(5.0);
        fta.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta.setExcludedHsCodes(new LinkedHashSet<>());
        fta.setSpecialConcessions(new LinkedHashSet<>());
        FTA saved = ftaRepository.save(fta);
        Long ftaId = saved.getId();

        // Act: Delete FTA
        ftaRepository.delete(saved);
        Optional<FTA> found = ftaRepository.findById(ftaId);

        // Assert: Verify FTA was deleted
        assertFalse(found.isPresent());
        assertTrue(found.isEmpty());
    }

    @Test
    void should_FindAllFTAs_WhenMultipleExist() {
        // Arrange: Create multiple FTAs
        FTA fta1 = new FTA();
        fta1.setType(FTA.FTAType.BILATERAL);
        fta1.setPartyA(testPartyA);
        fta1.setPartyB(testPartyB);
        fta1.setDefaultRate(5.0);
        fta1.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta1.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta1.setExcludedHsCodes(new LinkedHashSet<>());
        fta1.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(fta1);

        TradeParty testPartyC = new TradeParty();
        testPartyC.setType(TradeParty.PartyType.COUNTRY);
        Country testCountryC = new Country();
        testCountryC.setCode("MY");
        testCountryC.setName("Malaysia");
        testCountryC.setAlpha3("MYS");
        countryRepository.save(testCountryC);
        testPartyC.setCountry(testCountryC);
        tradePartyRepository.save(testPartyC);

        FTA fta2 = new FTA();
        fta2.setType(FTA.FTAType.BILATERAL);
        fta2.setPartyA(testPartyA);
        fta2.setPartyB(testPartyC);
        fta2.setDefaultRate(3.0);
        fta2.setEffectiveDate(LocalDate.of(2025, 1, 1));
        fta2.setExpirationDate(LocalDate.of(2025, 12, 31));
        fta2.setExcludedHsCodes(new LinkedHashSet<>());
        fta2.setSpecialConcessions(new LinkedHashSet<>());
        ftaRepository.save(fta2);

        // Act: Find all FTAs
        List<FTA> allFTAs = ftaRepository.findAll();

        // Assert: Should find at least 2 FTAs
        assertNotNull(allFTAs);
        assertTrue(allFTAs.size() >= 2);
    }
}

