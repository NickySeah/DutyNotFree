package com.example.CSD.test.tradeParty;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.CSD.tradeParty.TradePartyRepository;
import com.example.CSD.tradeParty.TradePartyService;

@ExtendWith(MockitoExtension.class)
class TradePartyServiceTest {
    @Test
    void ShouldConstructService_WhenRepositoryProvided() {
        TradePartyRepository repository = Mockito.mock(TradePartyRepository.class);
        TradePartyService service = new TradePartyService(repository);

        assertNotNull(service);
    }
}