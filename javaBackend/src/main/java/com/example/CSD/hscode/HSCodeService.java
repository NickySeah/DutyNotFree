package com.example.CSD.hscode;

import java.util.*;
// import java.io.IOException;
// import java.io.InputStream;

// import org.apache.poi.ss.usermodel.Workbook;
// import org.apache.poi.ss.usermodel.Sheet;
// import org.apache.poi.ss.usermodel.Row;
// import org.apache.poi.ss.usermodel.Cell;
// import org.apache.poi.ss.usermodel.WorkbookFactory;
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

    public List<HSCode> getHSCode(String code) {
        if (code == null) {
            return listHSCode();
        }

        return hsCodes.findByFilters(code);
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

    // private void importHSCodesFromExcel(InputStream file) throws IOException {
    //     List<HSCode> hsCodeList = new ArrayList<>();
        
    //     try (Workbook workbook = WorkbookFactory.create(file)) {
    //         Sheet sheet = workbook.getSheetAt(0);
            
    //         for (Row row : sheet) {
    //             if (row.getRowNum() == 0) continue;                 // Skip header row
                
    //             try {
    //                 String code = getCellValue(row.getCell(1));
    //                 code = code.substring(0, 6);                        // reduce to first 6 digits; these are used globally
    
    //                 String description = getCellValue(row.getCell(2));
    
    //                 HSCode hsCode = new HSCode();
    //                 hsCode.setCode(code);
    //                 hsCode.setDescription(description);
    //                 hsCodeList.add(hsCode);
    //             }
    //             catch (Exception e) {
    //                 System.out.println("Error: "+ e.getMessage());
    //             }
    //         }
    //     }

    //     // hsCodes.saveAll(hsCodeList);
    //     System.out.println("Imported " + hsCodeList.size() + " HS codes");
    // }

    // private String getCellValue(Cell cell) {
    //     if (cell == null) return null;
        
    //     switch (cell.getCellType()) {
    //         case STRING:
    //             return cell.getStringCellValue();
    //         case NUMERIC:
    //             // Handle numeric HS codes (remove .0 if present)
    //             double num = cell.getNumericCellValue();
    //             if (num == (int) num) {
    //                 return String.valueOf((int) num);
    //             }
    //             return String.valueOf(num);
    //         default:
    //             return null;
    //     }
    // }
}