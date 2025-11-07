package com.example.CSD.tradeParty;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.country.Country;
import com.example.CSD.fta.FTA;
import org.junit.jupiter.api.Test;

import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

class TradePartyTest {

    @Test
    void should_LinkCountryAndBlocMemberships() {
        Country country = new Country();
        country.setCode("124");
        country.setName("Canada");
        country.setAlpha3("CAN");

        Bloc bloc = new Bloc();
        bloc.setCode("CPTPP");
        bloc.setName("Comprehensive and Progressive Agreement for Trans-Pacific Partnership");

        TradeParty tradeParty = new TradeParty();
        tradeParty.setId(9L);
        tradeParty.setType(TradeParty.PartyType.COUNTRY);
        tradeParty.setCountry(country);
        tradeParty.setBloc(bloc);
        tradeParty.setFtasAsPartyA(new HashSet<>());
        tradeParty.setFtasAsPartyB(new HashSet<>());

        FTA fta = new FTA();
        fta.setId(15L);
        fta.setPartyA(tradeParty);
        tradeParty.getFtasAsPartyA().add(fta);

        assertEquals(country, tradeParty.getCountry());
        assertEquals(bloc, tradeParty.getBloc());
        assertEquals(1, tradeParty.getFtasAsPartyA().size());
        assertNotNull(tradeParty.toString());
    }
}

