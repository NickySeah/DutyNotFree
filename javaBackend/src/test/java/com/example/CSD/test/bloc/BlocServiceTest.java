package com.example.CSD.test.bloc;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.example.CSD.bloc.*;
import com.example.CSD.country.*;
import com.example.CSD.fta.FTA;
import com.example.CSD.tradeParty.TradeParty;

@ExtendWith(MockitoExtension.class)
class BlocServiceTest {
    @Mock
    private BlocRepository blocs;

    @Mock
    private CountryRepository countries;

    @InjectMocks
    private BlocServiceImpl blocService;

    private Bloc sampleBloc;
    private Country sg;
    private Country my;
    private Country id;

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

        id = new Country();
        id.setCode("360");
        id.setName("Indonesia");
        id.setAlpha3("IDN");

        sampleBloc = new Bloc();
        sampleBloc.setCode("ASEAN");
        sampleBloc.setName("Association of Southeast Asian Nations");
        sampleBloc.setMemberCountries(new LinkedHashSet<>(Arrays.asList(sg, my, id)));

        TradeParty tradeParty = new TradeParty();
        tradeParty.setId(1L);
        tradeParty.setType(TradeParty.PartyType.BLOC);
        tradeParty.setBloc(sampleBloc);
        tradeParty.setFtasAsPartyA(new HashSet<>());
        tradeParty.setFtasAsPartyB(new HashSet<>());
        sampleBloc.setTradeParty(tradeParty);
    }

    // listBloc() tests
    @Test
    void listBlocs_ShouldReturnAllBlocs() {
        when(blocs.findAll()).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.listBlocs();

        assertEquals(1, result.size());
        assertEquals("ASEAN", result.get(0).getCode());
        verify(blocs).findAll();
    }

    // getBloc() tests
    @Test
    void getBloc_ShouldReturnAllBlocs_WhenNoFiltersProvided() {
        when(blocs.findAll()).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.getBloc(null, null, null, null);

        assertEquals(1, result.size());
        verify(blocs).findAll();
    }

    @Test
    void getBloc_ShouldReturnAllBlocs_WhenOnlyKeywordProvided() {
        when(blocs.findByFilters(anyString(), eq(null), eq(null))).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.getBloc("mock", null, null, null);

        assertEquals(1, result.size());
        verify(blocs).findByFilters(anyString(), eq(null), eq(null));
    }

    @Test
    void getBloc_ShouldReturnAllBlocs_WhenOnlyNameProvided() {
        when(blocs.findByFilters(eq(null), anyString(), eq(null))).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.getBloc(null, "mock", null, null);

        assertEquals(1, result.size());
        verify(blocs).findByFilters(eq(null), anyString(), eq(null));
    }

    @Test
    void getBloc_ShouldReturnAllBlocs_WhenOnlyCodeProvided() {
        when(blocs.findByFilters(eq(null), eq(null), anyString())).thenReturn(Collections.singletonList(sampleBloc));

        List<Bloc> result = blocService.getBloc(null, null, "mock", null);

        assertEquals(1, result.size());
        verify(blocs).findByFilters(eq(null), eq(null), anyString());
    }

    @Test
    void getBloc_ShouldReturnAllBlocs_WhenAllMemberCountriesProvided() {
        when(blocs.findByFilters(null, null, null)).thenReturn(new ArrayList<>(Arrays.asList(sampleBloc)));

        List<Bloc> result = blocService.getBloc(null, null, null, new HashSet<>(Arrays.asList("702", "458")));

        assertEquals(1, result.size());
        verify(blocs).findByFilters(null, null, null);
    }

    @Test
    void getBloc_ShouldRemoveBlocsAndReturnNoBlocs_WhenNonMemberCountriesProvided() {
        when(blocs.findByFilters(null, null, null)).thenReturn(new ArrayList<>(Arrays.asList(sampleBloc)));

        List<Bloc> result = blocService.getBloc(null, null, null, new HashSet<>(Arrays.asList("840")));

        assertEquals(0, result.size());
        verify(blocs).findByFilters(null, null, null);
    }

    // addBloc() tests
    @Test
    void addBloc_ShouldCreateNewBloc_WhenRequestIsValid() {
        BlocCreateRequest request = new BlocCreateRequest("NAFTA", "North American Free Trade Agreement", new LinkedHashSet<>(Arrays.asList("124", "484")));

        Country ca = new Country();
        ca.setCode("124");
        Country mx = new Country();
        mx.setCode("484");

        when(blocs.existsByCode("NAFTA")).thenReturn(false);
        when(blocs.existsByName("North American Free Trade Agreement")).thenReturn(false);
        when(countries.findByCode("124")).thenReturn(Optional.of(ca));
        when(countries.findByCode("484")).thenReturn(Optional.of(mx));
        when(blocs.save(any(Bloc.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bloc created = blocService.addBloc(request);

        assertEquals("NAFTA", created.getCode());
        verify(blocs).save(any(Bloc.class));
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocAlreadyExists() {
        BlocCreateRequest request = new BlocCreateRequest("ASEAN", "duplicate", new HashSet<>(Arrays.asList("702", "458")));
        
        when(blocs.existsByCode("ASEAN")).thenReturn(true);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        
        assertTrue(ex.getMessage().contains("Bloc (ASEAN) already exists"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocCodeNotProvided() {
        BlocCreateRequest request = new BlocCreateRequest(null, "Mock", new HashSet<>(Collections.singletonList("702")));  
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Code or acronym of bloc cannot be empty"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocCodeGivenAsBlank() {
        BlocCreateRequest request = new BlocCreateRequest("", "Mock", new HashSet<>(Collections.singletonList("702")));  
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Code or acronym of bloc cannot be empty"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocNameNotProvided() {
        BlocCreateRequest request = new BlocCreateRequest("Mock", null, new HashSet<>(Collections.singletonList("702")));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Bloc name cannot be empty"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocNameGivenAsBlank() {
        BlocCreateRequest request = new BlocCreateRequest("Mock", "", new HashSet<>(Collections.singletonList("702")));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Bloc name cannot be empty"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocNameAlreadyExists() {
        BlocCreateRequest request = new BlocCreateRequest("Mock", "Mock", new HashSet<>(Collections.singletonList("702")));
        when(blocs.existsByCode("Mock")).thenReturn(false);
        when(blocs.existsByName("Mock")).thenReturn(true);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Bloc with name Mock already exists"));
        verify(blocs, never()).save(any());
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocHasLessThanTwoMembers() {
        BlocCreateRequest request = new BlocCreateRequest("Mock", "Mock", new HashSet<>(Collections.singletonList("702")));
        when(blocs.existsByCode("Mock")).thenReturn(false);
        when(blocs.existsByName("Mock")).thenReturn(false);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Bloc must have at least two member countries"));
    }

    @Test
    void addBloc_ShouldThrowException_WhenBlocHasNoMembers() {
        BlocCreateRequest request = new BlocCreateRequest("Mock", "Mock", null);
        when(blocs.existsByCode("Mock")).thenReturn(false);
        when(blocs.existsByName("Mock")).thenReturn(false);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("Bloc must have at least two member countries"));
    }

    @Test
    void addBloc_ShouldThrowException_WhenMemberCountryInvalid() {
        BlocCreateRequest request = new BlocCreateRequest("CPTPP", "CPTPP", new LinkedHashSet<>(Arrays.asList("000", "111")));
        when(blocs.existsByCode("CPTPP")).thenReturn(false);
        when(blocs.existsByName("CPTPP")).thenReturn(false);
        when(countries.findByCode(anyString())).thenReturn(Optional.empty());
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.addBloc(request));
        assertTrue(ex.getMessage().contains("No country found"));
    }
    
    // updateBloc() tests
    @Test
    void updateBloc_ShouldUpdateBlocMembers_WhenAddAndRemoveValid() {
        BlocUpdateRequest request = new BlocUpdateRequest(
                new LinkedHashSet<>(Collections.singletonList("608")),
                new LinkedHashSet<>(Collections.singletonList("702"))
        );
        Country ph = new Country();
        ph.setCode("608");

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode("608")).thenReturn(Optional.of(ph));
        when(countries.findByCode("702")).thenReturn(Optional.of(sg));
        when(blocs.save(sampleBloc)).thenReturn(sampleBloc);

        Bloc updated = blocService.updateBloc("ASEAN", request);

        assertTrue(updated.getMemberCountries().contains(ph));
        verify(blocs).save(sampleBloc);
    }

    @Test
    void updateBloc_ShouldUpdateBlocMembers_WhenOnlyAddProvided() {
        BlocUpdateRequest request = new BlocUpdateRequest(new LinkedHashSet<>(Collections.singletonList("608")),null);
        Country ph = new Country();
        ph.setCode("608");

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode("608")).thenReturn(Optional.of(ph));
        when(blocs.save(sampleBloc)).thenReturn(sampleBloc);

        Bloc updated = blocService.updateBloc("ASEAN", request);

        assertTrue(updated.getMemberCountries().contains(ph));
        verify(blocs).save(sampleBloc);
    }

    @Test
    void updateBloc_ShouldUpdateBlocMembers_WhenOnlyRemoveProvided() {
        BlocUpdateRequest request = new BlocUpdateRequest(null, new LinkedHashSet<>(Collections.singletonList("702")));

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode(anyString())).thenReturn(Optional.of(sg));
        when(blocs.save(sampleBloc)).thenReturn(sampleBloc);

        Bloc updated = blocService.updateBloc("ASEAN", request);

        assertTrue(!updated.getMemberCountries().contains(sg));
        verify(blocs).save(sampleBloc);
    }

    @Test
    void updateBloc_ShouldException_WhenRemovingTooManyMembers() {
        BlocUpdateRequest request = new BlocUpdateRequest(null, new LinkedHashSet<>(Arrays.asList("702", "458")));

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode("702")).thenReturn(Optional.of(sg));
        when(countries.findByCode("458")).thenReturn(Optional.of(my));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.updateBloc("ASEAN", request));
        assertTrue(ex.getMessage().contains("at least two"));
    }

    @Test
    void updateBloc_ShouldException_WhenAddCountryInvalid() {
        BlocUpdateRequest request = new BlocUpdateRequest(new LinkedHashSet<>(Collections.singletonList(anyString())), null);

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.updateBloc("ASEAN", request));
        assertTrue(ex.getMessage().contains("No country found"));
        verify(blocs, never()).save(sampleBloc);
    }

    @Test
    void updateBloc_ShouldException_WhenRemoveCountryInvalid() {
        BlocUpdateRequest request = new BlocUpdateRequest(null, new LinkedHashSet<>(Collections.singletonList(anyString())));

        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));
        when(countries.findByCode(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.updateBloc("ASEAN", request));
        assertTrue(ex.getMessage().contains("No country found"));
        verify(blocs, never()).save(sampleBloc);
    }

    // deleteBloc() tests
    @Test
    void deleteBloc_ShouldDeleteBloc_WhenNoFtasAssociated() {
        when(blocs.findByCode("ASEAN")).thenReturn(Optional.of(sampleBloc));

        blocService.deleteBloc("ASEAN");

        verify(blocs).deleteByCode("ASEAN");
    }

    @Test
    void deleteBloc_ShouldThrowException_WhenDeletingBlocWithFTAsAsPartyA() {
        sampleBloc.getTradeParty().getFtasAsPartyA().add(new FTA());
        when(blocs.findByCode(anyString())).thenReturn(Optional.of(sampleBloc));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.deleteBloc("ASEAN"));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(blocs, never()).deleteByCode(anyString());
    }

    @Test
    void deleteBloc_ShouldThrowException_WhenDeletingBlocWithFTAsAsPartyB() {
        sampleBloc.getTradeParty().getFtasAsPartyB().add(new FTA());
        when(blocs.findByCode(anyString())).thenReturn(Optional.of(sampleBloc));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.deleteBloc("ASEAN"));
        assertTrue(ex.getMessage().contains("Cannot delete"));
        verify(blocs, never()).deleteByCode(anyString());
    }

    @Test
    void deleteBloc_ShouldThrowException_WhenBlocCodeInvalid() {
        when(blocs.findByCode(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> blocService.deleteBloc(anyString()));
        
        assertTrue(ex.getMessage().contains("No bloc found with code"));
        verify(blocs, never()).deleteByCode(anyString());
    }
}

