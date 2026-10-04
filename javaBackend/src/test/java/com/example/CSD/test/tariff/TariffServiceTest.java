package com.example.CSD.test.tariff;

import java.time.LocalDate;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import jakarta.persistence.criteria.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tariff.*;
import com.example.CSD.user.UserDTO;
import com.example.CSD.email.EmailService;
import com.example.CSD.wishlist.Wishlist;
import com.example.CSD.wishlist.WishlistService;

@ExtendWith(MockitoExtension.class)
public class TariffServiceTest {
    @Test
    public void boundaryDayCannotBelongToTwoTariffVersions() {
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN")).thenReturn(true);
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN")).thenReturn(new ArrayList<>(List.of(testTariff)));
        testCreateRequest.setEffectiveDate("2025-12-31");
        testCreateRequest.setExpirationDate(null);
        assertThrows(RuntimeException.class, () -> tariffService.createTariff(testCreateRequest));
        verify(tariffs, never()).save(any());
    }

    @Test
    public void negativeRateCannotBePersisted() {
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        testCreateRequest.setStandardRate(-5.0);
        assertThrows(RuntimeException.class, () -> tariffService.createTariff(testCreateRequest));
        verify(tariffs, never()).save(any());
    }
    @Mock
    private TariffRepository tariffs;

    @Mock
    private CountryRepository countries;

    @Mock
    private HSCodeRepository hscodes;

    @Mock
    private WishlistService wishlistService;

    @Mock
    private EmailService emailService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TariffServiceImpl tariffService;

    private Country testCountryA;
    private Country testCountryB;
    private HSCode testHsCode;
    private Tariff testTariff;
    private TariffCreateRequest testCreateRequest;
    private TariffUpdateRequest testUpdateRequest;

    @BeforeEach
    public void setUp() {
        // Setup test Countries
        testCountryA = new Country();
        testCountryA.setCode("702");
        testCountryA.setName("Singapore");
        testCountryA.setAlpha3("SGP");

        testCountryB = new Country();
        testCountryB.setCode("840");
        testCountryB.setName("United States");
        testCountryB.setAlpha3("USA");

        // Setup test HSCode
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Laptop computers");

        // Setup test Tariff
        testTariff = new Tariff();
        testTariff.setId(1L);
        testTariff.setOriginCountry(testCountryA);
        testTariff.setDestCountry(testCountryB);
        testTariff.setHsCode(testHsCode);
        testTariff.setTariffType("MFN");
        testTariff.setStandardRate(5.0);
        testTariff.setFlatFee(null);
        testTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testTariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        // Setup test Create Request
        testCreateRequest = new TariffCreateRequest();
        testCreateRequest.setOriginCountry("702");
        testCreateRequest.setDestCountry("840");
        testCreateRequest.setHsCode("847130");
        testCreateRequest.setTariffType("MFN");
        testCreateRequest.setStandardRate(5.0);
        testCreateRequest.setFlatFee(null);
        testCreateRequest.setEffectiveDate("2025-01-01");
        testCreateRequest.setExpirationDate("2025-12-31");

        // Setup test Update Request
        testUpdateRequest = new TariffUpdateRequest();
    }

    // ========== listTariffs() Tests ==========
    @Test
    public void listTariffs_ShouldReturnAllTariffs_WhenCalled() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        when(tariffs.findByFilters(null, null, null, null)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.listTariffs();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findByFilters(null, null, null, null);
    }

