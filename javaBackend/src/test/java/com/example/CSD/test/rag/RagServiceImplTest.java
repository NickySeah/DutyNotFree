package com.example.CSD.test.rag;

import java.util.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.CSD.rag.RagServiceImpl;
import com.example.CSD.rag.PineconeService;
import com.example.CSD.rag.CohereService;
import com.example.CSD.rag.PineconeResult;

@ExtendWith(MockitoExtension.class)
public class RagServiceImplTest {

    @Mock
    private PineconeService pineconeService;

    @Mock
    private CohereService cohereService;

    @InjectMocks
    private RagServiceImpl ragService;

    // ======= validateAndSetTopK / happy path + markdown cleaning =======

    @Test
    public void getHsCodeRecommendation_ShouldUseDefaultTopK_WhenTopKIsNull() {
        // Arrange
        String query = "laptop computers";
        List<PineconeResult> pineconeResults = new ArrayList<>();

        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        // Cohere returns valid JSON (no markdown)
        String cohereJson = """
            {
              "hs_codes": [
                {"code": "847130", "score": 0.95}
              ],
              "explanation": "Laptops are typically classified under 847130."
            }
            """;
        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn(cohereJson);

        ArgumentCaptor<Integer> topKCaptor = ArgumentCaptor.forClass(Integer.class);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, null);

        // Assert
        assertNotNull(result);
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(5, result.get("topK")); // DEFAULT_TOP_K

        // Check parsed hs_codes
        Object hsCodesObj = result.get("hs_codes");
        assertTrue(hsCodesObj instanceof List);
        List<?> hsCodes = (List<?>) hsCodesObj;
        assertEquals(1, hsCodes.size());
        Map<?, ?> first = (Map<?, ?>) hsCodes.get(0);
        assertEquals("847130", first.get("code"));

        // Verify Pinecone called with default topK = 5
        verify(pineconeService).searchSimilarHsCodes(eq(query), topKCaptor.capture());
        assertEquals(5, topKCaptor.getValue());
    }

    @Test
    public void getHsCodeRecommendation_ShouldFallbackToDefaultTopK_WhenTopKOutOfRangeHigh() {
        // Arrange
        String query = "shoes";
        List<PineconeResult> pineconeResults = Collections.emptyList();

        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn("{\"hs_codes\":[],\"explanation\":\"none\"}");

        ArgumentCaptor<Integer> topKCaptor = ArgumentCaptor.forClass(Integer.class);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 999);

        // Assert
        assertNotNull(result);
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(5, result.get("topK")); // default again

        verify(pineconeService).searchSimilarHsCodes(eq(query), topKCaptor.capture());
        assertEquals(5, topKCaptor.getValue());
    }

    @Test
    public void getHsCodeRecommendation_ShouldFallbackToDefaultTopK_WhenTopKOutOfRangeLow() {
        // Arrange
        String query = "mobile phone";
        List<PineconeResult> pineconeResults = Collections.emptyList();

        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn("{\"hs_codes\":[],\"explanation\":\"none\"}");

        ArgumentCaptor<Integer> topKCaptor = ArgumentCaptor.forClass(Integer.class);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 0);

        // Assert
        assertNotNull(result);
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(5, result.get("topK"));

        verify(pineconeService).searchSimilarHsCodes(eq(query), topKCaptor.capture());
        assertEquals(5, topKCaptor.getValue());
    }

    // ======= cleanMarkdownCodeBlock + parseResponse success =======

    @Test
    public void getHsCodeRecommendation_ShouldParseJsonWrappedInJsonMarkdownFence() {
        // Arrange
        String query = "laptop";
        List<PineconeResult> pineconeResults = Collections.emptyList();
        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        String cohereMarkdownJson = """
            ```json
            {
              "hs_codes": [
                { "code": "847130", "score": 0.97 }
              ],
              "explanation": "Laptop computers under 847130."
            }
            ```
            """;

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn(cohereMarkdownJson);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 3);

        // Assert
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(3, result.get("topK")); // within range, so unchanged

        Object hsCodesObj = result.get("hs_codes");
        assertTrue(hsCodesObj instanceof List);
        List<?> hsCodes = (List<?>) hsCodesObj;
        assertEquals(1, hsCodes.size());
        Map<?, ?> first = (Map<?, ?>) hsCodes.get(0);
        assertEquals("847130", first.get("code"));
        assertEquals(0.97, ((Number) first.get("score")).doubleValue(), 0.0001);
    }

    @Test
    public void getHsCodeRecommendation_ShouldParseJsonWrappedInGenericMarkdownFence() {
        // Arrange
        String query = "headphones";
        List<PineconeResult> pineconeResults = Collections.emptyList();
        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        String cohereMarkdownJson = """
            ```
            {
              "hs_codes": [],
              "explanation": "No close matches."
            }
            ```
            """;

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn(cohereMarkdownJson);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 2);

        // Assert
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(2, result.get("topK"));

        Object hsCodesObj = result.get("hs_codes");
        assertTrue(hsCodesObj instanceof List);
        assertTrue(((List<?>) hsCodesObj).isEmpty());
    }

    // ======= parseResponse fallback (invalid / null JSON) =======

    @Test
    public void getHsCodeRecommendation_ShouldHandleNonJsonResponse_WithFallbackFields() {
        // Arrange
        String query = "chairs";
        List<PineconeResult> pineconeResults = Collections.emptyList();
        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn("Not JSON at all");

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, null);

        // Assert
        assertEquals("success", result.get("status")); // overwritten by service
        assertEquals(query, result.get("query"));
        assertEquals(5, result.get("topK")); // default

        assertEquals("Not JSON at all", result.get("raw_response"));
        assertTrue(result.containsKey("parsing_error"));
        assertTrue(result.get("hs_codes") instanceof List);
        assertTrue(((List<?>) result.get("hs_codes")).isEmpty());
    }

    @Test
    public void getHsCodeRecommendation_ShouldHandleNullCohereResponse() {
        // Arrange
        String query = "tables";
        List<PineconeResult> pineconeResults = Collections.emptyList();
        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenReturn(pineconeResults);

        when(cohereService.generateHsCodeRecommendation(eq(pineconeResults), eq(query)))
                .thenReturn(null);

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 4);

        // Assert
        assertEquals("success", result.get("status"));
        assertEquals(query, result.get("query"));
        assertEquals(4, result.get("topK"));

        assertTrue(result.containsKey("parsing_error"));
        assertTrue(result.containsKey("raw_response"));
        assertNull(result.get("raw_response")); // original response was null
        assertTrue(result.get("hs_codes") instanceof List);
    }

    // ======= top-level error handling (catch block in getHsCodeRecommendation) =======

    @Test
    public void getHsCodeRecommendation_ShouldReturnErrorStatus_WhenPineconeThrows() {
        // Arrange
        String query = "sofa";
        when(pineconeService.searchSimilarHsCodes(anyString(), anyInt()))
                .thenThrow(new RuntimeException("Pinecone down"));

        // Act
        Map<String, Object> result = ragService.getHsCodeRecommendation(query, 10);

        // Assert
        assertEquals("error", result.get("status"));
        assertTrue(((String) result.get("error")).contains("Service error occurred"));
        assertEquals(query, result.get("query"));
        // For errors, it returns original topK (not validated)
        assertEquals(10, result.get("topK"));
    }
}