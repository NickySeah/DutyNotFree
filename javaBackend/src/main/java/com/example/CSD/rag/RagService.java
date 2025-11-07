package com.example.CSD.rag;

import java.util.Map;

public interface RagService {
    
    /**
     * Complete RAG pipeline: Query Pinecone for similar HS codes and get Cohere recommendation
     * @param query The search query text
     * @param topK Number of top results to retrieve from Pinecone (optional, defaults to 5)
     * @return Parsed JSON response as Map
     */
    Map<String, Object> getHsCodeRecommendation(String query, Integer topK);
}