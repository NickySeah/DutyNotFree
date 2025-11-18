package com.example.CSD.test.tradeParty;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.tradeParty.TradeParty;
import com.example.CSD.tradeParty.TradeParty.PartyType;
import com.example.CSD.tradeParty.TradePartyRepository;
import com.example.CSD.tradeParty.TradePartyService;
import com.example.CSD.tradeParty.TradePartyServiceImpl;

@ExtendWith(MockitoExtension.class)
class TradePartyServiceTest {
    @Test
    void ShouldConstructService_WhenRepositoryProvided() {
        TradePartyRepository repository = Mockito.mock(TradePartyRepository.class);
        TradePartyService service = new TradePartyServiceImpl(repository);

        assertNotNull(service);
    }

    @Test
    public void tradeParty_getName_ShouldReturnBlocName_WhenTypeIsBloc() {
        TradeParty blocParty = new TradeParty();
        blocParty.setType(PartyType.BLOC);

        Bloc bloc = new Bloc();
        bloc.setName("ASEAN");
        bloc.setTradeParty(blocParty);
        blocParty.setBloc(bloc);

        String result = blocParty.getName();

        assertEquals("ASEAN", result);
}
}