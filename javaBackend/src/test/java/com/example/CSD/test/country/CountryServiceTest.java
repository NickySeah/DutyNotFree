package com.example.CSD.test.country;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.example.CSD.country.*;
import com.example.CSD.fta.FTA;
import com.example.CSD.tradeParty.TradeParty;

@ExtendWith(MockitoExtension.class)
class CountryServiceTest {

    @Mock
    private CountryRepository countries;

    @InjectMocks
    private CountryServiceImpl countryService;

    private Country sampleCountry1;
    private Country sampleCountry2;

    @BeforeEach
    void setUp() {
        sampleCountry1 = new Country();
        sampleCountry1.setCode("702");
        sampleCountry1.setName("Singapore");
        sampleCountry1.setAlpha3("SGP");

        TradeParty tradeParty1 = new TradeParty();
        tradeParty1.setId(1L);
        tradeParty1.setType(TradeParty.PartyType.COUNTRY);
        tradeParty1.setCountry(sampleCountry1);
        tradeParty1.setFtasAsPartyA(new HashSet<>());
        tradeParty1.setFtasAsPartyB(new HashSet<>());
        sampleCountry1.setTradeParty(tradeParty1);

        sampleCountry2 = new Country();
        sampleCountry2.setCode("854");
        sampleCountry2.setName("Malaysia");
        sampleCountry2.setAlpha3("MYS");

        TradeParty tradeParty2 = new TradeParty();
        tradeParty2.setId(2L);
        tradeParty2.setType(TradeParty.PartyType.COUNTRY);
        tradeParty2.setCountry(sampleCountry2);
        tradeParty2.setFtasAsPartyA(new HashSet<>());
        tradeParty2.setFtasAsPartyB(new HashSet<>());
        sampleCountry2.setTradeParty(tradeParty2);
    }

    // listCountries() test
    @Test
    void listCountries_ShouldListCountries() {
        when(countries.findAllByOrderByNameAsc()).thenReturn(new ArrayList<>(Arrays.asList(sampleCountry1, sampleCountry2)));

        List<Country> result = countryService.listCountries();

        assertEquals(2, result.size());
        verify(countries).findAllByOrderByNameAsc();
    }

    // getCountry() tests
    @Test
    void getCountry_ShouldReturnFilteredCountries_WhenISOProvided() {
        when(countries.findByFilters(anyString(), eq(null), eq(null))).thenReturn(new ArrayList<>(Arrays.asList(sampleCountry1)));

        List<Country> result = countryService.getCountry("702", null, null);

        assertEquals(1, result.size());
        verify(countries).findByFilters(anyString(), eq(null), eq(null));
    }

    @Test
    void getCountry_ShouldReturnFilteredCountries_WhenNameProvided() {
        when(countries.findByFilters(eq(null), anyString(), eq(null))).thenReturn(new ArrayList<>(Arrays.asList(sampleCountry1)));

        List<Country> result = countryService.getCountry(null, "Singapore", null);

        assertEquals(1, result.size());
        verify(countries).findByFilters(eq(null), anyString(), eq(null));
    }

    @Test
    void getCountry_ShouldReturnFilteredCountries_WhenAlpha3Provided() {
        when(countries.findByFilters(eq(null), eq(null), anyString())).thenReturn(new ArrayList<>(Arrays.asList(sampleCountry1)));

        List<Country> result = countryService.getCountry(null, null, "SGP");

        assertEquals(1, result.size());
        verify(countries).findByFilters(eq(null), eq(null), anyString());
    }

    @Test
    void getCountry_ShouldReturnAllCountries_WhenNoFiltersProvided() {
        when(countries.findAllByOrderByNameAsc()).thenReturn(new ArrayList<>(Arrays.asList(sampleCountry1, sampleCountry2)));

        List<Country> result = countryService.getCountry(null, null, null);

        assertEquals(2, result.size());
        verify(countries).findAllByOrderByNameAsc();
    }

    // addCountry() tests
    @Test
    void addCountry_ShouldAddCountry_WhenValidAndUnique() {
        when(countries.existsByCode("702")).thenReturn(false);
        when(countries.save(sampleCountry1)).thenReturn(sampleCountry1);

        Country created = countryService.addCountry(sampleCountry1);

        assertEquals("Singapore", created.getName());
        verify(countries).save(sampleCountry1);
    }

