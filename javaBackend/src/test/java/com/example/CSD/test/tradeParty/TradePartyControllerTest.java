package com.example.CSD.test.tradeParty;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.CSD.test.tradeParty.*;
import com.example.CSD.tradeParty.TradePartyService;
import com.example.CSD.tradeParty.TradePartyV1Controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TradePartyV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
class TradePartyControllerTest {
    private static final String BASE_URL = "/api/v1/tradeParties";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TradePartyService tradePartyService;

    @Test
    void index_ShouldReturnHealthMessage_WhenTestEndpointCalled() throws Exception {
        mockMvc.perform(get(String.format("%s/test", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("TradeParty microservice")));
    }
}

