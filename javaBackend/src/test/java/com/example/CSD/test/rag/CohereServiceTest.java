package com.example.CSD.test.rag;

import com.example.CSD.rag.CohereService;
import com.example.CSD.rag.PineconeResult;
import com.cohere.api.Cohere;
import com.cohere.api.resources.v2.requests.V2ChatRequest;
import com.cohere.api.resources.v2.types.V2ChatResponse;
import com.cohere.api.types.AssistantMessageResponseContentItem;
import com.cohere.api.types.ChatTextContent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CohereServiceTest {

    @InjectMocks
    private CohereService cohereService;

    // Deep stubs so we can do cohereClient.v2().chat(...)
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private Cohere mockCohereClient;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private V2ChatResponse mockChatResponse;

    @BeforeEach
    void init() throws Exception {
        // Inject mock cohereClient into private field
        setPrivateField(cohereService, "cohereClient", mockCohereClient);
        // Set a dummy model name so builder has something
        setPrivateField(cohereService, "cohereModel", "dummy-model");
        setPrivateField(cohereService, "cohereApiKey", "dummy-key");
    }

    private void setPrivateField(Object target, String field, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(field);
        f.setAccessible(true);
        f.set(target, value);
    }

    private List<PineconeResult> buildSampleResults() {
        Map<String, Object> metadata1 = new HashMap<>();
        metadata1.put("hs_code", "847130");
        metadata1.put("category", "Laptops");
        PineconeResult r1 = new PineconeResult("vec1", 0.95f, metadata1,
                "Portable automatic data-processing machines, laptops.");

        Map<String, Object> metadata2 = new HashMap<>();
        metadata2.put("hs_code", "851712");
        metadata2.put("category", "Mobile phones");
        PineconeResult r2 = new PineconeResult("vec2", 0.88f, metadata2,
                "Telephones for cellular networks or for other wireless networks.");

        return Arrays.asList(r1, r2);
    }

    @Test
    public void generateHsCodeRecommendation_ShouldReturnText_WhenResponseContainsText() {
        // Arrange
        List<PineconeResult> pineconeResults = buildSampleResults();
        String userQuery = "laptop computers";

        // Prepare mock Cohere response
        when(mockCohereClient.v2().chat(any(V2ChatRequest.class)))
                .thenReturn(mockChatResponse);

        // Build nested structure for message content
        AssistantMessageResponseContentItem contentItem =
                mock(AssistantMessageResponseContentItem.class, Answers.RETURNS_DEEP_STUBS);

        ChatTextContent textContent = mock(ChatTextContent.class);
        when(textContent.getText()).thenReturn("{\"query\":\"laptop computers\"}");

        when(contentItem.getText()).thenReturn(Optional.of(textContent));
        List<AssistantMessageResponseContentItem> contentList = Collections.singletonList(contentItem);
        when(mockChatResponse.getMessage().getContent()).thenReturn(Optional.of(contentList));

        // Act
        String result = cohereService.generateHsCodeRecommendation(pineconeResults, userQuery);

        // Assert
        assertNotNull(result);
        assertEquals("{\"query\":\"laptop computers\"}", result);
        verify(mockCohereClient.v2()).chat(any(V2ChatRequest.class));
    }

    @Test
    public void generateHsCodeRecommendation_ShouldReturnFallbackMessage_WhenNoContent() {
        // Arrange
        List<PineconeResult> pineconeResults = buildSampleResults();
        String userQuery = "phone";

        when(mockCohereClient.v2().chat(any(V2ChatRequest.class)))
                .thenReturn(mockChatResponse);

        // Simulate message with no content (Optional.empty())
        when(mockChatResponse.getMessage().getContent()).thenReturn(Optional.empty());

        // Act
        String result = cohereService.generateHsCodeRecommendation(pineconeResults, userQuery);

        // Assert
        assertEquals("No response received from Cohere", result);
        verify(mockCohereClient.v2()).chat(any(V2ChatRequest.class));
    }

    @Test
    public void generateHsCodeRecommendation_ShouldThrowRuntimeException_WhenCohereThrows() {
        // Arrange
        List<PineconeResult> pineconeResults = buildSampleResults();
        String userQuery = "something";

        when(mockCohereClient.v2().chat(any(V2ChatRequest.class)))
                .thenThrow(new RuntimeException("Cohere API failure"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cohereService.generateHsCodeRecommendation(pineconeResults, userQuery));

        assertTrue(ex.getMessage().contains("Error calling Cohere API"));
        verify(mockCohereClient.v2()).chat(any(V2ChatRequest.class));
    }
}