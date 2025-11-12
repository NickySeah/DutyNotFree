package com.example.CSD.test.tariff;

import java.time.*;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.junit.jupiter.api.Assertions.*;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffRepository;

@DataJpaTest
public class TariffRepositoryTest {
    @Autowired
    private TariffRepository tariffRepository;

    @Autowired
    private HSCodeRepository hsCodeRepository;

    @Autowired
    private CountryRepository countryRepository;

    private HSCode testHsCode;
    private Country testOriginCountry;
    private Country testDestCountry;

    @BeforeEach
    void setUp() {
        // Create and save HSCode first (required foreign key for Tariff)
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Test Description");
        hsCodeRepository.save(testHsCode);

        // Create and save Countries (required foreign keys for Tariff)
        testOriginCountry = new Country();
        testOriginCountry.setCode("702");
        testOriginCountry.setName("Singapore");
        testOriginCountry.setAlpha3("SGP");
        countryRepository.save(testOriginCountry);

        testDestCountry = new Country();
        testDestCountry.setCode("840");
        testDestCountry.setName("United States");
        testDestCountry.setAlpha3("USA");
        countryRepository.save(testDestCountry);
    }

    @Test
    void should_SaveTariff_WhenValid() {
        // Arrange: Create tariff
        Tariff tariff = new Tariff();
        tariff.setHsCode(testHsCode);
        tariff.setOriginCountry(testOriginCountry);
        tariff.setDestCountry(testDestCountry);
        tariff.setTariffType("Standard");
        tariff.setStandardRate(7.5);
        tariff.setFlatFee(null);
        tariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        // Act
        Tariff saved = tariffRepository.save(tariff);
        Optional<Tariff> found = tariffRepository.findById(saved.getId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Standard", found.get().getTariffType());
        assertEquals("702", found.get().getOriginCountry().getCode());
        assertEquals("840", found.get().getDestCountry().getCode());
        assertEquals("847130", found.get().getHsCode().getCode());
    }

    @Test
    void should_FindTariffByCompositeKey_WhenFiltersProvided() {
        // Arrange: Create and save tariff
        Tariff tariff = new Tariff();
        tariff.setHsCode(testHsCode);
        tariff.setOriginCountry(testOriginCountry);
        tariff.setDestCountry(testDestCountry);
        tariff.setTariffType("Standard");
        tariff.setStandardRate(7.5);
        tariff.setFlatFee(null);
        tariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        tariffRepository.save(tariff);

        // Act: Find tariff by composite key
        List<Tariff> tariffs = tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "Standard");

        // Assert: Verify tariff was found
        assertNotNull(tariffs);
        assertEquals(1, tariffs.size());
        assertEquals("Standard", tariffs.get(0).getTariffType());
        assertEquals("702", tariffs.get(0).getOriginCountry().getCode());
        assertEquals("840", tariffs.get(0).getDestCountry().getCode());
        assertEquals("847130", tariffs.get(0).getHsCode().getCode());
    }

    @Test
    void should_ReturnEmpty_WhenNoTariffsFound() {
        // Act: Find tariff with non-existent filters
        List<Tariff> tariffs = tariffRepository.findByFilters("XX", "YY", "999999", "NonExistent");

        // Assert: Verify no tariffs were found
        assertNotNull(tariffs);
        assertTrue(tariffs.isEmpty());
    }

    @Test
    void should_DeleteTariff_WhenExists() {
        // Arrange: Create and save tariff
        Tariff tariff = new Tariff();
        tariff.setHsCode(testHsCode);
        tariff.setOriginCountry(testOriginCountry);
        tariff.setDestCountry(testDestCountry);
        tariff.setTariffType("Standard");
        tariff.setStandardRate(7.5);
        tariff.setFlatFee(null);
        tariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        Tariff saved = tariffRepository.save(tariff);
        Long tariffId = saved.getId();

        // Act: Delete tariff
        tariffRepository.delete(saved);
        Optional<Tariff> found = tariffRepository.findById(tariffId);

        // Assert: Verify tariff was deleted
        assertFalse(found.isPresent());
        assertTrue(found.isEmpty());
    }

    @Test
    void should_FindTariffByFilters_WhenFiltersProvided() {
        // Arrange: Create and save tariff
        Tariff tariff = new Tariff();
        tariff.setHsCode(testHsCode);
        tariff.setOriginCountry(testOriginCountry);
        tariff.setDestCountry(testDestCountry);
        tariff.setTariffType("Standard");
        tariff.setStandardRate(7.5);
        tariff.setFlatFee(null);
        tariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        tariffRepository.save(tariff);

        // Act: Find tariff using filters
        List<Tariff> tariffs = tariffRepository.findByFilters("702", "840", "847130", "Standard");

        // Assert: Verify tariff was found
        assertNotNull(tariffs);
        assertEquals(1, tariffs.size());
        assertEquals("Standard", tariffs.get(0).getTariffType());
    }

}