    @Test
    void addCountry_ShouldThrowException_WhenCountryAlreadyExists() {
        when(countries.existsByCode("702")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(sampleCountry1));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void addCountry_ShouldThrowException_WhenISOInvalid() {
        Country invalid = new Country();
        invalid.setCode("SG");

        when(countries.existsByCode(anyString())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Invalid ISO code"));
    }

    @Test
    void addCountry_ShouldThrowException_WhenISONotProvided() {
        Country invalid = new Country();
        invalid.setCode(null);

        when(countries.existsByCode(null)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Invalid ISO code"));
    }
    
    @Test
    void addCountry_ShouldThrowException_WhenNameInvalid() {
        Country invalid = new Country();
        invalid.setCode("702");
        invalid.setName("");
        
        when(countries.existsByCode(anyString())).thenReturn(false);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Country name cannot be empty"));
    }
    
    @Test
    void addCountry_ShouldThrowException_WhenNameNotProvided() {
        Country invalid = new Country();
        invalid.setCode("702");
        invalid.setName(null);

        when(countries.existsByCode(anyString())).thenReturn(false);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Country name cannot be empty"));
    }

    @Test
    void addCountry_ShouldThrowException_WhenAlpha3Invalid() {
        Country invalid = new Country();
        invalid.setCode("702");
        invalid.setName("Singapore");
        invalid.setAlpha3("SG");

        when(countries.existsByCode(anyString())).thenReturn(false);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Invalid Alpha 3 code"));
    }

    @Test
    void addCountry_ShouldThrowException_WhenAlpha3NotProvided() {
        Country invalid = new Country();
        invalid.setCode("702");
        invalid.setName("Singapore");
        invalid.setAlpha3(null);

        when(countries.existsByCode(anyString())).thenReturn(false);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.addCountry(invalid));
        assertTrue(ex.getMessage().contains("Invalid Alpha 3 code"));
    }

    // updateCountry() tests
    @Test
    void updateCountry_ShouldUpdateCountry_WhenValidRequest() {
        Country request = new Country();
        request.setName("Republic of Singapore");
        request.setAlpha3("SGP");
        
        when(countries.findByCode(anyString())).thenReturn(Optional.of(sampleCountry1));
        when(countries.save(sampleCountry1)).thenReturn(sampleCountry1);

        Country result = countryService.updateCountry("702", request);

        assertEquals("Republic of Singapore", result.getName());
        assertEquals("SGP", result.getAlpha3());
        verify(countries).save(any(Country.class));
    }

    @Test
    void updateCountry_ShouldUpdateCountry_WhenNewNameValid() {
        Country request = new Country();
        request.setName("Republic of Singapore");
        
        when(countries.findByCode(anyString())).thenReturn(Optional.of(sampleCountry1));
        when(countries.save(sampleCountry1)).thenReturn(sampleCountry1);

        Country result = countryService.updateCountry("702", request);

        assertEquals("Republic of Singapore", result.getName());
        verify(countries).save(any(Country.class));
    }

    @Test
    void updateCountry_ShouldUpdateCountry_WhenNewAlpha3Valid() {
        Country request = new Country();
        request.setAlpha3("SIN");
        
        when(countries.findByCode("702")).thenReturn(Optional.of(sampleCountry1));
        when(countries.save(sampleCountry1)).thenReturn(sampleCountry1);

        Country result = countryService.updateCountry("702", request);

        assertEquals("SIN", result.getAlpha3());
        verify(countries).save(any(Country.class));
    }

    @Test
    void updateCountry_ShouldThrowException_WhenNewNameInvalid() {
        Country request = new Country();
        request.setName("");
        when(countries.findByCode(anyString())).thenReturn(Optional.of(sampleCountry1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.updateCountry("999", request));
        assertTrue(ex.getMessage().contains("Country name cannot be empty"));
        verify(countries, never()).save(any(Country.class));
    }

    @Test
    void updateCountry_ShouldThrowException_WhenNewAlpha3Invalid() {
        Country request = new Country();
        request.setAlpha3("SG");
        when(countries.findByCode(anyString())).thenReturn(Optional.of(sampleCountry1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.updateCountry("999", request));
        assertTrue(ex.getMessage().contains("Alpha 3 code must be exactly 3 characters long"));
        verify(countries, never()).save(any(Country.class));
    }

    @Test
    void updateCountry_ShouldThrowException_WhenUpdateCountryNotFound() {
        when(countries.findByCode(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.updateCountry("999", sampleCountry1));
        assertTrue(ex.getMessage().contains("No country found"));
        verify(countries, never()).save(any(Country.class));
    }

    // deleteCountry() tests
    @Test
    void deleteCountry_ShouldDeleteCountry_WhenNoFTAsAssociated() {
        when(countries.existsByCode("702")).thenReturn(true);
        when(countries.findByCode("702")).thenReturn(Optional.of(sampleCountry1));

        countryService.deleteCountry("702");

        verify(countries).deleteByCode("702");
    }

    @Test
    void deleteCountry_ShouldThrowException_WhenCountryCodeInvalid() {
        when(countries.existsByCode("702")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.deleteCountry("702"));
        assertTrue(ex.getMessage().contains("No country found with code 702"));
        verify(countries, never()).deleteByCode(anyString());
    }

    @Test
    void deleteCountry_ShouldThrowException_WhenDeleteCountryHasFTAsAsPartyA() {
        when(countries.existsByCode("702")).thenReturn(true);
        when(countries.findByCode("702")).thenReturn(Optional.of(sampleCountry1));

        // simulate active FTA reference
        sampleCountry1.getTradeParty().getFtasAsPartyA().add(new FTA());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.deleteCountry("702"));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(countries, never()).deleteByCode(anyString());
    }

    @Test
    void deleteCountry_ShouldThrowException_WhenDeleteCountryHasFTAsAsPartyB() {
        when(countries.existsByCode("702")).thenReturn(true);
        when(countries.findByCode("702")).thenReturn(Optional.of(sampleCountry1));

        // simulate active FTA reference
        sampleCountry1.getTradeParty().getFtasAsPartyB().add(new FTA());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> countryService.deleteCountry("702"));
        System.out.println((ex.getMessage()));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(countries, never()).deleteByCode(anyString());
    }
}

