package com.example.CSD.test.bloc;

import java.util.LinkedHashSet;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.example.CSD.country.Country;
import com.example.CSD.bloc.Bloc;

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