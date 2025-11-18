package com.example.CSD.test.rag;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.CSD.rag.RagController;
import com.example.CSD.rag.RagService;

@ExtendWith(MockitoExtension.class)
public class RagControllerTest {

    @Mock
    private RagService ragService;

    @InjectMocks
    private RagController ragController;

    // ======= classifyProduct: validation on query =======

    @Test
    public void classifyProduct_ShouldReturnBadRequest_WhenQueryMissing() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("error", body.get("status"));
        assertTrue(((String) body.get("error")).contains("Query parameter is required"));
        verifyNoInteractions(ragService);
    }

    @Test
    public void classifyProduct_ShouldReturnBadRequest_WhenQueryEmpty() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "   ");

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("error", body.get("status"));
        verifyNoInteractions(ragService);
    }

    // ======= classifyProduct: topK handling and success path =======

    @Test
    public void classifyProduct_ShouldUseNullTopK_WhenTopKMissing() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");

        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("status", "success");
        serviceResult.put("query", "laptop");

        when(ragService.getHsCodeRecommendation("laptop", null))
                .thenReturn(serviceResult);

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResult, response.getBody());
        verify(ragService).getHsCodeRecommendation("laptop", null);
    }

    @Test
    public void classifyProduct_ShouldParseNumericTopK_WhenTopKIsNumber() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");
        payload.put("topK", 3); // Integer

        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("status", "success");
        serviceResult.put("query", "laptop");

        when(ragService.getHsCodeRecommendation("laptop", 3))
                .thenReturn(serviceResult);

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResult, response.getBody());
        verify(ragService).getHsCodeRecommendation("laptop", 3);
    }

    @Test
    public void classifyProduct_ShouldParseNumericTopK_WhenTopKIsString() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");
        payload.put("topK", "4"); // String numeric

        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("status", "success");
        serviceResult.put("query", "laptop");

        when(ragService.getHsCodeRecommendation("laptop", 4))
                .thenReturn(serviceResult);

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResult, response.getBody());
        verify(ragService).getHsCodeRecommendation("laptop", 4);
    }

    @Test
    public void classifyProduct_ShouldIgnoreInvalidTopKString_AndPassNull() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");
        payload.put("topK", "not-a-number");

        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("status", "success");
        serviceResult.put("query", "laptop");

        when(ragService.getHsCodeRecommendation("laptop", null))
                .thenReturn(serviceResult);

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResult, response.getBody());
        verify(ragService).getHsCodeRecommendation("laptop", null);
    }

    // ======= classifyProduct: service error / controller error =======

    @Test
    public void classifyProduct_ShouldReturnInternalServerError_WhenServiceReturnsErrorStatus() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");

        Map<String, Object> serviceResult = new HashMap<>();
        serviceResult.put("status", "error");
        serviceResult.put("error", "Service error");

        when(ragService.getHsCodeRecommendation("laptop", null))
                .thenReturn(serviceResult);

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertSame(serviceResult, response.getBody());
    }

    @Test
    public void classifyProduct_ShouldReturnInternalServerError_WhenExceptionThrown() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", "laptop");

        when(ragService.getHsCodeRecommendation(anyString(), any()))
                .thenThrow(new RuntimeException("boom"));

        // Act
        ResponseEntity<Map<String, Object>> response = ragController.classifyProduct(payload);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("error", body.get("status"));
        assertTrue(((String) body.get("error")).startsWith("Controller error occurred:"));
    }

    // ======= healthCheck =======

    @Test
    public void healthCheck_ShouldReturnHealthyStatus() {
        // Act
        ResponseEntity<Map<String, String>> response = ragController.healthCheck();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, String> body = response.getBody();
        assertNotNull(body);
        assertEquals("healthy", body.get("status"));
        assertEquals("HS Code RAG Service", body.get("service"));
    }
}
