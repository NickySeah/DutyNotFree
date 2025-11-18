package com.example.CSD.test.country;

import java.util.Collections;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.CSD.country.*;

@WebMvcTest(CountryV1Controller.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class CountryV1ControllerTest {
    private static final String BASE_URL = "/api/v1/countries";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CountryServiceImpl countryService;

    @Test
    void index_ShouldReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get(String.format("%s/test", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Country microservice")));
    }

    @Test
    void getAllCountry_ShouldReturnAllCountries_WhenAllEndpointCalled() throws Exception {
        Country sample = new Country();
        sample.setCode("702");
        sample.setName("Singapore");
        sample.setAlpha3("SGP");

        Mockito.when(countryService.listCountries()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get(String.format("%s/all", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("702"));
    }

    @Test
    void getCountry_ShouldInvokeSearch_WhenQueryParametersProvided() throws Exception {
        Mockito.when(countryService.getCountry("702", null, null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get(BASE_URL).param("iso", "702"))
                .andExpect(status().isOk());

        Mockito.verify(countryService).getCountry("702", null, null);
    }

    @Test
    void addCountry_ShouldCreateCountry_WhenPostRequestValid() throws Exception {
        Country request = new Country();
        request.setCode("702");
        request.setName("Singapore");
        request.setAlpha3("SGP");

        Mockito.when(countryService.addCountry(any(Country.class))).thenReturn(request);

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("702"));
    }

    @Test
    void updateCountry_ShouldUpdateCountry_WhenPutRequestValid() throws Exception {
        Country response = new Country();
        response.setCode("702");
        response.setName("Republic of Singapore");
        response.setAlpha3("SGP");

        Mockito.when(countryService.updateCountry(eq("702"), any(Country.class))).thenReturn(response);

        mockMvc.perform(put(BASE_URL).param("iso", "702")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(response)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Republic of Singapore"));
    }

    @Test
    void deleteCountry_ShouldDeleteCountry_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete(BASE_URL).param("iso", "702"))
                .andExpect(status().isOk());

        Mockito.verify(countryService).deleteCountry("702");
    }
}

