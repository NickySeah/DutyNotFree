package com.example.CSD.test.hscode;

import java.util.Collections;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.CSD.hscode.*;

@WebMvcTest(HSCodeV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class HSCodeV1ControllerTest {
    private static final String BASE_URL = "/api/v1/hscodes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HSCodeService hsCodeService;

    @Test
    void index_ShouldReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get(String.format("%s/test",BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("HS Code microservice")));
    }

    @Test
    void getAllHSCode_ShouldReturnAllHSCodes_WhenAllEndpointCalled() throws Exception {
        HSCode sample = new HSCode();
        sample.setCode("847130");
        sample.setDescription("Portable computers");

        Mockito.when(hsCodeService.listHSCode()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get(String.format("%s/all",BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("847130"));
    }

    @Test
    void getHSCode_ShouldInvokeFilter_WhenQueryParamsProvided() throws Exception {
        Mockito.when(hsCodeService.getHSCode("847130", null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get(BASE_URL).param("code", "847130"))
                .andExpect(status().isOk());

        Mockito.verify(hsCodeService).getHSCode("847130", null);
    }

    @Test
    void addHSCode_ShouldCreateHSCode_WhenPostRequestValid() throws Exception {
        HSCode request = new HSCode();
        request.setCode("847130");
        request.setDescription("Portable computers");

        Mockito.when(hsCodeService.addHSCode(any(HSCode.class))).thenReturn(request);

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("847130"));
    }

    @Test
    void updateHSCode_ShouldUpdateHSCode_WhenPutRequestValid() throws Exception {
        HSCode response = new HSCode();
        response.setCode("847130");
        response.setDescription("Updated");

        Mockito.when(hsCodeService.updateHSCode(eq("847130"), any(HSCode.class))).thenReturn(response);

        mockMvc.perform(put(BASE_URL).param("code", "847130")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(response)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated"));
    }

    @Test
    void deleteHSCode_ShouldDeleteHSCode_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete(BASE_URL).param("code", "847130"))
                .andExpect(status().isOk());

        Mockito.verify(hsCodeService).deleteHSCode("847130");
    }
}

