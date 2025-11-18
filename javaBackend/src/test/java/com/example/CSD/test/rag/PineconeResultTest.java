package com.example.CSD.test.rag;

import com.example.CSD.rag.PineconeResult;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class PineconeResultTest {

    @Test
    public void pineconeResult_ShouldStoreAndReturnFieldsCorrectly() {
        // Arrange
        String id = "vec-123";
        float score = 0.987f;
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("hs_code", "847130");
        metadata.put("category", "Laptops");
        String text = "Portable automatic data-processing machines (laptops).";

        // Act
        PineconeResult result = new PineconeResult(id, score, metadata, text);

        // Assert
        assertEquals(id, result.getId());
        assertEquals(score, result.getScore(), 1e-6);
        assertEquals(metadata, result.getMetadata());
        assertEquals(text, result.getText());
    }
}