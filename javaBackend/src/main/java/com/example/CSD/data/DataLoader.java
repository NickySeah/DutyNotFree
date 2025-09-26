package com.example.CSD.data;

import org.apache.poi.ss.usermodel.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;

@Component
@ConditionalOnProperty(name = "app.data.loading.enabled", havingValue = "true")
public class DataLoader implements CommandLineRunner {
    
    private final CountryRepository countries;
    private final HSCodeRepository hsCodes;
    
    public DataLoader(CountryRepository countryRepository, HSCodeRepository hsCodeRepository) {
        this.countries = countryRepository;
        this.hsCodes = hsCodeRepository;
    }
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking for initial data...");
        
        if (countries.count() == 0) {
            System.out.println("Loading countries...");
            loadCountries();
        } else {
            System.out.println("Countries already loaded: " + countries.count());
        }
        
        if (hsCodes.count() == 0) {
            System.out.println("Loading HS codes...");
            loadHSCodes();
        } else {
            System.out.println("HS codes already loaded: " + hsCodes.count());
        }
        
        System.out.println("Data loading check completed.");
    }
    
    private void loadCountries() throws Exception {
        InputStream file = new ClassPathResource("data/AllCountry.xlsx").getInputStream();
        
        try (Workbook workbook = WorkbookFactory.create(file)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Country> countriesList = new ArrayList<>();
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header
                
                String name = getCellValue(row.getCell(0));
                String isoStr = getCellValue(row.getCell(1));
                String alpha3 = getCellValue(row.getCell(2));
                
                if (isoStr != null) {
                    try {
                        Country country = new Country();
                        country.setCode(String.format("%03d", Integer.parseInt(isoStr)));
                        country.setName(name.trim());
                        country.setAlpha3(alpha3);
                        countriesList.add(country);
                    } 
                    catch (NumberFormatException e) {
                        System.err.println("Invalid ISO code for country: " + name);
                    }
                }
            }
            
            countries.saveAll(countriesList);
            System.out.println("✓ Loaded " + countriesList.size() + " countries");
        }
    }
    
    private void loadHSCodes() throws Exception {
        InputStream file = new ClassPathResource("data/AllHSCode.xlsx").getInputStream();
        
        try (Workbook workbook = WorkbookFactory.create(file)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<HSCode> hsCodesList = new ArrayList<>();
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header
                
                String code = getCellValue(row.getCell(1));
                String description = getCellValue(row.getCell(2));
                String uom = getCellValue(row.getCell(3));
                
                if (code != null) {
                    HSCode hsCode = new HSCode();
                    hsCode.setCode(code);
                    int cutoffIndex = description.indexOf(String.format("(%s)", uom)); // Remove UOM from description
                    System.out.println(description + " | " + String.format(" (%s)", uom) + " | " + cutoffIndex);
                    hsCode.setDescription(description.substring(0, cutoffIndex).trim());
                    hsCode.setUom(uom);
                    hsCodesList.add(hsCode);
                }
            }
            
            hsCodes.saveAll(hsCodesList);
            System.out.println("✓ Loaded " + hsCodesList.size() + " HS codes");
        }
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } 
                else {
                    double num = cell.getNumericCellValue();
                    if (num == (int) num) {
                        return String.valueOf((int) num);
                    } 
                    else {
                        return String.valueOf(num);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }
}