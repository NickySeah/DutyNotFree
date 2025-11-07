package com.example.CSD.service;

import com.example.CSD.bloc.*;
import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.tradeParty.TradeParty;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlocServiceTest {

    @Mock
    private BlocRepository blocRepository;

    @Mock
    private CountryRepository countryRepository;

    @InjectMocks
    private BlocService blocService;

    private Bloc sampleBloc;
    private Country sg;
    private Country my;

    @BeforeEach
    void setUp() {
        sg = new Country();
        sg.setCode("702");
        sg.setName("Singapore");
        sg.setAlpha3("SGP");

        my = new Country();
        my.setCode("458");
        my.setName("Malaysia");
        my.setAlpha3("MYS");

        sampleBloc = new Bloc();
        sampleBloc.setCode("ASEAN");
        sampleBloc.setName("Association of Southeast Asian Nations");
        sampleBloc.setMemberCountries(new LinkedHashSet<>(Arrays.asList(sg, my)));

        TradeParty tradeParty = new TradeParty();
        tradeParty.setId(1L);
        tradeParty.setType(TradeParty.PartyType.BLOC);
        tradeParty.setBloc(sampleBloc);
        tradeParty.setFtasAsPartyA(new HashSet<>());
        tradeParty.setFtasAsPartyB(new HashSet<>());
        sampleBloc.setTradeParty(tradeParty);
    }

    @Test
    void should_ListBlocs_WhenNoFiltersProvided() {
        when(blocRepository.findAll()).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.getBloc(null, null, null, null);

        assertEquals(1, result.size());
        verify(blocRepository).findAll();
    }

    @Test
    void should_FilterBlocsByMemberCountries() {
        Set<Country> members = new LinkedHashSet<>(Arrays.asList(sg, my));
        Bloc anotherBloc = new Bloc();
        anotherBloc.setCode("RCEP");
        anotherBloc.setName("Regional Comprehensive Economic Partnership");
        anotherBloc.setMemberCountries(members);

        when(blocRepository.findByFilters(null, null, null)).thenReturn(new ArrayList<>(Arrays.asList(sampleBloc, anotherBloc)));

        List<Bloc> result = blocService.getBloc(null, null, null, new HashSet<>(Arrays.asList("702", "458")));

        assertEquals(2, result.size());
        verify(blocRepository).findByFilters(null, null, null);
    }

    @Test
    void should_AddBloc_WhenRequestValid() {
        BlocCreateRequest request = new BlocCreateRequest();
        request.setCode("NAFTA");
        request.setName("North American Free Trade Agreement");
        request.setMemberCodes(new LinkedHashSet<>(Arrays.asList("124", "484")));

        Country ca = new Country();
        ca.setCode("124");
        Country mx = new Country();
        mx.setCode("484");

        when(blocRepository.existsByCode("NAFTA")).thenReturn(false);
        when(blocRepository.existsByName("North American Free Trade Agreement")).thenReturn(false);
        when(countryRepository.findByCode("124")).thenReturn(Optional.of(ca));
        when(countryRepository.findByCode("484")).thenReturn(Optional.of(mx));
        when(blocRepository.save(any(Bloc.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bloc created = blocService.addBloc(request);

        assertEquals("NAFTA", created.getCode());
        verify(blocRepository).save(any(Bloc.class));
    }

    @Test
    void should_ThrowException_WhenBlocCodeExists() {
        BlocCreateRequest request = new BlocCreateRequest("ASEAN", "duplicate", new HashSet<>(Arrays.asList("702", "458")));
        when(blocRepository.existsByCode("ASEAN")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(blocRepository, never()).save(any());
    }

    @Test
    void should_ThrowException_WhenBlocHasLessThanTwoMembers() {
        BlocCreateRequest request = new BlocCreateRequest("CPTPP", "CPTPP", new HashSet<>(Collections.singletonList("702")));
        when(blocRepository.existsByCode("CPTPP")).thenReturn(false);
        when(blocRepository.existsByName("CPTPP")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("at least two"));
    }

    @Test
    void should_ThrowException_WhenMemberCountryMissing() {
        BlocCreateRequest request = new BlocCreateRequest("CPTPP", "CPTPP", new LinkedHashSet<>(Arrays.asList("000", "111")));
        when(blocRepository.existsByCode("CPTPP")).thenReturn(false);
        when(blocRepository.existsByName("CPTPP")).thenReturn(false);
        when(countryRepository.findByCode(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("No country found"));
    }

    @Test
    void should_UpdateBlocMembers_WhenAddAndRemoveValid() {
        BlocUpdateRequest request = new BlocUpdateRequest(
                new LinkedHashSet<>(Collections.singletonList("608")),
                new LinkedHashSet<>(Collections.singletonList("702"))
        );
        Country ph = new Country();
        ph.setCode("608");

        when(blocRepository.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countryRepository.findByCode("608")).thenReturn(Optional.of(ph));
        when(countryRepository.findByCode("702")).thenReturn(Optional.of(sg));
        when(blocRepository.save(sampleBloc)).thenReturn(sampleBloc);

        Bloc updated = blocService.updateBloc("ASEAN", request);

        assertTrue(updated.getMemberCountries().contains(ph));
        verify(blocRepository).save(sampleBloc);
    }

    @Test
    void should_ThrowException_WhenRemovingTooManyMembers() {
        BlocUpdateRequest request = new BlocUpdateRequest(null, new LinkedHashSet<>(Arrays.asList("702", "458")));
        when(blocRepository.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countryRepository.findByCode(anyString())).thenReturn(Optional.of(sg));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.updateBloc("ASEAN", request));
        assertTrue(ex.getMessage().contains("at least two"));
    }

    @Test
    void should_DeleteBloc_WhenNoFtasAssociated() {
        when(blocRepository.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));

        blocService.deleteBloc("ASEAN");

        verify(blocRepository).deleteByCode("ASEAN");
    }

    @Test
    void should_ThrowException_WhenDeletingBlocWithFtas() {
        sampleBloc.getTradeParty().getFtasAsPartyA().add(new com.example.CSD.fta.FTA());
        when(blocRepository.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.deleteBloc("ASEAN"));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(blocRepository, never()).deleteByCode(anyString());
    }
}

