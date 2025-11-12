package com.example.CSD.rag;

import java.util.Map;

public class PineconeResult {
    private String id;
    private float score;
    private Map<String, Object> metadata;
    private String text;
    
    public PineconeResult(String id, float score, Map<String, Object> metadata, String text) {
        this.id = id;
        this.score = score;
        this.metadata = metadata;
        this.text = text;
    }
    
    public String getId() { return id; }
    public float getScore() { return score; }
    public Map<String, Object> getMetadata() { return metadata; }
    public String getText() { return text; }
}