package com.example.CSD.controller;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.bloc.BlocCreateRequest;
import com.example.CSD.bloc.BlocService;
import com.example.CSD.bloc.BlocUpdateRequest;
import com.example.CSD.bloc.BlocV1Controller;
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
import java.util.LinkedHashSet;
import java.util.Set;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BlocV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class BlocV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BlocService blocService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/blocs/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Bloc microservice")));
    }

    @Test
    void should_ReturnAllBlocs_WhenAllEndpointCalled() throws Exception {
        Bloc sample = new Bloc();
        sample.setCode("ASEAN");
        sample.setName("ASEAN");
        sample.setMemberCountries(new LinkedHashSet<>());

        Mockito.when(blocService.listBlocs()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get("/api/v1/blocs/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("ASEAN"));
    }

    @Test
    void should_InvokeService_WhenSearchEndpointCalled() throws Exception {
        Mockito.when(blocService.getBloc("ASE", null, null, null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/blocs").param("keyword", "ASE"))
                .andExpect(status().isOk());

        Mockito.verify(blocService).getBloc("ASE", null, null, null);
    }

    @Test
    void should_CreateBloc_WhenPostRequestValid() throws Exception {
        BlocCreateRequest request = new BlocCreateRequest();
        request.setCode("NAFTA");
        request.setName("NAFTA");
        request.setMemberCodes(new LinkedHashSet<>(Set.of("124", "484")));

        Bloc response = new Bloc();
        response.setCode("NAFTA");
        response.setName("NAFTA");

        Mockito.when(blocService.addBloc(any(BlocCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/blocs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("NAFTA"));
    }

    @Test
    void should_UpdateBloc_WhenPutRequestValid() throws Exception {
        BlocUpdateRequest request = new BlocUpdateRequest(Set.of("360"), Set.of("702"));
        Bloc response = new Bloc();
        response.setCode("ASEAN");

        Mockito.when(blocService.updateBloc(eq("ASEAN"), any(BlocUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/blocs").param("code", "ASEAN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("ASEAN"));
    }

    @Test
    void should_DeleteBloc_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete("/api/v1/blocs").param("code", "ASEAN"))
                .andExpect(status().isOk());

        Mockito.verify(blocService).deleteBloc("ASEAN");
    }
}

