package com.example.CSD.rag;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class RagServiceImpl implements RagService {
    
    private final PineconeService pineconeService;
    private final CohereService cohereService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Default configuration values
    private static final int DEFAULT_TOP_K = 5;
    private static final int MIN_TOP_K = 1;
    private static final int MAX_TOP_K = 5;
    
    public RagServiceImpl(PineconeService pineconeService, CohereService cohereService) {
        this.pineconeService = pineconeService;
        this.cohereService = cohereService;
    }
    
    @Override
    public Map<String, Object> getHsCodeRecommendation(String query, Integer topK) {
        try {
            // Validate and set topK
            int validatedTopK = validateAndSetTopK(topK);
            
            // Step 1: Query Pinecone for similar HS codes
            List<PineconeResult> pineconeResults = pineconeService.searchSimilarHsCodes(query, validatedTopK);
            
            // Step 2: Send results to Cohere for recommendation
            String cohereResponse = cohereService.generateHsCodeRecommendation(pineconeResults, query);
            
            // Step 3: Parse response and add metadata
            Map<String, Object> result = parseResponse(cohereResponse);
            result.put("status", "success");
            result.put("query", query);
            result.put("topK", validatedTopK);
            
            return result;
            
        } catch (Exception e) {
            // Return error response as Map
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("error", "Service error occurred: " + e.getMessage());
            errorResponse.put("query", query);
            errorResponse.put("topK", topK != null ? topK : DEFAULT_TOP_K);
            return errorResponse;
        }
    }
    
    private int validateAndSetTopK(Integer topK) {
        if (topK == null) {
            return DEFAULT_TOP_K;
        }
        
        if (topK < MIN_TOP_K || topK > MAX_TOP_K) {
            return DEFAULT_TOP_K; // Fallback to default
        }
        
        return topK;
    }
    
    private Map<String, Object> parseResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Clean the response by removing markdown code block formatting
            String cleanedResponse = cleanMarkdownCodeBlock(response);
            
            // Try to parse JSON response
            Map<String, Object> parsedResponse = objectMapper.readValue(cleanedResponse, Map.class);
            result.putAll(parsedResponse);
        } catch (Exception e) {
            // Fallback: if not valid JSON, return structured error response
            result.put("raw_response", response);
            result.put("query", "Unable to parse");
            result.put("hs_codes", new ArrayList<>());
            result.put("parsing_error", "Response parsing failed: " + e.getMessage());
        }
        
        return result;
    }
    
    private String cleanMarkdownCodeBlock(String response) {
        if (response == null) {
            return "";
        }
        
        // Remove markdown code block formatting
        String cleaned = response.trim();
        
        // Remove ```json at the beginning
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7); // Remove "```json"
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3); // Remove "```"
        }
        
        // Remove ``` at the end
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        
        // Remove leading/trailing whitespace and newlines
        cleaned = cleaned.trim();
        
        // Remove leading \n if present
        while (cleaned.startsWith("\n")) {
            cleaned = cleaned.substring(1);
        }
        
        // Remove trailing \n if present
        while (cleaned.endsWith("\n")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1);
        }
        
        return cleaned.trim();
    }
}
