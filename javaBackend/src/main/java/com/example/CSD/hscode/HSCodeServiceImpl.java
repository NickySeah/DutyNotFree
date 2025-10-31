package com.example.CSD.hscode;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Service
public class HSCodeServiceImpl implements HSCodeService{
    private HSCodeRepository hsCodes;

    public HSCodeServiceImpl(HSCodeRepository hsCodes) {
        this.hsCodes = hsCodes;
    }

    @Override
    public List<HSCode> listHSCode() {
        return hsCodes.findAll();
    }

    @Override
    public List<HSCode> getHSCode(String code, String keyword) {
        if (code == null && keyword == null) {
            return listHSCode();
        }
    
        return hsCodes.findByFilters(code, keyword);
    }

    @Override
    public HSCode addHSCode(@Valid @RequestBody HSCode newHSCode) {
        String code = newHSCode.getCode();
        String description = newHSCode.getDescription();

        if (hsCodes.existsByCode(code)) {
            throw new RuntimeException("HS Code " + code + " already exists");
        }
        if (code == null || code.trim().length() < 6) {
            throw new RuntimeException("HS Code cannot be empty or less than 6 digits");
        }
        if (description == null || description.isBlank()) {
            throw new RuntimeException("HS code description cannot be empty");
        }

        return hsCodes.save(newHSCode);
    }

    @Override
    public HSCode updateHSCode(String code, @Valid @RequestBody HSCode updatedHSCode) {
        HSCode hsCode = hsCodes.findByCode(code)
        .orElseThrow(() -> new RuntimeException("No HSCode found with code " + code));
       
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

    @Override
    @Transactional
    public void deleteHSCode(String code) {
        // Check if HSCode exists before attempting to delete
        if (!hsCodes.existsByCode(code)) {
            throw new RuntimeException("No HSCode found with code " + code);
        }
        hsCodes.deleteByCode(code);
    }
}