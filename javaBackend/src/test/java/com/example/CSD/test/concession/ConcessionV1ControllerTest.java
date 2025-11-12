package com.example.CSD.test.concession;

import com.example.CSD.concession.ConcessionService;
import com.example.CSD.concession.ConcessionV1Controller;
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

@WebMvcTest(ConcessionV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class ConcessionV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConcessionService concessionService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/concessions/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("concession microservice")));
    }
}

