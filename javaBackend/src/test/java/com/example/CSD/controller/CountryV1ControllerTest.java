package com.example.CSD.controller;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryService;
import com.example.CSD.country.CountryV1Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CountryV1Controller.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class CountryV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CountryService countryService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/countries/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Country microservice")));
    }

    @Test
    void should_ReturnAllCountries_WhenAllEndpointCalled() throws Exception {
        Country sample = new Country();
        sample.setCode("702");
        sample.setName("Singapore");
        sample.setAlpha3("SGP");

        Mockito.when(countryService.listCountries()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get("/api/v1/countries/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("702"));
    }

    @Test
    void should_InvokeSearch_WhenQueryParametersProvided() throws Exception {
        Mockito.when(countryService.getCountry("702", null, null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/countries").param("iso", "702"))
                .andExpect(status().isOk());

        Mockito.verify(countryService).getCountry("702", null, null);
    }

    @Test
    void should_CreateCountry_WhenPostRequestValid() throws Exception {
        Country request = new Country();
        request.setCode("702");
        request.setName("Singapore");
        request.setAlpha3("SGP");

        Mockito.when(countryService.addCountry(any(Country.class))).thenReturn(request);

        mockMvc.perform(post("/api/v1/countries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("702"));
    }

    @Test
    void should_UpdateCountry_WhenPutRequestValid() throws Exception {
        Country response = new Country();
        response.setCode("702");
        response.setName("Republic of Singapore");
        response.setAlpha3("SGP");

        Mockito.when(countryService.updateCountry(eq("702"), any(Country.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/countries").param("iso", "702")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(response)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Republic of Singapore"));
    }

    @Test
    void should_DeleteCountry_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete("/api/v1/countries").param("iso", "702"))
                .andExpect(status().isOk());

        Mockito.verify(countryService).deleteCountry("702");
    }
}

