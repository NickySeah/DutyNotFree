package com.example.CSD.hscode;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.transaction.Transactional;

@Service
public class HSCodeService {
    private HSCodeRepository hsCodes;

    public HSCodeService(HSCodeRepository hsCodes) {
        this.hsCodes = hsCodes;
    }

    public List<HSCode> listHSCode() {
        return hsCodes.findAll();
    }

    public List<HSCode> getHSCode(String code, String keyword) {
        if (code == null && keyword == null) {
            return listHSCode();
        }
    
        return hsCodes.findByFilters(code, keyword);
    }

    public HSCode addHSCode(@RequestBody HSCode newHSCode) {
        String code = newHSCode.getCode();
        String description = newHSCode.getDescription();

        if (code == null || code.trim().length() < 6) {
            throw new RuntimeException("HS Code cannot be empty & is at least 6 numbers long");
        }
        if (description == null || description.isBlank()) {
            throw new RuntimeException("HS code description cannot be empty");
        }

        return hsCodes.save(newHSCode);
    }

    public HSCode updateHSCode(String code, @RequestBody HSCode updatedHSCode) {
        HSCode hsCode = hsCodes.findByCode(code)
        .orElseThrow(() -> new RuntimeException("HSCode not found with code " + code));
       
        String description = updatedHSCode.getDescription();

        if (description != null) {
            if (!description.isBlank()) {
                hsCode.setDescription(description);
            }
            else {
                throw new RuntimeException("HS code description cannot be empty");
            }
        }
 
        return hsCodes.save(hsCode);
    }

    @Transactional
    public void deleteHSCode(String code) {
        // Check if HSCode exists before attempting to delete
        if (!hsCodes.existsByCode(code)) {
            throw new RuntimeException("HSCode not found with code " + code);
        }
        hsCodes.deleteByCode(code);
    }
}