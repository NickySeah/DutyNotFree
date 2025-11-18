package com.example.CSD.test.concession;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.CSD.concession.*;

@WebMvcTest(ConcessionV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class ConcessionV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConcessionServiceImpl concessionService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/concessions/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("concession microservice")));
    }
}

