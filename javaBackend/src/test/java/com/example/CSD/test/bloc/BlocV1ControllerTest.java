package com.example.CSD.test.bloc;

import java.util.*;

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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.CSD.bloc.*;

@WebMvcTest(BlocV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class BlocV1ControllerTest {
    private static final String BASE_URL = "/api/v1/blocs";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BlocService blocService;

    @Test
    void index_ShouldReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get(String.format("%s/test", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Bloc microservice")));
    }

    @Test
    void getAllBlocs_ShouldReturnAllBlocs_WhenAllEndpointCalled() throws Exception {
        Bloc sample = new Bloc();
        sample.setCode("ASEAN");
        sample.setName("ASEAN");
        sample.setMemberCountries(new LinkedHashSet<>());

        Mockito.when(blocService.listBlocs()).thenReturn(Collections.singletonList(sample));

        mockMvc.perform(get(String.format("%s/all", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("ASEAN"));
    }

    @Test
    void getBloc_ShouldInvokeService_WhenSearchEndpointCalled() throws Exception {
        Mockito.when(blocService.getBloc("ASE", null, null, null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get(BASE_URL).param("keyword", "ASE"))
                .andExpect(status().isOk());

        Mockito.verify(blocService).getBloc("ASE", null, null, null);
    }

    @Test
    void addBloc_ShouldCreateBloc_WhenPostRequestValid() throws Exception {
        BlocCreateRequest request = new BlocCreateRequest();
        request.setCode("NAFTA");
        request.setName("NAFTA");
        request.setMemberCodes(new LinkedHashSet<>(Set.of("124", "484")));

        Bloc response = new Bloc();
        response.setCode("NAFTA");
        response.setName("NAFTA");

        Mockito.when(blocService.addBloc(any(BlocCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("NAFTA"));
    }

    @Test
    void updateBloc_ShouldUpdateBloc_WhenPutRequestValid() throws Exception {
        BlocUpdateRequest request = new BlocUpdateRequest(Set.of("360"), Set.of("702"));
        Bloc response = new Bloc();
        response.setCode("ASEAN");

        Mockito.when(blocService.updateBloc(eq("ASEAN"), any(BlocUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put(BASE_URL).param("code", "ASEAN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("ASEAN"));
    }

    @Test
    void deleteBloc_ShouldDeleteBloc_WhenDeleteRequestValid() throws Exception {
        mockMvc.perform(delete(BASE_URL).param("code", "ASEAN"))
                .andExpect(status().isOk());

        Mockito.verify(blocService).deleteBloc("ASEAN");
    }
}

