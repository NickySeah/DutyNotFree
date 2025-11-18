package com.example.CSD.test.concession;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.CSD.concession.ConcessionRepository;
import com.example.CSD.concession.ConcessionService;
import com.example.CSD.concession.ConcessionServiceImpl;

@ExtendWith(MockitoExtension.class)
class ConcessionServiceTest {
    @Test
    void should_ConstructService_WhenRepositoryProvided() {
        ConcessionRepository repository = Mockito.mock(ConcessionRepository.class);

        ConcessionService service = new ConcessionServiceImpl(repository);

        assertNotNull(service);
    }
}