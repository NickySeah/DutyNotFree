package com.example.CSD.test.hscode;

import org.junit.jupiter.api.Test;

import com.example.CSD.hscode.HSCode;

import static org.junit.jupiter.api.Assertions.*;

class HSCodeTest {

    @Test
    void should_SetAndGetFields() {
        HSCode hsCode = new HSCode();
        hsCode.setCode("847130");
        hsCode.setDescription("Portable automatic data processing machines");

        assertEquals("847130", hsCode.getCode());
        assertTrue(hsCode.getDescription().contains("Portable"));
        assertNotNull(hsCode.toString());
    }
}

