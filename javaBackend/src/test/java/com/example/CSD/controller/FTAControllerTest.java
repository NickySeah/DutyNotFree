package com.example.CSD.controller;

import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTACreateRequest;
import com.example.CSD.fta.FTAService;
import com.example.CSD.fta.FTAUpdateRequest;
import com.example.CSD.fta.FTAV1Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = FTAV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
public class FTAControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FTAService ftaService;

    private FTA testFTA;

    @BeforeEach
    public void setUp() {
        testFTA = new FTA();
        testFTA.setId(1L);
        testFTA.setType(FTA.FTAType.BILATERAL);
        testFTA.setDefaultRate(5.0);
        testFTA.setEffectiveDate(LocalDate.of(2025, 1, 1));
        testFTA.setExpirationDate(LocalDate.of(2025, 12, 31));
    }

    @Test
    public void should_ReturnHealthCheckMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/ftas/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("FTA microservice is running."));
    }

    @Test
    public void should_ReturnAllFTAs_WhenGetAllEndpointCalled() throws Exception {
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);

        when(ftaService.listFTAs()).thenReturn(ftas);

        mockMvc.perform(get("/api/v1/ftas/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(ftaService).listFTAs();
    }

    @Test
    public void should_ReturnFTAs_WhenSearchEndpointCalled() throws Exception {
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);

        when(ftaService.getFTA(null, null, null)).thenReturn(ftas);

        mockMvc.perform(get("/api/v1/ftas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(ftaService).getFTA(null, null, null);
    }

    @Test
    public void should_ReturnActiveFTAs_WhenDateProvided() throws Exception {
        List<FTA> ftas = new ArrayList<>();
        ftas.add(testFTA);

        when(ftaService.getActiveFTA(null, null, null, "2025-01-01")).thenReturn(ftas);

        mockMvc.perform(get("/api/v1/ftas")
                .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(ftaService).getActiveFTA(null, null, null, "2025-01-01");
    }

    @Test
    public void should_ReturnFTA_WhenGetByIdEndpointCalled() throws Exception {
        when(ftaService.getFTAByID(1L)).thenReturn(testFTA);

        mockMvc.perform(get("/api/v1/ftas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(ftaService).getFTAByID(1L);
    }

    @Test
    public void should_CreateFTA_WhenPostEndpointCalled() throws Exception {
        FTACreateRequest request = new FTACreateRequest();
        request.setPartyA("SG");
        request.setPartyB("US");
        request.setDefaultRate(5.0);
        request.setEffectiveDate("2025-01-01");

        when(ftaService.createFTA(any(FTACreateRequest.class))).thenReturn(testFTA);

        mockMvc.perform(post("/api/v1/ftas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));

        verify(ftaService).createFTA(any(FTACreateRequest.class));
    }

    @Test
    public void should_UpdateFTA_WhenPutEndpointCalled() throws Exception {
        FTAUpdateRequest request = new FTAUpdateRequest();
        request.setDefaultRate(6.0);

        when(ftaService.updateFTA(eq(1L), any(FTAUpdateRequest.class))).thenReturn(testFTA);

        mockMvc.perform(put("/api/v1/ftas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(ftaService).updateFTA(eq(1L), any(FTAUpdateRequest.class));
    }

    @Test
    public void should_DeleteFTA_WhenDeleteEndpointCalled() throws Exception {
        doNothing().when(ftaService).deleteFTA(1L);

        mockMvc.perform(delete("/api/v1/ftas/1"))
                .andExpect(status().isOk());

        verify(ftaService).deleteFTA(1L);
    }

    @Test
    public void should_ThrowException_WhenFTANotFound() throws Exception {
        when(ftaService.getFTAByID(999L))
                .thenThrow(new RuntimeException("No FTA with id 999 exist."));

        // The controller doesn't have exception handling, so the exception propagates
        // This test verifies the service is called and throws the expected exception
        try {
            mockMvc.perform(get("/api/v1/ftas/999"));
        } catch (Exception e) {
            // Exception is expected - verify service was called
            verify(ftaService).getFTAByID(999L);
            return;
        }
        // If we reach here, the exception wasn't thrown
        throw new AssertionError("Expected RuntimeException to be thrown");
    }
}
