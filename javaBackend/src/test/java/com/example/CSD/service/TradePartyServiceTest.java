package com.example.CSD.service;

import com.example.CSD.tradeParty.TradePartyRepository;
import com.example.CSD.tradeParty.TradePartyService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class TradePartyServiceTest {

    @Test
    void should_ConstructService_WhenRepositoryProvided() {
        TradePartyRepository repository = Mockito.mock(TradePartyRepository.class);
        TradePartyService service = new TradePartyService(repository);

        assertNotNull(service);
    }
}

