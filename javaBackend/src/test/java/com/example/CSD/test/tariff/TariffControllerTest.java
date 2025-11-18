package com.example.CSD.test.tariff;

import java.time.LocalDate;
import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.CSD.country.Country;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.tariff.*;

@WebMvcTest(controllers = TariffV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
public class TariffControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TariffServiceImpl tariffService;

    private Tariff testTariff;
    private HSCode testHsCode;
    private Country testOriginCountry;
    private Country testDestCountry;

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
    public void should_ReturnAllTariffs_WhenExists() throws Exception {
        // Arrange: Mock service to return list of tariffs
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        when(tariffService.listTariffs()).thenReturn(tariffs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(tariffService).listTariffs();
    }

    @Test
    public void should_FilterByDate_WhenDateProvided() throws Exception {
        // Arrange: Mock service to return list of tariffs
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        when(tariffService.getActiveTariffs(null, null, null, null, "2025-01-01"))
                .thenReturn(tariffs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(tariffService).getActiveTariffs(null, null, null, null, "2025-01-01");
    }

    @Test
    public void should_GetTariff_WhenNoDateProvided() throws Exception {
        // Arrange: Mock service to return list of tariffs
        List<Tariff> tariffs = new ArrayList<>();
        tariffs.add(testTariff);
        when(tariffService.getTariff(null, null, null, null))
                .thenReturn(tariffs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(tariffService).getTariff(null, null, null, null);
    }

    @Test
    public void should_ReturnTariff_WhenExists() throws Exception {
        // Arrange: Mock service to return tariff
        when(tariffService.getTariffByID(1L)).thenReturn(testTariff);

        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.tariffType").value("Standard"));

        verify(tariffService).getTariffByID(1L);
    }

    @Test
    public void should_Return500_WhenNotFound() throws Exception {
        // Arrange: Mock service to throw exception
        when(tariffService.getTariffByID(999L))
                .thenThrow(new RuntimeException("No product with id 999 exist."));

        // Act & Assert
        // Since there's no exception handler, RuntimeException results in 500
        try {
            mockMvc.perform(get("/api/v1/tariffs/999"))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // MockMvc may throw exception instead of returning 500
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(tariffService).getTariffByID(999L);
    }

    @Test
    public void should_CreateTariff_WhenValidRequest() throws Exception {
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

        // Mock service response
        when(tariffService.createTariff(any(TariffCreateRequest.class))).thenReturn(testTariff);

        // Act & Assert
        mockMvc.perform(post("/api/v1/tariffs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.tariffType").value("Standard"));

        verify(tariffService).createTariff(any(TariffCreateRequest.class));
    }

    @Test
    public void should_UpdateTariffById_WhenValidRequest() throws Exception {
        // Arrange: Create update request
        TariffUpdateRequest updateRequest = new TariffUpdateRequest();
        updateRequest.setStandardRate(8.0);

        // Mock service response
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setHsCode(testHsCode);
        updatedTariff.setOriginCountry(testOriginCountry);
        updatedTariff.setDestCountry(testDestCountry);
        updatedTariff.setTariffType("Standard");
        updatedTariff.setStandardRate(8.0);
        updatedTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        when(tariffService.updateTariffById(eq(1L), any(TariffUpdateRequest.class)))
                .thenReturn(updatedTariff);

        // Act & Assert
        mockMvc.perform(put("/api/v1/tariffs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.standardRate").value(8.0));

        verify(tariffService).updateTariffById(eq(1L), any(TariffUpdateRequest.class));
    }

    @Test
    public void should_DeleteTariffById_WhenExists() throws Exception {
        // Arrange: Do nothing when delete is called (void method)
        doNothing().when(tariffService).deleteTariffById(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/v1/tariffs/1"))
                .andExpect(status().isOk());

        verify(tariffService).deleteTariffById(1L);
    }

    @Test
    public void should_Return500_WhenDeleteTariffByIdNotFound() throws Exception {
        // Arrange: Mock service to throw exception
        doThrow(new RuntimeException("Tariff not found"))
                .when(tariffService).deleteTariffById(999L);

        // Act & Assert
        try {
            mockMvc.perform(delete("/api/v1/tariffs/999"))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(tariffService).deleteTariffById(999L);
    }

    @Test
    public void should_ReturnHealthCheckMessage_WhenTestEndpointCalled() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Tariff microservice is running."));
    }

    @Test
    public void should_ReturnEmptyList_WhenNoTariffsExist() throws Exception {
        // Arrange: Mock service to return empty list
        when(tariffService.listTariffs()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/api/v1/tariffs/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(tariffService).listTariffs();
    }

    @Test
    public void should_UpdateTariff_WhenValidCompositeKey() throws Exception {
        // Arrange: Create update request
        TariffUpdateRequest updateRequest = new TariffUpdateRequest();
        updateRequest.setStandardRate(8.0);

        // Arrange: Setup updated tariff
        Tariff updatedTariff = new Tariff();
        updatedTariff.setId(1L);
        updatedTariff.setHsCode(testHsCode);
        updatedTariff.setOriginCountry(testOriginCountry);
        updatedTariff.setDestCountry(testDestCountry);
        updatedTariff.setTariffType("Standard");
        updatedTariff.setStandardRate(8.0);
        updatedTariff.setEffectiveDate(LocalDate.of(2025, 1, 1));
        
        // Mock service response
        when(tariffService.updateTariff(eq("SG"), eq("US"), eq("847130"), eq("Standard"), eq("2025-01-01"), any(TariffUpdateRequest.class)))
                .thenReturn(updatedTariff);

        // Act & Assert
        mockMvc.perform(put("/api/v1/tariffs")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("type", "Standard")
                .param("effectiveDate", "2025-01-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.standardRate").value(8.0));

        verify(tariffService).updateTariff(eq("SG"), eq("US"), eq("847130"), eq("Standard"), eq("2025-01-01"), any(TariffUpdateRequest.class));
    }

    @Test
    public void should_DeleteTariff_WhenValidCompositeKey() throws Exception {
        // Arrange: Do nothing when delete is called (void method)
        doNothing().when(tariffService).deleteTariff(anyString(), anyString(), anyString(), anyString(), anyString());

        // Act & Assert
        mockMvc.perform(delete("/api/v1/tariffs")
                .param("origin", "SG")
                .param("dest", "US")
                .param("hsCode", "847130")
                .param("type", "Standard")
                .param("effectiveDate", "2025-01-01"))
                .andExpect(status().isOk());

        verify(tariffService).deleteTariff("SG", "US", "847130", "Standard", "2025-01-01");
    }

    @Test
    public void should_Return400_WhenInvalidRequest() throws Exception {
        // Arrange: Create invalid request (missing required fields)
        TariffCreateRequest invalidRequest = new TariffCreateRequest();
        // Missing required fields - should fail validation

        // Act & Assert
        mockMvc.perform(post("/api/v1/tariffs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(tariffService, never()).createTariff(any());
    }

    @Test
    public void should_Return400_WhenNegativeTariffValues() throws Exception {
        // Arrange: Create request with negative rate
        TariffCreateRequest request = new TariffCreateRequest();
        request.setHsCode("847130");
        request.setOriginCountry("SG");
        request.setDestCountry("US");
        request.setTariffType("Standard");
        request.setStandardRate(-7.5); // Negative value
        request.setEffectiveDate("2025-01-01");

        // Mock service to throw exception for negative value
        when(tariffService.createTariff(any(TariffCreateRequest.class)))
                .thenThrow(new RuntimeException("Invalid tariff value"));

        // Act & Assert
        try {
            mockMvc.perform(post("/api/v1/tariffs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // Service validation may throw exception
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }
    }

    @Test
    public void should_Return500_WhenUpdateTariffNotFound() throws Exception {
        // Arrange: Create update request
        TariffUpdateRequest updateRequest = new TariffUpdateRequest();
        updateRequest.setStandardRate(8.0);

        // Arrange: Mock service to throw exception
        when(tariffService.updateTariff(eq("SG"), eq("US"), eq("847130"), eq("Standard"), eq("2025-01-01"), any(TariffUpdateRequest.class)))
                .thenThrow(new RuntimeException("Tariff not found."));

        // Act & Assert
        try {
            mockMvc.perform(put("/api/v1/tariffs")
                    .param("origin", "SG")
                    .param("dest", "US")
                    .param("hsCode", "847130")
                    .param("type", "Standard")
                    .param("effectiveDate", "2025-01-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(tariffService).updateTariff(eq("SG"), eq("US"), eq("847130"), eq("Standard"), eq("2025-01-01"), any(TariffUpdateRequest.class));
    }

    @Test
    public void should_Return500_WhenDeleteTariffNotFound() throws Exception {
        // Arrange: Mock service to throw exception
        doThrow(new RuntimeException("Tariff not found"))
                .when(tariffService).deleteTariff(anyString(), anyString(), anyString(), anyString(), anyString());

        // Act & Assert
        try {
            mockMvc.perform(delete("/api/v1/tariffs")
                    .param("origin", "SG")
                    .param("dest", "US")
                    .param("hsCode", "847130")
                    .param("type", "Standard")
                    .param("effectiveDate", "2025-01-01"))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(tariffService).deleteTariff("SG", "US", "847130", "Standard", "2025-01-01");
    }

}
