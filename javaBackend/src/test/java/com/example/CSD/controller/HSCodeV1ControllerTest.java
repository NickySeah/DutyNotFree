package com.example.CSD.hscode;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HSCodeV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class HSCodeV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HSCodeService hsCodeService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/hscodes/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("HS Code microservice")));
    }

    @Test
    void should_ReturnAllHSCodes_WhenAllEndpointCalled() throws Exception {
        HSCode sample = new HSCode();
        sample.setCode("847130");
        sample.setDescription("Portable computers");

        Mockito.when(hsCodeService.listHSCode()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get("/api/v1/hscodes/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("847130"));
    }

    @Test
    void should_InvokeFilter_WhenQueryParamsProvided() throws Exception {
        Mockito.when(hsCodeService.getHSCode("847130", null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/hscodes").param("code", "847130"))
                .andExpect(status().isOk());

        Mockito.verify(hsCodeService).getHSCode("847130", null);
    }

    @Test
    void should_CreateHSCode_WhenPostRequestValid() throws Exception {
        HSCode request = new HSCode();
        request.setCode("847130");
        request.setDescription("Portable computers");

        Mockito.when(hsCodeService.addHSCode(any(HSCode.class))).thenReturn(request);

        mockMvc.perform(post("/api/v1/hscodes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("847130"));
    }

    @Test
    void should_UpdateHSCode_WhenPutRequestValid() throws Exception {
        HSCode response = new HSCode();
        response.setCode("847130");
        response.setDescription("Updated");

        Mockito.when(hsCodeService.updateHSCode(eq("847130"), any(HSCode.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/hscodes").param("code", "847130")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(response)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated"));
    }

    @Test
    void should_DeleteHSCode_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete("/api/v1/hscodes").param("code", "847130"))
                .andExpect(status().isOk());

        Mockito.verify(hsCodeService).deleteHSCode("847130");
    }
}

