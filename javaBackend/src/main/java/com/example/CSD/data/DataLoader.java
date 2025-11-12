package com.example.CSD.data;

import org.apache.poi.ss.usermodel.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.bloc.BlocRepository;
import com.example.CSD.country.Country;
import com.example.CSD.country.CountryRepository;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tradeParty.TradeParty;

@Component
@ConditionalOnProperty(name = "app.data.loading.enabled", havingValue = "true")
public class DataLoader implements CommandLineRunner {
    
    private final CountryRepository countries;
    private final BlocRepository blocs;
    private final HSCodeRepository hsCodes;
    
    public DataLoader(CountryRepository countryRepository, HSCodeRepository hsCodeRepository, BlocRepository blocRepository) {
        this.countries = countryRepository;
        this.blocs = blocRepository;
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

        if (blocs.count() == 0) {
            System.out.println("Loading blocs...");
            loadBlocs();
        } else {
            System.out.println("Bloc already loaded: " + blocs.count());
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

                        TradeParty tradeParty = new TradeParty();
                        tradeParty.setType(TradeParty.PartyType.COUNTRY);
                        tradeParty.setCountry(country);
                        country.setTradeParty(tradeParty);
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

    private void loadBlocs() throws Exception {
        InputStream file = new ClassPathResource("data/AllBloc.xlsx").getInputStream();
        
        try (Workbook workbook = WorkbookFactory.create(file)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Bloc> blocsList = new ArrayList<>();
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header
                
                String name = getCellValue(row.getCell(0));
                String code = getCellValue(row.getCell(1));
                String members = getCellValue(row.getCell(2));
                List<String> memberCodes = List.of(members.split(","));
                
                if (memberCodes != null && memberCodes.size() >= 2) {
                    try {
                        Bloc bloc = new Bloc();
                        bloc.setCode(code.trim());
                        bloc.setName(name.trim());

                        Set<Country> memberCountries = new LinkedHashSet<>();
                        for (String memberCode : memberCodes) {
                            Country c = countries.findByCode(memberCode)                                                 // Checks if country with code exists 
                            .orElseThrow(() -> new RuntimeException("No country found with iso code " + memberCode + "for bloc "+name));    // If one doesn't exist, don't add new bloc

                            memberCountries.add(c);
                        }
                        bloc.setMemberCountries(memberCountries);

                        TradeParty tradeParty = new TradeParty();
                        tradeParty.setType(TradeParty.PartyType.BLOC);
                        tradeParty.setBloc(bloc);
                        bloc.setTradeParty(tradeParty);

                        blocsList.add(bloc);
                    } 
                    catch (RuntimeException e) {
                        System.err.println(e.getMessage());
                    }
                }
            }
            
            blocs.saveAll(blocsList);
            System.out.println("✓ Loaded " + blocsList.size() + " Blocs");
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