package com.example.CSD.country;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.tradeParty.TradeParty;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;

import static org.junit.jupiter.api.Assertions.*;

class CountryTest {

    @Test
    void should_SetAndGetAllFields() {
        Country country = new Country();
        country.setCode("702");
        country.setName("Singapore");
        country.setAlpha3("SGP");

        assertEquals("702", country.getCode());
        assertEquals("Singapore", country.getName());
        assertEquals("SGP", country.getAlpha3());
    }

    @Test
    void should_AssociateWithBlocAndTradeParty() {
        Country country = new Country();
        country.setCode("840");
        country.setName("United States");
        country.setAlpha3("USA");

        Bloc bloc = new Bloc();
        bloc.setCode("NAFTA");
        bloc.setName("North American Free Trade Agreement");
        bloc.setMemberCountries(new LinkedHashSet<>());
        bloc.getMemberCountries().add(country);

        TradeParty tradeParty = new TradeParty();
        tradeParty.setId(1L);
        tradeParty.setType(TradeParty.PartyType.COUNTRY);
        tradeParty.setCountry(country);

        country.setBlocs(new LinkedHashSet<>());
        country.getBlocs().add(bloc);
        country.setTradeParty(tradeParty);

        assertTrue(country.getBlocs().contains(bloc));
        assertEquals(tradeParty, country.getTradeParty());
        assertTrue(country.toString().contains("United States"));
    }
}

