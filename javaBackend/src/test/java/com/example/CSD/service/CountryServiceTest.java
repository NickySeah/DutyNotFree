package com.example.CSD.service;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.country.CountryService;
import com.example.CSD.tradeParty.TradeParty;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CountryServiceTest {

    @Mock
    private CountryRepository countryRepository;

    @InjectMocks
    private CountryService countryService;

    private Country sampleCountry;

    @BeforeEach
    void setUp() {
        sampleCountry = new Country();
        sampleCountry.setCode("702");
        sampleCountry.setName("Singapore");
        sampleCountry.setAlpha3("SGP");

        TradeParty tradeParty = new TradeParty();
        tradeParty.setId(1L);
        tradeParty.setType(TradeParty.PartyType.COUNTRY);
        tradeParty.setCountry(sampleCountry);
        tradeParty.setFtasAsPartyA(new HashSet<>());
        tradeParty.setFtasAsPartyB(new HashSet<>());

        sampleCountry.setTradeParty(tradeParty);
    }

    @Test
    void should_ListCountries_WhenNoFiltersProvided() {
        List<Country> expected = new ArrayList<>();
        expected.add(sampleCountry);

        when(countryRepository.findAllByOrderByNameAsc()).thenReturn(expected);

        List<Country> result = countryService.getCountry(null, null, null);

        assertEquals(1, result.size());
        verify(countryRepository).findAllByOrderByNameAsc();
    }

    @Test
    void should_ReturnFilteredCountries_WhenFiltersProvided() {
        List<Country> filtered = new ArrayList<>();
        filtered.add(sampleCountry);
        when(countryRepository.findByFilters("702", null, null)).thenReturn(filtered);

        List<Country> result = countryService.getCountry("702", null, null);

        assertEquals(1, result.size());
        verify(countryRepository).findByFilters("702", null, null);
    }

    @Test
    void should_AddCountry_WhenValidAndUnique() {
        when(countryRepository.existsByCode("702")).thenReturn(false);
        when(countryRepository.save(sampleCountry)).thenReturn(sampleCountry);

        Country created = countryService.addCountry(sampleCountry);

        assertEquals("Singapore", created.getName());
        verify(countryRepository).save(sampleCountry);
    }

    @Test
    void should_ThrowException_WhenCountryAlreadyExists() {
        when(countryRepository.existsByCode("702")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(sampleCountry));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void should_ThrowException_WhenIsoInvalid() {
        Country invalid = new Country();
        invalid.setCode("SG");
        invalid.setName("Singapore");
        invalid.setAlpha3("SGP");

        when(countryRepository.existsByCode("SG")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Invalid ISO code"));
    }

    @Test
    void should_UpdateCountry_WhenValidRequest() {
        when(countryRepository.findByCode("702")).thenReturn(Optional.of(sampleCountry));
        when(countryRepository.save(sampleCountry)).thenReturn(sampleCountry);

        Country request = new Country();
        request.setName("Republic of Singapore");
        request.setAlpha3("SGP");

        Country result = countryService.updateCountry("702", request);

        assertEquals("Republic of Singapore", result.getName());
        verify(countryRepository).save(sampleCountry);
    }

    @Test
    void should_ThrowException_WhenUpdateCountryNotFound() {
        when(countryRepository.findByCode("999")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.updateCountry("999", sampleCountry));
        assertTrue(ex.getMessage().contains("No country found"));
    }

    @Test
    void should_DeleteCountry_WhenNoFTAsAssociated() {
        when(countryRepository.existsByCode("702")).thenReturn(true);
        when(countryRepository.findByCode("702")).thenReturn(Optional.of(sampleCountry));

        countryService.deleteCountry("702");

        verify(countryRepository).deleteByCode("702");
    }

    @Test
    void should_ThrowException_WhenDeleteCountryHasFTAs() {
        when(countryRepository.existsByCode("702")).thenReturn(true);
        when(countryRepository.findByCode("702")).thenReturn(Optional.of(sampleCountry));

        // simulate active FTA reference
        sampleCountry.getTradeParty().getFtasAsPartyA().add(new com.example.CSD.fta.FTA());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.deleteCountry("702"));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(countryRepository, never()).deleteByCode(anyString());
    }
}

