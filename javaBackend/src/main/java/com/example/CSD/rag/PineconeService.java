package com.example.CSD.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.pinecone.clients.Index;
import io.pinecone.configs.PineconeConfig;
import io.pinecone.configs.PineconeConnection;
import org.openapitools.db_data.client.ApiException;
import org.openapitools.db_data.client.model.SearchRecordsResponse;

import java.util.*;

@Service
public class PineconeService {
    
    @Value("${pinecone.api.key}")
    private String pineconeApiKey;
    
    @Value("${pinecone.index.host}")
    private String pineconeHost;
    
    @Value("${pinecone.index.name}")
    private String pineconeIndexName;
    
    @Value("${pinecone.namespace:}")
    private String pineconeNamespace;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private Index pineconeIndex;
    
    public List<PineconeResult> searchSimilarHsCodes(String query, int topK) {
        try {
            Index index = getPineconeIndex();
            
            // Define fields to return from metadata
            List<String> fields = new ArrayList<>();
            fields.add("text");
            fields.add("id");
            
            // Search the index using text query without reranking
            SearchRecordsResponse response = index.searchRecordsByText(
                query, 
                pineconeNamespace.isEmpty() ? null : pineconeNamespace, 
                fields, 
                topK, 
                null, 
                null // No reranking
            );
            
            List<PineconeResult> results = new ArrayList<>();
            
            if (response.getResult() != null && response.getResult().getHits() != null) {
                for (var hit : response.getResult().getHits()) {
                    String id = hit.getId();
                    float score = hit.getScore() != null ? hit.getScore().floatValue() : 0.0f;
                    
                    Map<String, Object> metadata = new HashMap<>();
                    String text = "";
                    
                    Object fieldsObj = hit.getFields();
                    if (fieldsObj != null) {
                        try {
                            metadata = objectMapper.convertValue(fieldsObj, Map.class);
                            text = extractTextFromMetadata(metadata);
                        } catch (IllegalArgumentException e) {
                            System.err.println("Failed to convert fields to map: " + e.getMessage());
                        }
                    }
                    
                    results.add(new PineconeResult(id, score, metadata, text));
                }
            }
            
            return results;
            
        } catch (ApiException e) {
            throw new RuntimeException("Error querying Pinecone: " + e.getMessage(), e);
        }
    }
    
    private Index getPineconeIndex() {
        if (pineconeIndex == null) {
            PineconeConfig config = new PineconeConfig(pineconeApiKey);
            config.setHost(pineconeHost);
            PineconeConnection connection = new PineconeConnection(config);
            pineconeIndex = new Index(config, connection, pineconeIndexName);
        }
        return pineconeIndex;
    }
    
    private String extractTextFromMetadata(Map<String, Object> metadata) {
        if (metadata == null) return "";

        String textField = "text";

        Object value = metadata.get(textField);
        if (value != null && !value.toString().trim().isEmpty()) {
            return value.toString();
        }
        
        return "";
    }
}