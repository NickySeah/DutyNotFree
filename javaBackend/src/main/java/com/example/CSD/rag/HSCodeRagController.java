package com.example.CSD.rag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class HSCodeRagController {

    private final RagService ragService;

    @Autowired
    public HSCodeRagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/classify")
    public ResponseEntity<Map<String, Object>> classifyProduct(@RequestBody Map<String, Object> payload) {
        try {
            // Extract query
            String query = (String) payload.get("query");
            
            // Validate input
            if (query == null || query.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("error", "Query parameter is required and cannot be empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Extract topK (let RagService handle validation and defaults)
            Integer topK = null;
            if (payload.containsKey("topK")) {
                Object topKObj = payload.get("topK");
                if (topKObj instanceof Number) {
                    topK = ((Number) topKObj).intValue();
                } else if (topKObj instanceof String) {
                    try {
                        topK = Integer.parseInt((String) topKObj);
                    } catch (NumberFormatException e) {
                        // topK remains null, will use default in service
                    }
                }
            }
            
            // Call the RAG service - returns parsed Map directly
            Map<String, Object> result = ragService.getHsCodeRecommendation(query, topK);
            
            // Check if the service returned an error
            if ("error".equals(result.get("status"))) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("error", "Controller error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Optional: Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "HS Code RAG Service");
        return ResponseEntity.ok(health);
    }
}
