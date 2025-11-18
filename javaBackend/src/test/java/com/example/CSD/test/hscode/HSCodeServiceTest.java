package com.example.CSD.test.hscode;

import java.lang.reflect.Array;
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

import com.example.CSD.hscode.*;

@ExtendWith(MockitoExtension.class)
class HSCodeServiceTest {
    @Mock
    private HSCodeRepository hsCodes;

    @InjectMocks
    private HSCodeServiceImpl hsCodeService;

    private HSCode sample1;
    private HSCode sample2;

    @BeforeEach
    void setUp() {
        sample1 = new HSCode();
        sample1.setCode("847130");
        sample1.setDescription("Portable computers");

        sample2 = new HSCode();
        sample2.setCode("531197");
        sample2.setDescription("Portable toilets");
    }

    @Test
    void listHSCode_ShouldListAll_WhenNoFiltersProvided() {
        when(hsCodes.findAll()).thenReturn(new ArrayList<>(Arrays.asList(sample1, sample2)));

        List<HSCode> result = hsCodeService.listHSCode();

        assertEquals(2, result.size());
        verify(hsCodes).findAll();
    }

    @Test
    void getHSCode_getHSCode_ShouldListAll_WhenNoFiltersProvided() {
        when(hsCodes.findAll()).thenReturn(Arrays.asList(sample1, sample2));

        List<HSCode> result = hsCodeService.getHSCode(null, null);

        assertEquals(2, result.size());
        verify(hsCodes).findAll();
    }

    @Test
    void getHSCode_ShouldFilter_WhenHsCodeProvided() {
        when(hsCodes.findByFilters("847130", null)).thenReturn(new ArrayList<>(Collections.singletonList(sample1)));

        List<HSCode> result = hsCodeService.getHSCode("847130", null);

        assertEquals(1, result.size());
        assertEquals("847130", result.get(0).getCode());
        verify(hsCodes).findByFilters("847130", null);
    }

    @Test
    void getHSCode_ShouldFilter_WhenKeywordProvided() {
        when(hsCodes.findByFilters(null, "computers")).thenReturn(new ArrayList<>(Collections.singletonList(sample1)));

        List<HSCode> result = hsCodeService.getHSCode(null, "computers");

        assertEquals(1, result.size());
        assertEquals("847130", result.get(0).getCode());
        verify(hsCodes).findByFilters(null, "computers");
    }

    // add method tests
    @Test
    void addHSCode_ShouldAddHSCode_WhenValid() {
        when(hsCodes.existsByCode("847130")).thenReturn(false);
        when(hsCodes.save(sample1)).thenReturn(sample1);

        HSCode created = hsCodeService.addHSCode(sample1);

        assertEquals(sample1, created);
        verify(hsCodes).save(sample1);
    }

    @Test
    void addHSCode_ShouldThrowException_WhenCodeExists() {
        when(hsCodes.existsByCode("847130")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(sample1));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    @Test
    void addHSCode_ShouldThrowException_WhenCodeTooShort() {
        HSCode invalid = new HSCode();
        invalid.setCode("123");

        when(hsCodes.existsByCode("123")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(invalid));
        assertTrue(ex.getMessage().contains("HS Code cannot be empty or less than 6 digits"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    @Test
    void addHSCode_ShouldThrowException_WhenCodeNotProvided() {
        HSCode invalid = new HSCode();
        invalid.setCode(null);

        when(hsCodes.existsByCode(null)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(invalid));
        assertTrue(ex.getMessage().contains("HS Code cannot be empty or less than 6 digits"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    @Test
    void addHSCode_ShouldThrowException_WhenDescriptionBlank() {
        HSCode invalid = new HSCode();
        invalid.setCode("111111");
        invalid.setDescription("   ");

        when(hsCodes.existsByCode(anyString())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(invalid));
        assertTrue(ex.getMessage().contains("HS code description cannot be empty"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    @Test
    void addHSCode_ShouldThrowException_WhenDescriptionNotProvided() {
        HSCode invalid = new HSCode();
        invalid.setCode("111111");
        invalid.setDescription(null);

        when(hsCodes.existsByCode(anyString())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(invalid));
        assertTrue(ex.getMessage().contains("HS code description cannot be empty"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    // update method tests
    @Test
    void updateHSCode_ShouldUpdateDescription_WhenValid() {
        HSCode request = new HSCode();
        request.setDescription("Updated description");

        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(sample1));
        when(hsCodes.save(sample1)).thenReturn(sample1);

        HSCode updated = hsCodeService.updateHSCode("847130", request);

        assertEquals("Updated description", updated.getDescription());
        verify(hsCodes).save(sample1);
    }

    @Test
    void updateHSCode_ShouldNothingHappens_WhenUpdatedDescriptionNotProvided() {
        HSCode request = new HSCode();
        request.setDescription(null);

        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(sample1));
        when(hsCodes.save(sample1)).thenReturn(sample1);

        HSCode updated = hsCodeService.updateHSCode("847130", request);

        assertEquals("Portable computers", updated.getDescription());
        verify(hsCodes).save(sample1);
    }

    @Test
    void updateHSCode_ShouldThrowException_WhenUpdatedDescriptionBlank() {
        HSCode request = new HSCode();
        request.setDescription("                                                                       ");

        when(hsCodes.findByCode("847130")).thenReturn(Optional.of(sample1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.updateHSCode("847130", request));
        assertTrue(ex.getMessage().contains("HS code description cannot be empty"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }

    @Test
    void deleteHSCode_ShouldDeleteHSCode_WhenExists() {
        when(hsCodes.existsByCode("847130")).thenReturn(true);

        hsCodeService.deleteHSCode("847130");

        verify(hsCodes).deleteByCode("847130");
    }

    @Test
    void updateHSCode_ShouldThrowException_WhenDeletingMissingHSCode() {
        when(hsCodes.existsByCode("000000")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.deleteHSCode("000000"));
        assertTrue(ex.getMessage().contains("No HSCode"));
        verify(hsCodes, never()).save(any(HSCode.class));
    }
}

