package com.example.CSD.tariff.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tariff.TariffCreateRequest;
import com.example.CSD.tariff.TariffRepository;
import com.example.CSD.tariff.TariffService;
import com.example.CSD.tariff.TariffUpdateRequest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TariffServiceTest {
    @Mock
    private TariffRepository tariffRepository;

    @Mock
    private CountryRepository countryRepository;

    @Mock
    private HSCodeRepository hsCodeRepository;

    @InjectMocks
    private TariffService tariffService;

    private HSCode testHsCode;
    private Country testOriginCountry;
    private Country testDestCountry;
    private Tariff testTariff;

    @BeforeEach
    public void setUp() {
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

        // Setup test Tariff
        testTariff = new Tariff();
        testTariff.setId(1L);
        testTariff.setHsCode(testHsCode);
        testTariff.setOriginCountry(testOriginCountry);
        testTariff.setDestCountry(testDestCountry);
        testTariff.setTariffType("Standard");
        testTariff.setStandardRate(7.5);
        testTariff.setFlatFee(null);
        testTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
    }

    @Test
    public void should_ReturnAllTariffs_WhenDateIsNull() {
        // Arrange: Mock repository to return list of tariffs
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        when(tariffRepository.findByFilters(null, null, null, null)).thenReturn(tariffs);

        // Act: Get all tariffs
        List<Tariff> result = tariffService.listTariffs();

        // Assert: Verify tariffs were returned
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Standard", result.get(0).getTariffType());
        verify(tariffRepository).findByFilters(null, null, null, null);
    }

    @Test
    public void should_ReturnActiveTariffs_WhenDateIsProvided() {
        // Arrange: Mock repository to return list of tariffs
        // When all parameters are null, service calls findActiveTariffs instead
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 1, 1);
        when(tariffRepository.findActiveTariffs(queryDate))
                .thenReturn(tariffs);

        // Act: Get active tariffs with all null filters
        List<Tariff> result = tariffService.getActiveTariffs(null, null, null, null, "2025-01-01");

        // Assert: Verify tariffs were returned
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Standard", result.get(0).getTariffType());
        verify(tariffRepository).findActiveTariffs(queryDate);
    }

    @Test
    public void should_ReturnActiveTariffsWithFilters_WhenFiltersProvided() {
        // Arrange: Mock repository to return list of tariffs with filters
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 1, 1);
        when(tariffRepository.findActiveTariffsByFilters("SG", "US", "847130", "Standard", queryDate))
                .thenReturn(tariffs);

        // Act: Get active tariffs with filters
        List<Tariff> result = tariffService.getActiveTariffs("SG", "US", "847130", "Standard", "2025-01-01");

        // Assert: Verify tariffs were returned
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Standard", result.get(0).getTariffType());
        verify(tariffRepository).findActiveTariffsByFilters("SG", "US", "847130", "Standard", queryDate);
    }

    @Test
    public void should_ThrowException_WhenDuplicateTariffExists() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);
        
        List<Tariff> existingTariffs = new ArrayList<>();
        existingTariffs.add(testTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create request
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-01-01");
        request.setExpirationDate("2025-12-31");

        // Act & Assert: Should throw exception due to date overlap
        assertThrows(RuntimeException.class, () -> tariffService.createTariff(request));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_CreateTariff_WhenValidRequest() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff doesn't exist
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(false);

        // Arrange: Setup saved tariff
        when(tariffRepository.save(any(Tariff.class))).thenReturn(testTariff);

        // Arrange: Create request
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setFlatFee(null);
        request.setEffectiveDate("2025-01-01");
        request.setExpirationDate("2025-12-31");

        // Act
        Tariff result = tariffService.createTariff(request);

        // Assert
        assertNotNull(result);
        assertEquals("Standard", result.getTariffType());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenTariffNotFound() {
        // Arrange: Mock repository to return empty Optional
        doReturn(Optional.empty()).when(tariffRepository).findById(any(Long.class));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> tariffService.getTariffByID(999L));
        verify(tariffRepository).findById(999L);
    }

    @Test
    public void should_GetTariffById_WhenExists() {
        // Arrange: Mock repository to return tariff
        doReturn(Optional.of(testTariff)).when(tariffRepository).findById(any(Long.class));

        // Act
        Tariff result = tariffService.getTariffByID(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Standard", result.getTariffType());
        verify(tariffRepository).findById(1L);
    }

    @Test
    public void should_ThrowException_WhenOriginEqualsDestination() {
        // Arrange: Create request with same origin and destination
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("SG"); // Same as origin
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-01-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("Origin and destination country codes cannot be the same"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenBothRateAndFeeProvided() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Create request with both rate and fee
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setFlatFee(50.0); // Both provided
        request.setEffectiveDate("2025-01-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("Both standardRate and flatFee provided"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenNeitherRateNorFeeProvided() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Create request with neither rate nor fee
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(null);
        request.setFlatFee(null); // Neither provided
        request.setEffectiveDate("2025-01-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("Both standardRate and flatFee not provided"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenInvalidDate() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Create request with invalid date format
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("invalid-date"); // Invalid format

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("date must be a valid date") || 
                   exception.getMessage().contains("format YYYY-MM-DD"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenEffectiveDateAfterExpiration() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Create request with effective date after expiration
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-12-31");
        request.setExpirationDate("2025-01-01"); // Before effective date

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("Effective date cannot be after expiration date"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenCountryNotFound() {
        // Arrange: Mock country not found
        when(countryRepository.findByCode("XX")).thenReturn(Optional.empty());

        // Arrange: Create request
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("XX"); // Non-existent country
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-01-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("No country with ISO code 'XX' found"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenHsCodeNotFound() {
        // Arrange: Setup Countries
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));
        
        // Arrange: Mock HS code not found
        when(hsCodeRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        // Arrange: Create request
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("INVALID"); // Non-existent HS code
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-01-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("HS Code 'INVALID' not found"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenValidCompositeKey() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setHsCode(testHsCode);
        updatedTariff.setOriginCountry(testOriginCountry);
        updatedTariff.setDestCountry(testDestCountry);
        updatedTariff.setTariffType("Standard");
        updatedTariff.setStandardRate(8.0);
        updatedTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Mock existing tariffs list (only used when dates are updated)
        // Since we're only updating rate (no dates), this won't be called, so use lenient
        List<Tariff> existingTariffs = new ArrayList<>();
        lenient().when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create update request (only rate, no dates - so no overlap check)
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);
        // No dates provided, so overlap check won't be triggered

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        assertEquals(8.0, result.getStandardRate());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateTariffNotFound() {
        // Arrange: Mock tariff not found
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.empty());

        // Arrange: Create update request
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("Tariff not found"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_DeleteTariff_WhenExists() {
        // Arrange: Mock that tariff exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);
        
        // Arrange: Do nothing when delete is called
        doNothing().when(tariffRepository).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                anyString(), anyString(), anyString(), anyString(), any(LocalDate.class));

        // Act
        tariffService.deleteTariff("SG", "US", "847130", "Standard", "2025-01-01");

        // Assert
        verify(tariffRepository).existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard");
        verify(tariffRepository).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1));
    }

    @Test
    public void should_ThrowException_WhenDeleteTariffNotFound() {
        // Arrange: Mock that tariff doesn't exist
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.deleteTariff("SG", "US", "847130", "Standard", "2025-01-01"));
        
        assertTrue(exception.getMessage().contains("Tariff not found"));
        verify(tariffRepository, never()).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                anyString(), anyString(), anyString(), anyString(), any(LocalDate.class));
    }

    @Test
    public void should_ThrowException_WhenDeleteTariffInvalidDate() {
        // Act & Assert: Invalid date format
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.deleteTariff("SG", "US", "847130", "Standard", "invalid-date"));
        
        assertTrue(exception.getMessage().contains("valid date") || 
                   exception.getMessage().contains("format YYYY-MM-DD"));
    }

    @Test
    public void should_ReturnEmptyList_WhenNoTariffsExist() {
        // Arrange: Mock repository to return empty list
        when(tariffRepository.findByFilters(null, null, null, null)).thenReturn(new ArrayList<>());

        // Act
        List<Tariff> result = tariffService.listTariffs();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(tariffRepository).findByFilters(null, null, null, null);
    }

    @Test
    public void should_ThrowException_WhenGetActiveTariffsWithNullDate() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.getActiveTariffs(null, null, null, null, null));
        
        assertTrue(exception.getMessage().contains("valid date") || 
                   exception.getMessage().contains("format YYYY-MM-DD"));
    }

    @Test
    public void should_GetTariff_WhenFiltersProvided() {
        // Arrange: Mock repository to return filtered tariffs
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        when(tariffRepository.findByFilters("SG", "US", "847130", "Standard"))
                .thenReturn(tariffs);

        // Act
        List<Tariff> result = tariffService.getTariff("SG", "US", "847130", "Standard");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Standard", result.get(0).getTariffType());
        verify(tariffRepository).findByFilters("SG", "US", "847130", "Standard");
    }

    @Test
    public void should_UpdateTariffById_WhenValid() {
        // Arrange: Mock getTariffByID to return existing tariff
        doReturn(Optional.of(testTariff)).when(tariffRepository).findById(any(Long.class));

        // Arrange: Mock updateTariff calls
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setStandardRate(8.0);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Mock existing tariffs list (only used when dates are updated)
        lenient().when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(new ArrayList<>());

        // Arrange: Create update request
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);

        // Act
        Tariff result = tariffService.updateTariffById(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(8.0, result.getStandardRate());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateTariffByIdNotFound() {
        // Arrange: Mock getTariffByID to throw exception
        doReturn(Optional.empty()).when(tariffRepository).findById(any(Long.class));

        // Arrange: Create update request
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariffById(999L, request));
    }

    @Test
    public void should_ThrowException_WhenUpdateBothRateAndFee() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Create update request with both rate and fee
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);
        request.setFlatFee(50.0); // Both provided

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("Cannot have both standardRate & flatFee"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateBothRateAndFeeProvided() {
        // Arrange: Setup existing tariff with rate
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(7.5);
        existingTariff.setFlatFee(null);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Create update request with both rate and fee
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);
        request.setFlatFee(50.0); // Both provided, existing has rate, so final will be both non-null

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("Cannot have both standardRate & flatFee"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenOnlyRateProvided() {
        // Arrange: Setup existing tariff with rate
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(7.5);
        existingTariff.setFlatFee(null);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setStandardRate(8.0);
        updatedTariff.setFlatFee(null);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request with only rate
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(8.0);

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        assertEquals(8.0, result.getStandardRate());
        assertNull(result.getFlatFee());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenOnlyFeeProvided() {
        // Arrange: Setup existing tariff with fee
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(null);
        existingTariff.setFlatFee(50.0);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setStandardRate(null);
        updatedTariff.setFlatFee(60.0);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request with only fee
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setFlatFee(60.0);

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        assertEquals(60.0, result.getFlatFee());
        assertNull(result.getStandardRate());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateEffectiveDateAfterExpiration() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Mock existing tariffs list (only used when dates are updated)
        lenient().when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(new ArrayList<>());

        // Arrange: Create update request with effective date after expiration
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setEffectiveDate("2025-12-31");
        request.setExpirationDate("2025-01-01"); // Before effective date

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("start date") && 
                   exception.getMessage().contains("end date"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_CreateTariff_WhenFlatFeeProvided() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff doesn't exist
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(false);

        // Arrange: Setup saved tariff
        Tariff savedTariff = new Tariff();
        savedTariff.setId(1L);
        savedTariff.setFlatFee(50.0);
        savedTariff.setStandardRate(null);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(savedTariff);

        // Arrange: Create request with flat fee
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(null);
        request.setFlatFee(50.0);
        request.setEffectiveDate("2025-01-01");

        // Act
        Tariff result = tariffService.createTariff(request);

        // Assert
        assertNotNull(result);
        assertEquals(50.0, result.getFlatFee());
        assertNull(result.getStandardRate());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenOnlyEffectiveDateProvided() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Mock no other tariffs for overlap check
        List<Tariff> otherTariffs = new ArrayList<>();
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(otherTariffs);

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setEffectiveDate(LocalDate.of(2025, 2, 1));
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request with only effective date
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setEffectiveDate("2025-02-01");

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenOnlyExpirationDateProvided() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Mock no other tariffs for overlap check
        List<Tariff> otherTariffs = new ArrayList<>();
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(otherTariffs);

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request with only expiration date
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setExpirationDate("2025-12-31");

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        verify(tariffRepository).save(any(Tariff.class));
    }


    @Test
    public void should_CreateTariff_WhenNoExpirationDate() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff doesn't exist
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(false);

        // Arrange: Setup saved tariff (no expiration date - ongoing tariff)
        Tariff savedTariff = new Tariff();
        savedTariff.setId(1L);
        savedTariff.setStandardRate(7.5);
        savedTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        savedTariff.setExpirationDate(null); // Ongoing tariff
        when(tariffRepository.save(any(Tariff.class))).thenReturn(savedTariff);

        // Arrange: Create request without expiration date
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-01-01");
        request.setExpirationDate(null); // No expiration date

        // Act
        Tariff result = tariffService.createTariff(request);

        // Assert
        assertNotNull(result);
        assertEquals(7.5, result.getStandardRate());
        assertNull(result.getExpirationDate()); // Should be null for ongoing tariff
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenDateOverlapWithExistingTariff() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);
        
        // Arrange: Setup existing tariff that overlaps
        List<Tariff> existingTariffs = new ArrayList<>();
        Tariff existingTariff = new Tariff();
        existingTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existingTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        existingTariffs.add(existingTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create request with overlapping dates
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-06-01"); // Overlaps with existing
        request.setExpirationDate("2025-12-31");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));
        
        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("Existing"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_CreateTariff_WhenNoOverlapWithExistingTariff() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);
        
        // Arrange: Setup existing tariff that doesn't overlap
        List<Tariff> existingTariffs = new ArrayList<>();
        Tariff existingTariff = new Tariff();
        existingTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existingTariff.setExpirationDate(LocalDate.of(2025, 6, 30));
        existingTariffs.add(existingTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Setup saved tariff
        Tariff savedTariff = new Tariff();
        savedTariff.setId(1L);
        savedTariff.setStandardRate(7.5);
        savedTariff.setEffectiveDate(LocalDate.of(2025, 7, 1));
        savedTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        when(tariffRepository.save(any(Tariff.class))).thenReturn(savedTariff);

        // Arrange: Create request with non-overlapping dates (starts after existing ends)
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-07-01"); // After existing ends
        request.setExpirationDate("2025-12-31");

        // Act
        Tariff result = tariffService.createTariff(request);

        // Assert
        assertNotNull(result);
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateOverlapWithOtherTariff() {
        // Arrange: Setup existing tariff
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        // Arrange: Setup another existing tariff that would overlap
        List<Tariff> otherTariffs = new ArrayList<>();
        Tariff otherTariff = new Tariff();
        otherTariff.setId(2L);
        otherTariff.setEffectiveDate(LocalDate.of(2025, 6, 1));
        otherTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        otherTariffs.add(otherTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(otherTariffs);

        // Arrange: Create update request that would overlap
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setEffectiveDate("2025-05-01"); // Would overlap with other tariff

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("Existing"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateNeitherRateNorFeeAfterUpdate() {
        // Arrange: Setup existing tariff with rate
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(7.5);
        existingTariff.setFlatFee(null);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Create update request that sets rate to null (clearing it)
        // This would result in both finalRate and finalFee being null
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(null); // Trying to clear rate, but existing has no fee

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));
        
        assertTrue(exception.getMessage().contains("Cannot have both standardRate & flatFee or have none defined"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenCreateOverlapsWithOngoingTariff() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);

        // Arrange: Setup existing ongoing tariff (no expiration date)
        List<Tariff> existingTariffs = new ArrayList<>();
        Tariff ongoingTariff = new Tariff();
        ongoingTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        ongoingTariff.setExpirationDate(null); // Ongoing tariff
        existingTariffs.add(ongoingTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create request that overlaps with ongoing tariff
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-06-01"); // Overlaps with ongoing tariff
        request.setExpirationDate("2025-12-31");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));

        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("ongoing") ||
                   exception.getMessage().contains("Ongoing"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenUpdateOverlapsWithOngoingTariff() {
        // Arrange: Setup existing tariff (the one being updated)
        Tariff tariffToUpdate = new Tariff();
        tariffToUpdate.setId(1L);
        tariffToUpdate.setHsCode(testHsCode);
        tariffToUpdate.setOriginCountry(testOriginCountry);
        tariffToUpdate.setDestCountry(testDestCountry);
        tariffToUpdate.setTariffType("Standard");
        tariffToUpdate.setStandardRate(7.5);
        tariffToUpdate.setEffectiveDate(LocalDate.of(2025, 1, 1));
        tariffToUpdate.setExpirationDate(LocalDate.of(2025, 1, 31));
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(tariffToUpdate));

        // Arrange: Setup ongoing tariff that would overlap
        List<Tariff> otherTariffs = new ArrayList<>();
        Tariff ongoingTariff = new Tariff();
        ongoingTariff.setId(2L);
        ongoingTariff.setEffectiveDate(LocalDate.of(2025, 2, 1));
        ongoingTariff.setExpirationDate(null); // Ongoing tariff
        otherTariffs.add(ongoingTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(otherTariffs);

        // Arrange: Create update request that would overlap with ongoing tariff
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setEffectiveDate("2025-02-15"); // Overlaps with ongoing tariff
        request.setExpirationDate("2025-03-01");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request));

        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("ongoing") ||
                   exception.getMessage().contains("Ongoing"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenCreateStartsBeforeOngoingTariffEnds() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);

        // Arrange: Setup existing ongoing tariff
        List<Tariff> existingTariffs = new ArrayList<>();
        Tariff ongoingTariff = new Tariff();
        ongoingTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        ongoingTariff.setExpirationDate(null); // Ongoing tariff
        existingTariffs.add(ongoingTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create request that starts before ongoing tariff (new starts in middle)
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-06-01"); // Starts while ongoing tariff is active
        request.setExpirationDate("2025-12-31");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));

        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("ongoing") ||
                   exception.getMessage().contains("Ongoing") ||
                   exception.getMessage().contains("starts before"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenSwitchingFromRateToFee() {
        // Arrange: Setup existing tariff with rate
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(7.5);
        existingTariff.setFlatFee(null);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setStandardRate(null);
        updatedTariff.setFlatFee(50.0);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request switching from rate to fee
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(null); // Clear rate
        request.setFlatFee(50.0); // Set fee

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        assertEquals(50.0, result.getFlatFee());
        assertNull(result.getStandardRate());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_UpdateTariff_WhenSwitchingFromFeeToRate() {
        // Arrange: Setup existing tariff with fee
        Tariff existingTariff = new Tariff();
        existingTariff.setId(1L);
        existingTariff.setStandardRate(null);
        existingTariff.setFlatFee(50.0);
        
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "SG", "US", "847130", "Standard", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(existingTariff));

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setStandardRate(7.5);
        updatedTariff.setFlatFee(null);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(updatedTariff);

        // Arrange: Create update request switching from fee to rate
        TariffUpdateRequest request = new TariffUpdateRequest();
        request.setStandardRate(7.5); // Set rate
        request.setFlatFee(null); // Clear fee

        // Act
        Tariff result = tariffService.updateTariff("SG", "US", "847130", "Standard", "2025-01-01", request);

        // Assert
        assertNotNull(result);
        assertEquals(7.5, result.getStandardRate());
        assertNull(result.getFlatFee());
        verify(tariffRepository).save(any(Tariff.class));
    }

    @Test
    public void should_ThrowException_WhenCreateOngoingTariffOverlapsWithFiniteTariff() {
        // Arrange: Setup HSCode and Countries
        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(countryRepository.findByCode("SG")).thenReturn(Optional.of(testOriginCountry));
        when(countryRepository.findByCode("US")).thenReturn(Optional.of(testDestCountry));

        // Arrange: Mock that tariff already exists
        when(tariffRepository.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(true);

        // Arrange: Setup existing finite tariff
        List<Tariff> existingTariffs = new ArrayList<>();
        Tariff finiteTariff = new Tariff();
        finiteTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        finiteTariff.setExpirationDate(LocalDate.of(2025, 12, 31)); // Finite tariff
        existingTariffs.add(finiteTariff);
        when(tariffRepository.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "SG", "US", "847130", "Standard")).thenReturn(existingTariffs);

        // Arrange: Create request with ongoing tariff (no expiration) that overlaps
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(7.5);
        request.setEffectiveDate("2025-06-01"); // Starts while finite tariff is active
        request.setExpirationDate(null); // Ongoing tariff (no expiration)

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            tariffService.createTariff(request));

        assertTrue(exception.getMessage().contains("overlap") || 
                   exception.getMessage().contains("Existing"));
        verify(tariffRepository, never()).save(any(Tariff.class));
    }

}
