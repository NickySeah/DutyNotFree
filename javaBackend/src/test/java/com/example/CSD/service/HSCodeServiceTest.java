package com.example.CSD.service;

import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.hscode.HSCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HSCodeServiceTest {

    @Mock
    private HSCodeRepository hsCodeRepository;

    @InjectMocks
    private HSCodeService hsCodeService;

    private HSCode sample;

    @BeforeEach
    void setUp() {
        sample = new HSCode();
        sample.setCode("847130");
        sample.setDescription("Portable computers");
    }

    @Test
    void should_ListAll_WhenNoFiltersProvided() {
        when(hsCodeRepository.findAll()).thenReturn(Collections.singletonList(sample));

        List<HSCode> result = hsCodeService.getHSCode(null, null);

        assertEquals(1, result.size());
        verify(hsCodeRepository).findAll();
    }

    @Test
    void should_FilterWhenParametersProvided() {
        when(hsCodeRepository.findByFilters("847130", null)).thenReturn(new ArrayList<>(Collections.singletonList(sample)));

        List<HSCode> result = hsCodeService.getHSCode("847130", null);

        assertEquals("847130", result.get(0).getCode());
        verify(hsCodeRepository).findByFilters("847130", null);
    }

    @Test
    void should_AddHSCode_WhenValid() {
        when(hsCodeRepository.existsByCode("847130")).thenReturn(false);
        when(hsCodeRepository.save(sample)).thenReturn(sample);

        HSCode created = hsCodeService.addHSCode(sample);

        assertEquals(sample, created);
        verify(hsCodeRepository).save(sample);
    }

    @Test
    void should_ThrowException_WhenCodeExists() {
        when(hsCodeRepository.existsByCode("847130")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(sample));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void should_ThrowException_WhenCodeTooShort() {
        HSCode invalid = new HSCode();
        invalid.setCode("123");
        invalid.setDescription("desc");

        when(hsCodeRepository.existsByCode("123")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.addHSCode(invalid));
        assertTrue(ex.getMessage().contains("less than 6"));
    }

    @Test
    void should_UpdateDescription_WhenValid() {
        HSCode request = new HSCode();
        request.setDescription("Updated description");

        when(hsCodeRepository.findByCode("847130")).thenReturn(Optional.of(sample));
        when(hsCodeRepository.save(sample)).thenReturn(sample);

        HSCode updated = hsCodeService.updateHSCode("847130", request);

        assertEquals("Updated description", updated.getDescription());
        verify(hsCodeRepository).save(sample);
    }

    @Test
    void should_ThrowException_WhenDeletingMissingHSCode() {
        when(hsCodeRepository.existsByCode("000000")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> hsCodeService.deleteHSCode("000000"));
        assertTrue(ex.getMessage().contains("No HSCode"));
    }

    @Test
    void should_DeleteHSCode_WhenExists() {
        when(hsCodeRepository.existsByCode("847130")).thenReturn(true);

        hsCodeService.deleteHSCode("847130");

        verify(hsCodeRepository).deleteByCode("847130");
    }
}

