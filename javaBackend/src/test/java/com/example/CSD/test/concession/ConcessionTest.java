package com.example.CSD.test.concession;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.example.CSD.concession.Concession;
import com.example.CSD.fta.FTA;
import com.example.CSD.hscode.HSCode;

class ConcessionTest {

    @Test
    void should_AssociateWithFtaAndHsCode() {
        FTA fta = new FTA();
        fta.setId(1L);

        HSCode hsCode = new HSCode();
        hsCode.setCode("020110");
        hsCode.setDescription("Bovine animals, live");

        Concession concession = new Concession();
        concession.setId(5L);
        concession.setFta(fta);
        concession.setHsCode(hsCode);
        concession.setFinalRate(1.5);

        assertEquals(fta, concession.getFta());
        assertEquals(hsCode, concession.getHsCode());
        assertEquals(1.5, concession.getFinalRate());
        assertTrue(concession.toString().contains("1.5"));
    }
}