    // ========== getTariff() Tests ==========
    @Test
    public void getTariff_ShouldReturnFilteredTariffs_WhenAllFiltersProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        when(tariffs.findByFilters("702", "840", "847130", "MFN")).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getTariff("702", "840", "847130", "MFN");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findByFilters("702", "840", "847130", "MFN");
    }

    @Test
    public void getTariff_ShouldReturnAllTariffs_WhenNoFiltersProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        when(tariffs.findByFilters(null, null, null, null)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getTariff(null, null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findByFilters(null, null, null, null);
    }

    @Test
    public void getTariff_ShouldReturnPartialFilteredTariffs_WhenSomeFiltersProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        when(tariffs.findByFilters("702", null, null, null)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getTariff("702", null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findByFilters("702", null, null, null);
    }

    // ========== getTariffByID() Tests ==========
    @Test
    public void getTariffByID_ShouldReturnTariff_WhenExists() {
        // Arrange
        when(tariffs.findById(1L)).thenReturn(Optional.of(testTariff));

        // Act
        Tariff result = tariffService.getTariffByID(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(tariffs).findById(1L);
    }

    @Test
    public void getTariffByID_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(tariffs.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.getTariffByID(999L));

        assertTrue(exception.getMessage().contains("No tariff with id 999 exist"));
        verify(tariffs).findById(999L);
    }

    // ========== getActiveTariffs() Tests ==========
    @Test
    public void getActiveTariffs_ShouldReturnAllActiveTariffs_WhenNoFiltersProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffs(queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs(null, null, null, null, "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffs(queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldReturnFilteredActiveTariffs_WhenFiltersProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffsByFilters("702", "840", "847130", "MFN", queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs("702", "840", "847130", "MFN", "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffsByFilters("702", "840", "847130", "MFN", queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldReturnFilteredActiveTariffs_WhenOriginProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffsByFilters("702", null, null, null, queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs("702", null, null, null, "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffsByFilters("702", null, null, null, queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldReturnFilteredActiveTariffs_WhenDestProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffsByFilters(null, "840", null, null, queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs(null, "840", null, null, "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffsByFilters(null, "840", null, null, queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldReturnFilteredActiveTariffs_WhenHsCodeProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffsByFilters(null, null, "847130", null, queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs(null, null, "847130", null, "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffsByFilters(null, null, "847130", null, queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldReturnFilteredActiveTariffs_WhenTariffTypeProvided() {
        // Arrange
        List<Tariff> tariffList = Arrays.asList(testTariff);
        LocalDate queryDate = LocalDate.of(2025, 6, 1);
        when(tariffs.findActiveTariffsByFilters(null, null, null, "MFN", queryDate)).thenReturn(tariffList);

        // Act
        List<Tariff> result = tariffService.getActiveTariffs(null, null, null, "MFN", "2025-06-01");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tariffs).findActiveTariffsByFilters(null, null, null, "MFN", queryDate);
    }

    @Test
    public void getActiveTariffs_ShouldThrowException_WhenInvalidDateFormat() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.getActiveTariffs(null, null, null, null, "invalid-date"));

        assertTrue(exception.getMessage().contains("format YYYY-MM-DD"));
    }

    @Test
    public void getActiveTariffs_ShouldThrowException_WhenDateIsNull() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.getActiveTariffs(null, null, null, null, null));

        assertTrue(exception.getMessage().contains("valid date in the format YYYY-MM-DD"));
    }

    // ========== createTariff() Tests ==========
    @Test
    public void createTariff_ShouldCreateTariff_WhenValidRequestWithStandardRate() {
        // Arrange
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.createTariff(testCreateRequest);

        // Assert
        assertNotNull(result);
        verify(countries).findByCode("702");
        verify(countries).findByCode("840");
        verify(hscodes).findByCode("847130");
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldCreateTariff_WhenValidRequestWithFlatFee() {
        // Arrange
        testCreateRequest.setStandardRate(null);
        testCreateRequest.setFlatFee(100.0);

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.createTariff(testCreateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldCreateTariff_WhenNoExpirationDate() {
        // Arrange
        testCreateRequest.setExpirationDate(null);

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.createTariff(testCreateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenSameOriginAndDestination() {
        // Arrange
        testCreateRequest.setOriginCountry("702");
        testCreateRequest.setDestCountry("702");

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Origin and destination country codes cannot be the same"));
        verify(tariffs, never()).save(any(Tariff.class));
        verify(countries, never()).findByCode(anyString()); // Verify no country lookup occurred
    }

    @Test
    public void createTariff_ShouldThrowException_WhenOriginCountryNotFound() {
        // Arrange
        when(countries.findByCode("702")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("No country with ISO code '702' found"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenDestinationCountryNotFound() {
        // Arrange
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("No country with ISO code '840' found"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenHSCodeNotFound() {
        // Arrange
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("HS Code '847130' not found"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenBothRateAndFeeNull() {
        // Arrange
        testCreateRequest.setStandardRate(null);
        testCreateRequest.setFlatFee(null);

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Both standardRate and flatFee not provided"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenBothRateAndFeeProvided() {
        // Arrange
        testCreateRequest.setStandardRate(5.0);
        testCreateRequest.setFlatFee(100.0);

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Both standardRate and flatFee provided"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenEffectiveDateAfterExpirationDate() {
        // Arrange
        testCreateRequest.setEffectiveDate("2025-12-31");
        testCreateRequest.setExpirationDate("2025-01-01");

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Effective date cannot be after expiration date"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenInvalidEffectiveDateFormat() {
        // Arrange
        testCreateRequest.setEffectiveDate("invalid-date");

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Effective date must be a valid date"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenInvalidExpirationDateFormat() {
        // Arrange
        testCreateRequest.setExpirationDate("invalid-date");

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("Expiration date must be a valid date"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldValidateDates_WhenExistingTariffsFound() {
        // Arrange
        List<Tariff> existingTariffs = Arrays.asList(testTariff);
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(true);
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(existingTariffs);

        // Act & Assert - This should throw due to date overlap
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.createTariff(testCreateRequest));

        assertTrue(exception.getMessage().contains("overlap") || exception.getMessage().contains("overlaps"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldCreateTariff_WhenNoDateOverlapWithExisting() {
        // Arrange - Set dates that don't overlap with existing tariff
        testCreateRequest.setEffectiveDate("2026-01-01");
        testCreateRequest.setExpirationDate("2026-12-31");

        List<Tariff> existingTariffs = Arrays.asList(testTariff); // Existing: 2025-01-01 to 2025-12-31
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(true);
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(existingTariffs);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.createTariff(testCreateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void createTariff_ShouldThrowException_WhenEffectiveDateOverlaps() {
        // Arrange - Set dates that don't overlap with existing tariff
        testTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testTariff.setExpirationDate(null); 

        testCreateRequest.setEffectiveDate("2025-06-01"); 
        testCreateRequest.setExpirationDate(null);
        
        List<Tariff> existingTariffs = Arrays.asList(testTariff); // Existing: 2025-01-01 to 2025-12-31
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(true);
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(existingTariffs);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> tariffService.createTariff(testCreateRequest));

        System.out.println(exception.getMessage());
        assertTrue(exception.getMessage().contains("The new tariff overlaps with an ongoing tariff"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    // ========== validateDates() Helper Method Tests ==========
    @Test
    void updateTariff_ShouldSucceed_WhenNoOverlapExists() {
        Tariff existingOther = new Tariff();
        existingOther.setEffectiveDate(LocalDate.of(2026, 1, 1));
        existingOther.setExpirationDate(LocalDate.of(2026, 12, 31));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                eq("702"), eq("840"), eq("847130"), eq("MFN"), any(LocalDate.class))
        ).thenReturn(Optional.of(testTariff));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                eq("702"), eq("840"), eq("847130"), eq("MFN"))
        ).thenReturn(Collections.singletonList(existingOther));

        when(tariffs.save(any(Tariff.class))).thenAnswer(inv -> inv.getArgument(0));

        testUpdateRequest.setEffectiveDate("2027-01-01");
        testUpdateRequest.setExpirationDate("2027-12-31");
        testUpdateRequest.setEffectiveDateProvided(true);
        testUpdateRequest.setExpirationDateProvided(true);

        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        assertEquals(LocalDate.of(2027, 1, 1), result.getEffectiveDate());
        assertEquals(LocalDate.of(2027, 12, 31), result.getExpirationDate());
    }

    @Test
    void updateTariff_ShouldThrowException_WhenDatesOverlapExistingTariff() {
        Tariff overlappingTariff = new Tariff();
        overlappingTariff.setEffectiveDate(LocalDate.of(2025, 6, 1));
        overlappingTariff.setExpirationDate(LocalDate.of(2026, 6, 1));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                eq("702"), eq("840"), eq("847130"), eq("MFN"), any(LocalDate.class))
        ).thenReturn(Optional.of(testTariff));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                eq("702"), eq("840"), eq("847130"), eq("MFN"))
        ).thenReturn(Collections.singletonList(overlappingTariff));

        testUpdateRequest.setEffectiveDate("2025-07-01");
        testUpdateRequest.setExpirationDate("2025-12-31");
        testUpdateRequest.setEffectiveDateProvided(true);
        testUpdateRequest.setExpirationDateProvided(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest)
        );

        assertTrue(ex.getMessage().contains("overlaps"));
    }

    @Test
    void updateTariff_ShouldSucceed_WhenNewEndsBeforeExistingStarts() {
        Tariff futureTariff = new Tariff();
        futureTariff.setEffectiveDate(LocalDate.of(2025, 6, 1));
        futureTariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                eq("702"), eq("840"), eq("847130"), eq("MFN"), any(LocalDate.class))
        ).thenReturn(Optional.of(testTariff));

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                eq("702"), eq("840"), eq("847130"), eq("MFN"))
        ).thenReturn(Collections.singletonList(futureTariff));

        when(tariffs.save(any(Tariff.class))).thenAnswer(inv -> inv.getArgument(0));

        testUpdateRequest.setEffectiveDate("2024-01-01");
        testUpdateRequest.setExpirationDate("2024-12-31");
        testUpdateRequest.setEffectiveDateProvided(true);
        testUpdateRequest.setExpirationDateProvided(true);

        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        assertEquals(LocalDate.of(2024, 1, 1), result.getEffectiveDate());
        assertEquals(LocalDate.of(2024, 12, 31), result.getExpirationDate());
    }

    @Test
    public void createTariff_ShouldThrowException_WhenNewTariffStartsBeforeExistingEnds() {
        // Existing tariff: 2025-01-01 to 2025-12-31
        Tariff existingTariff = new Tariff();
        existingTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        existingTariff.setExpirationDate(LocalDate.of(2025, 12, 31));

        // New tariff: starts 2025-06-01, ongoing (no end date)
        testCreateRequest.setEffectiveDate("2025-06-01");
        testCreateRequest.setExpirationDate(null);

        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN"))
            .thenReturn(true);
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN"))
            .thenReturn(Collections.singletonList(existingTariff));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> tariffService.createTariff(testCreateRequest));

        assertTrue(ex.getMessage().contains("The new tariff starts before the existing tariff ends."));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    // ========== updateTariff() Tests ==========
    @Test
    public void updateTariff_ShouldUpdateEffectiveDate_WhenEffectiveDateProvided() {
        // Arrange
        testUpdateRequest.setEffectiveDate("2025-06-01");
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        
        // Create a different tariff for the date validation check (exclude the one being updated)
        Tariff otherTariff = new Tariff();
        otherTariff.setId(2L);
        otherTariff.setEffectiveDate(LocalDate.of(2024, 1, 1));
        otherTariff.setExpirationDate(LocalDate.of(2024, 12, 31));
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(Arrays.asList(otherTariff)); // Return list without the tariff being updated
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldUpdateExpirationDate_WhenExpirationDateProvided() {
        // Arrange
        testUpdateRequest.setExpirationDate("2026-12-31");
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        
        // Create a different tariff for the date validation check
        Tariff otherTariff = new Tariff();
        otherTariff.setId(2L);
        otherTariff.setEffectiveDate(LocalDate.of(2024, 1, 1));
        otherTariff.setExpirationDate(LocalDate.of(2024, 12, 31));
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(Arrays.asList(otherTariff));
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldUpdateExpirationDate_WhenEffectiveAndExpirationDateProvided() {
        // Arrange
        testUpdateRequest.setEffectiveDate("2026-12-30");
        testUpdateRequest.setExpirationDate("2026-12-31");
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldUpdateExpirationDate_WhenExpirationDateRemoved() {
        // Arrange
        testUpdateRequest.setExpirationDate(null);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldUpdateStandardRate_WhenStandardRateProvided() {
        // Arrange
        testUpdateRequest.setStandardRate(10.0);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));        
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
        // Verify date validation was NOT called when only updating rate
        verify(tariffs, never()).findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void updateTariff_ShouldUpdateFlatFee_WhenFlatFeeProvided() {
        // Arrange
        testTariff.setStandardRate(null);
        testUpdateRequest.setFlatFee(100.0);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
        // Verify date validation was NOT called when only updating fee
        verify(tariffs, never()).findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenBothRateAndFeeUpdatedToNull() {
        // Arrange
        testUpdateRequest.setStandardRate(null);
        testTariff.setStandardRate(null);
        testTariff.setFlatFee(null);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("Cannot have both standardRate & flatFee or have none defined"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenBothRateAndFeeUpdatedToNonNull() {
        // Arrange
        testUpdateRequest.setStandardRate(10.0);
        testUpdateRequest.setFlatFee(200.0);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("Cannot have both standardRate & flatFee or have none defined"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenEffectiveDateRemoved() {
        // Arrange
        testUpdateRequest.setEffectiveDate(null);
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("Cannot remove a tariff's effective date"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenStartDateAfterEndDate() {
        // Arrange
        testUpdateRequest.setEffectiveDate("2025-12-31");
        testUpdateRequest.setExpirationDate("2025-01-01");
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("after its end date"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenDateOverlapsWithOtherTariffs() {
        // Arrange
        testUpdateRequest.setEffectiveDate("2025-06-01");
        
        Tariff otherTariff = new Tariff();
        otherTariff.setId(2L);
        otherTariff.setOriginCountry(testCountryA);
        otherTariff.setDestCountry(testCountryB);
        otherTariff.setHsCode(testHsCode);
        otherTariff.setTariffType("MFN");
        otherTariff.setEffectiveDate(LocalDate.of(2025, 6, 1));
        otherTariff.setExpirationDate(LocalDate.of(2025, 12, 31));
        
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(Arrays.asList(otherTariff));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("overlap"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    @Test
    public void updateTariff_ShouldThrowException_WhenTariffNotFound() {
        // Arrange
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.updateTariff("702", "840", "847130", "MFN", "2025-01-01", testUpdateRequest));

        assertTrue(exception.getMessage().contains("Tariff not found"));
        verify(tariffs, never()).save(any(Tariff.class));
    }

    // ========== updateTariffById() Tests ==========
    @Test
    public void updateTariffById_ShouldUpdateTariff_WhenValidRequest() {
        // Arrange
        testUpdateRequest.setStandardRate(10.0);
        
        when(tariffs.findById(1L)).thenReturn(Optional.of(testTariff));
        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
            .thenReturn(Optional.of(testTariff));
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Act
        Tariff result = tariffService.updateTariffById(1L, testUpdateRequest);

        // Assert
        assertNotNull(result);
        verify(tariffs).save(any(Tariff.class));
    }

    // ========== deleteTariff() Tests ==========
    @Test
    public void deleteTariff_ShouldDeleteTariff_WhenExists() {
        // Arrange
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(true);
        doNothing().when(tariffs).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1));

        // Act
        tariffService.deleteTariff("702", "840", "847130", "MFN", "2025-01-01");

        // Assert
        verify(tariffs).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1));
    }

    @Test
    public void deleteTariff_ShouldThrowException_WhenEffectiveDateNotGiven() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.deleteTariff("702", "840", "847130", "MFN", null));

        assertTrue(exception.getMessage().contains("valid effective date in the format YYYY-MM-DD"));
        verify(tariffs, never()).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            any(), any(), any(), any(), any());
    }

    @Test
    public void deleteTariff_ShouldThrowException_WhenEffectiveDateBlank() {
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.deleteTariff("702", "840", "847130", "MFN", ""));

        assertTrue(exception.getMessage().contains("valid effective date in the format YYYY-MM-DD"));
        verify(tariffs, never()).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            any(), any(), any(), any(), any());
    }

    @Test
    public void deleteTariff_ShouldThrowException_WhenTariffNotFound() {
        // Arrange
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType("702", "840", "847130", "MFN"))
            .thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.deleteTariff("702", "840", "847130", "MFN", "2025-01-01"));

        assertTrue(exception.getMessage().contains("Tariff not found"));
        verify(tariffs, never()).deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
            any(), any(), any(), any(), any());
    }

    // ========== deleteTariffById() Tests ==========
    @Test
    public void deleteTariffById_ShouldDeleteTariff_WhenExists() {
        // Arrange
        when(tariffs.existsById(1L)).thenReturn(true);
        doNothing().when(tariffs).deleteById(1L);

        // Act
        tariffService.deleteTariffById(1L);

        // Assert
        verify(tariffs).existsById(1L);
        verify(tariffs).deleteById(1L);
    }

    @Test
    public void deleteTariffById_ShouldThrowException_WhenTariffIdNotFound() {
        // Arrange
        when(tariffs.existsById(999L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tariffService.deleteTariffById(999L));

        assertTrue(exception.getMessage().contains("Tariff not found"));
    }

    // ========= getTariffsForWishlist() tests ===========
    @Test
    public void getTariffsForWishlist_ShouldReturnEmptyList_WhenWishlistIsEmpty() {
        when(wishlistService.getWishlistsByUserId("user-1"))
            .thenReturn(Collections.emptyList());

        List<Tariff> result = tariffService.getTariffsForWishlist("user-1");

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(tariffs, never()).findAll();
    }

    @Test
    public void getTariffsForWishlist_ShouldBuildSpecAndCallFindAll_WhenWishlistHasItems() {
        // Arrange: one wishlist item
        Wishlist item = new Wishlist();
        item.setUserId("user-1");
        item.setHsCode("847130");
        item.setExportingCountry("702");
        item.setImportingCountry("840");

        when(wishlistService.getWishlistsByUserId("user-1"))
                .thenReturn(Collections.singletonList(item));

        List<Tariff> tariffList = Collections.singletonList(testTariff);

        when(tariffs.findAll(ArgumentMatchers.<Specification<Tariff>>any()))
                .thenAnswer(invocation -> {
                    Specification<Tariff> spec = invocation.getArgument(0);

                    // Minimal JPA Criteria mocking
                    @SuppressWarnings("unchecked")
                    Root<Tariff> root = mock(Root.class);
                    CriteriaQuery<?> query = mock(CriteriaQuery.class);
                    CriteriaBuilder cb = mock(CriteriaBuilder.class);

                    @SuppressWarnings("unchecked")
                    Path<Object> hsPath = mock(Path.class);
                    @SuppressWarnings("unchecked")
                    Path<Object> originPath = mock(Path.class);
                    @SuppressWarnings("unchecked")
                    Path<Object> destPath = mock(Path.class);
                    @SuppressWarnings("unchecked")
                    Path<Object> hsCodePath = mock(Path.class);
                    @SuppressWarnings("unchecked")
                    Path<Object> originCodePath = mock(Path.class);
                    @SuppressWarnings("unchecked")
                    Path<Object> destCodePath = mock(Path.class);

                    when(root.get("hsCode")).thenReturn(hsPath);
                    when(root.get("originCountry")).thenReturn(originPath);
                    when(root.get("destCountry")).thenReturn(destPath);
                    when(hsPath.get("code")).thenReturn(hsCodePath);
                    when(originPath.get("code")).thenReturn(originCodePath);
                    when(destPath.get("code")).thenReturn(destCodePath);

                    spec.toPredicate(root, query, cb);

                    return tariffList;
                });

        // Act
        List<Tariff> result = tariffService.getTariffsForWishlist("user-1");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTariff, result.get(0));
        verify(tariffs).findAll(ArgumentMatchers.<Specification<Tariff>>any());
    }

    // ========= notifyWishlistUsers() tests ===========
    @Test
    public void createTariff_ShouldNotifyWishlistUsers_WhenMatchingWishlistExists() {
        // Arrange: normal createTariff happy-path setup
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN"))
            .thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Wishlist item that should match savedTariff
        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-1");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists(eq("847130"), eq("702"), eq("840")))
            .thenReturn(Collections.singletonList(wishlistItem));

        // Mock user lookup call
        UserDTO user = new UserDTO();
        user.setEmail("test@example.com");
        ResponseEntity<UserDTO> response = ResponseEntity.ok(user);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(response);

        // Act
        tariffService.createTariff(testCreateRequest);

        // Assert – verify email sent
        verify(emailService, times(1))
            .sendEmail(eq("test@example.com"),
                    contains("Tariff Update"),
                    contains("847130"));
    } 

    @Test
    public void notifyWishlistUsers_ShouldSkipUser_WhenUserNotFoundInUserService() {
        // Arrange: normal createTariff happy-path deps
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN")).thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("missing-user");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
                .thenReturn(Collections.singletonList(wishlistItem));

        HttpClientErrorException.NotFound notFound = mock(HttpClientErrorException.NotFound.class);

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenThrow(notFound);

        // Act
        tariffService.createTariff(testCreateRequest);

        // Assert: no email sent
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyWishlistUsers_ShouldSkipWhenUserServiceReturnsNullBody() {
        // Arrange: standard createTariff happy-path setup
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN"))
            .thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        // Matching wishlist item
        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-null-body");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
            .thenReturn(Collections.singletonList(wishlistItem));

        // User service responds 200 OK but with *null* body
        ResponseEntity<UserDTO> responseWithNullBody = ResponseEntity.ok(null);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(responseWithNullBody);

        // Act
        tariffService.createTariff(testCreateRequest);

        // Assert: userEmail stays null, so no email is sent
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyWishlistUsers_ShouldStopProcessing_WhenUserServiceUnauthorized() {
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN")).thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-unauth");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
                .thenReturn(Collections.singletonList(wishlistItem));

        HttpClientErrorException.Unauthorized unauthorized = mock(HttpClientErrorException.Unauthorized.class);

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenThrow(unauthorized);

        tariffService.createTariff(testCreateRequest);

        // Assert: we returned early, so no emails
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyWishlistUsers_ShouldSkipUser_WhenUserServiceThrowsGenericException() {
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN")).thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-error");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
                .thenReturn(Collections.singletonList(wishlistItem));

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenThrow(new RuntimeException("Service down"));

        tariffService.createTariff(testCreateRequest);

        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyWishlistUsers_ShouldSkipWhenUserHasNoEmail() {
        when(countries.findByCode("702")).thenReturn(Optional.of(testCountryA));
        when(countries.findByCode("840")).thenReturn(Optional.of(testCountryB));
        when(hscodes.findByCode("847130")).thenReturn(Optional.of(testHsCode));
        when(tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(
                "702", "840", "847130", "MFN")).thenReturn(false);
        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-no-email");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
                .thenReturn(Collections.singletonList(wishlistItem));

        UserDTO user = new UserDTO();
        user.setEmail(null);  // or ""

        ResponseEntity<UserDTO> response = ResponseEntity.ok(user);

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(response);

        tariffService.createTariff(testCreateRequest);

        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyWishlistUsers_ShouldFormatFlatFeeInEmailBody() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        testTariff.setStandardRate(null);
        testTariff.setFlatFee(100.0);
        testTariff.setExpirationDate(yesterday);

        when(tariffs.findAllByExpirationDate(yesterday))
                .thenReturn(Collections.singletonList(testTariff));

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-flatfee");
        wishlistItem.setHsCode(testTariff.getHsCode().getCode());
        wishlistItem.setExportingCountry(testTariff.getOriginCountry().getCode());
        wishlistItem.setImportingCountry(testTariff.getDestCountry().getCode());

        when(wishlistService.findMatchingWishlists(anyString(), anyString(), anyString()))
                .thenReturn(Collections.singletonList(wishlistItem));

        UserDTO user = new UserDTO();
        user.setEmail("flatfee@example.com");
        ResponseEntity<UserDTO> response = ResponseEntity.ok(user);

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(response);

        // Act
        tariffService.notifyForExpiredTariffs();

        // Assert email body contains "$100.00 (flat fee)" and the expiration date
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq("flatfee@example.com"), anyString(), bodyCaptor.capture());

        String body = bodyCaptor.getValue();
        assertTrue(body.contains("$100.00 (flat fee)"));
        assertTrue(body.contains(yesterday.toString()));
    }

    @Test
    public void notifyWishlistUsers_ShouldUseNAAndOngoing_WhenNoRateOrFeeAndNoExpiration() {
        // Tariff with no rate, no fee, ongoing
        testTariff.setStandardRate(null);
        testTariff.setFlatFee(null);
        testTariff.setExpirationDate(null);

        when(tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(
                "702", "840", "847130", "MFN", LocalDate.of(2025, 1, 1)))
                .thenReturn(Optional.of(testTariff));

        when(tariffs.save(any(Tariff.class))).thenReturn(testTariff);

        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-na");
        wishlistItem.setHsCode("847130");
        wishlistItem.setExportingCountry("702");
        wishlistItem.setImportingCountry("840");

        when(wishlistService.findMatchingWishlists("847130", "702", "840"))
                .thenReturn(Collections.singletonList(wishlistItem));

        UserDTO user = new UserDTO();
        user.setEmail("na@example.com");
        ResponseEntity<UserDTO> response = ResponseEntity.ok(user);

        when(restTemplate.exchange(anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(response);

        // No fields provided in testUpdateRequest -> no validation of rate/fee
        Tariff result = tariffService.updateTariff("702", "840", "847130", "MFN",
                "2025-01-01", testUpdateRequest);

        assertNotNull(result);

        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq("na@example.com"), anyString(), bodyCaptor.capture());

        String body = bodyCaptor.getValue();
        assertTrue(body.contains("Rate: N/A"));
        assertTrue(body.contains("Expiration Date: Ongoing"));
    }

    // ========= notifyForExpiredTariffs() tests ===========
    @Test
    public void notifyForExpiredTariffs_ShouldDoNothing_WhenNoExpiredTariffs() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        when(tariffs.findAllByExpirationDate(yesterday))
            .thenReturn(Collections.emptyList());

        tariffService.notifyForExpiredTariffs();

        // No wishlist lookups (so no notifications)
        verify(wishlistService, never())
            .findMatchingWishlists(anyString(), anyString(), anyString());
    }

    @Test
    public void notifyForExpiredTariffs_ShouldNotifyWishlistUsers_WhenTariffsExpired() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Use testTariff as the expired tariff
        testTariff.setExpirationDate(yesterday);
        when(tariffs.findAllByExpirationDate(yesterday))
            .thenReturn(Collections.singletonList(testTariff));

        // Matching wishlist for that tariff
        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setUserId("user-1");
        wishlistItem.setHsCode(testTariff.getHsCode().getCode());
        wishlistItem.setExportingCountry(testTariff.getOriginCountry().getCode());
        wishlistItem.setImportingCountry(testTariff.getDestCountry().getCode());

        when(wishlistService.findMatchingWishlists(anyString(), anyString(), anyString()))
            .thenReturn(Collections.singletonList(wishlistItem));

        // Mock user lookup
        UserDTO user = new UserDTO();
        user.setEmail("expired@example.com");
        ResponseEntity<UserDTO> response = ResponseEntity.ok(user);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(UserDTO.class)))
            .thenReturn(response);

        // Act
        tariffService.notifyForExpiredTariffs();

        // Assert: email was sent for the expired tariff
        verify(emailService, times(1))
            .sendEmail(eq("expired@example.com"),
                    contains("Tariff Update"),
                    contains("expired"));
    }
}
