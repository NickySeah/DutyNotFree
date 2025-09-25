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

    // public HSCode findByCode(String code) {
    //     return hsCodes.findByCode(code).orElseThrow(() -> new RuntimeException("HSCode not found with code " + code));
    // }
    // public List<HSCode> findByCategory(@PathVariable String category) {
    //     try {
    //         return hsCodes.findByCategory(category);
    //     } 
    //     catch (NoSuchElementException e) {
    //         throw new RuntimeException("HSCode not found with category " + category);
    //     }
    // }

    public List<HSCode> getHSCode(String code, String category) {
        if (code == null && category == null) {
            return listHSCode();
        }

        return hsCodes.findByFilters(code, category);
    }

    public HSCode addHSCode(@RequestBody HSCode newHSCode) {
        
        String code = newHSCode.getCode();
        String description = newHSCode.getDescription();
        // String category = newHSCode.getCategory();

        if (code == null || code.trim().length() < 6) {
            throw new RuntimeException("HS Code cannot be empty & is at least 6 numbers long");
        }
        if (description == null || description.trim().length() == 0) {
            throw new RuntimeException("HS code description cannot be empty");
        }

        return hsCodes.save(newHSCode);
    }

    public HSCode updateHSCode(String code, @RequestBody HSCode updatedHSCode) {
        HSCode hsCode = hsCodes.findByCode(code)
        .orElseThrow(() -> new RuntimeException("HSCode not found with code " + code));
       
        String description = updatedHSCode.getDescription();
        String category = updatedHSCode.getCategory();

        if (description != null) {
            if (!description.trim().isEmpty()) {
                hsCode.setDescription(description);
            }
            else {
                throw new RuntimeException("HS code description cannot be empty");
            }
        }
        // if (category != null) {      // TODO: same problem - null means removed or unchanged
        //     if (!category.trim().isEmpty()) {
        //         hsCode.setCategory(category);
        //     }
        //     else {
        //         throw new RuntimeException("HS code category cannot be empty");
        //     }
        // }

        hsCode.setCategory(category);
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