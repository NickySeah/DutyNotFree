package com.example.CSD.service;

import com.example.CSD.concession.ConcessionRepository;
import com.example.CSD.concession.ConcessionService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class ConcessionServiceTest {

    @Test
    void should_ConstructService_WhenRepositoryProvided() {
        ConcessionRepository repository = Mockito.mock(ConcessionRepository.class);

        ConcessionService service = new ConcessionService(repository);

        assertNotNull(service);
    }
}

