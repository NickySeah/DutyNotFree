package com.example.CSD.bloc;

import com.example.CSD.country.Country;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;

import static org.junit.jupiter.api.Assertions.*;

class BlocTest {

    @Test
    void should_MaintainMemberCountriesAndTradeParty() {
        Bloc bloc = new Bloc();
        bloc.setCode("ASEAN");
        bloc.setName("Association of Southeast Asian Nations");
        bloc.setMemberCountries(new LinkedHashSet<>());

        Country singapore = new Country();
        singapore.setCode("702");
        singapore.setName("Singapore");
        singapore.setAlpha3("SGP");

        bloc.getMemberCountries().add(singapore);

        assertEquals("ASEAN", bloc.getCode());
        assertEquals(1, bloc.getMemberCountries().size());
        assertTrue(bloc.toString().contains("Association"));
    }
}

