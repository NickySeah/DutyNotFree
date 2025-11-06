package com.example.CSD.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cohere.api.Cohere;
import com.cohere.api.resources.v2.requests.V2ChatRequest;
import com.cohere.api.resources.v2.types.V2ChatResponse;
import com.cohere.api.types.*;
import java.util.*;

@Service
public class CohereService {
    
    @Value("${cohere.api.key}")
    private String cohereApiKey;
    
    @Value("${cohere.model:command-a-03-2025}")
    private String cohereModel;
    
    private Cohere cohereClient;
    
    public String generateHsCodeRecommendation(List<PineconeResult> pineconeResults, String userQuery) {
        try {
            String context = buildContext(pineconeResults);
            String prompt = buildPrompt(userQuery, context);
            Cohere cohere = getCohereClient();
            
            V2ChatResponse response = cohere.v2()
                .chat(
                    V2ChatRequest.builder()
                        .model(cohereModel)
                        .messages(
                            List.of(
                                ChatMessageV2.user(
                                    UserMessageV2.builder()
                                        .content(UserMessageV2Content.of(prompt))
                                        .build()
                                )
                            )
                        )
                        .maxTokens(500)
                        .build()
                );
            
            // Extract the response content
            if (response.getMessage() != null && response.getMessage().getContent() != null) {
                Optional<List<AssistantMessageResponseContentItem>> contentList = response.getMessage().getContent();
                if (contentList.isPresent() && !contentList.get().isEmpty()) {
                    AssistantMessageResponseContentItem firstContent = contentList.get().get(0);
                    Optional<ChatTextContent> textContent = firstContent.getText();
                    if (textContent.isPresent()) {
                        return textContent.get().getText();
                    }
                }
            }
            
            return "No response received from Cohere";
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling Cohere API: " + e.getMessage(), e);
        }
    }
    
    private Cohere getCohereClient() {
        if (cohereClient == null) {
            cohereClient = Cohere.builder()
                .token(cohereApiKey)
                .clientName("hs-code-rag-service")
                .build();
        }
        return cohereClient;
    }
    
    private String buildPrompt(String userQuery, String context) {
        return String.format(
            "<|system|>\n" +
            "You are an expert customs tariff classification assistant.\n" +
            "Based on the given context and question, identify and list the top 3 most likely HS codes.\n\n" +
            "You must respond ONLY with valid JSON in the following format (no additional text):\n" +
            "{\n" +
            "  \"query\": \"the product name\",\n" +
            "  \"hs_codes\": [\n" +
            "    {\n" +
            "      \"type_of_product\": \"category\",\n" +
            "      \"hs_code\": \"code\",\n" +
            "      \"hs_description\": \"description\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"type_of_product\": \"category\",\n" +
            "      \"hs_code\": \"code\",\n" +
            "      \"hs_description\": \"description\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"type_of_product\": \"category\",\n" +
            "      \"hs_code\": \"code\",\n" +
            "      \"hs_description\": \"description\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n\n" +
            "Return ONLY the JSON object, nothing else.<|end|>\n" +
            "<|user|>\n" +
            "Context:\n%s\n\n" +
            "Question:\n%s<|end|>\n" +
            "<|assistant|>",
            context, userQuery
        );
    }

    private String buildContext(List<PineconeResult> pineconeResults) {
        StringBuilder context = new StringBuilder();
        for (int i = 0; i < pineconeResults.size(); i++) {
            PineconeResult result = pineconeResults.get(i);
            Object hsCode = result.getMetadata().get("hs_code");
            Object category = result.getMetadata().get("category");
            
            context.append(String.format("Result %d (Similarity Score: %.4f):\n", i + 1, result.getScore()));
            context.append("HS Code: ").append(hsCode != null ? hsCode : "N/A").append("\n");
            context.append("Category: ").append(category != null ? category : "N/A").append("\n");
            context.append("Description: ").append(result.getText()).append("\n\n");
        }
        return context.toString();
    }
}