package com.example.CSD.tradeParty;

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

@WebMvcTest(TradePartyV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class TradePartyV1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TradePartyService tradePartyService;

    @Test
    void should_ReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get("/api/v1/tradeParties/test"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("TradeParty microservice")));
    }
}

