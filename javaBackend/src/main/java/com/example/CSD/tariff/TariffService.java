package com.example.CSD.tariff;

import java.util.*;
import java.time.DateTimeException;
import java.time.LocalDate;
// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.country.*;
import com.example.CSD.hscode.*;

@Service
public class TariffService {
    private TariffRepository tariffs;
    private CountryRepository countries;
    private HSCodeRepository hscodes;

    public TariffService(TariffRepository tariffs, CountryRepository countries, HSCodeRepository hscodes) {
        this.tariffs = tariffs;
        this.countries = countries;
        this.hscodes = hscodes;
    }

    // Retrieve all tariffs in DB
    public List<Tariff> listTariffs() {
        return tariffs.findAll();
    }

    // TODO: Review whether following methods are redundant
    // Retrieve all tariffs from ORIGIN COUNTRY
    // public List<Tariff> listTariffsByOriginCountry(String countryCode) {
    //     return tariffs.findByOriginCountryCode(countryCode);
    // }

    // // Retrieve all tariffs to DEST COUNTRY
    // public List<Tariff> listTariffsByDestCountry(String countryCode) {
    //     return tariffs.findByDestCountryCode(countryCode);
    // }

    // // Retrieve all tariffs for products with <HS CODE>
    // public List<Tariff> listTariffsByHSCode(String code) {
    //     return tariffs.findByHsCode_Code(code);
    // }

    // // Retrieve all tariffs between <ORIGIN COUNTRY> & <DEST COUNTRY>
    // public List<Tariff> listTariffsByOriginAndDestCountry(String originCode, String destCode) {
    //     return tariffs.findByOriginCountry_CodeAndDestCountry_Code(originCode, destCode);
    // }

    // // Retrieve all tariffs between <ORIGIN COUNTRY> & <DEST COUNTRY> for <HS CODE>
    // public List<Tariff> listTariffsByOriginDestAndHSCode(String originCode, String destCode, String hsCode) {
    //     return tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_Code(originCode, destCode, hsCode);
    // }

    // TODO: Review this method - I think it is a better query (general method that can filter anything; no strict format)
    // Retrieve tariffs based on given condition(s)
    public List<Tariff> getTariff(String originCode, String destCode, String hsCode, String tariffType) {
        // If no parameters provided, return all tariffs
        if (originCode == null && destCode == null && hsCode == null && tariffType == null) {
            return listTariffs();
        }

        // Othwerwise, filter based on provided parameters
        return tariffs.findByFilters(originCode, destCode, hsCode, tariffType);
    }
    
    // Retrieve tariff by its id
    public Tariff getTariffByID(Long id) {
        return tariffs.findById(id).orElseThrow(() -> new RuntimeException("No product with id "+id+" exist."));
    }

    // TODO: what kind of exception to throw - custom TariffException or Runtime or IllegalArg or etc
    // Create & add a new tariff to DB          
    public Tariff createTariff(TariffRequest request) {
        // (1) Validate Tariff Request
        String originCode = request.getOriginCountry();
        String destCode = request.getDestCountry();
        
        // Origin & Destination Country Codes (compulsory fields)
        if (originCode == null || originCode.isEmpty()) {                       // (!) Origin country code left empty
            throw new RuntimeException("Origin country code cannot be left empty.");
        }
        else if (destCode == null || destCode.isEmpty()) {                      // (!) Destination country code left empty
            throw new RuntimeException("Destination country code cannot be left empty.");
        }
        else if (originCode.equals(destCode)) {                                 // (!) Origin & destination codes are the same
            throw new RuntimeException("Origin and destination country codes cannot be the same.");
        }

        Country originCountry = countries.findByCode(originCode)                // (?) Check if country with originCode exists
        .orElseThrow(() -> new RuntimeException("No country with ISO code '" + originCode + "' found. Please provide a valid code for origin country."));
        Country destCountry = countries.findByCode(destCode)                    // (?) Check if country with destOrigin exists
        .orElseThrow(() -> new RuntimeException("No country with ISO code '" + destCode + "' found. Please provide a valid country code for destination country."));

        // HS Code & Tariff Type  (compulsory fields)
        String hsCodeValue = request.getHsCode();
        String tariffType = request.getTariffType();

        if (hsCodeValue == null || hsCodeValue.isEmpty()) {                     // (!) HS code left empty
            throw new RuntimeException("HS Code cannot be left empty.");
        }
        HSCode hsCode = hscodes.findByCode(hsCodeValue)                         // (?) Check if HS code exists
        .orElseThrow(() -> new RuntimeException("HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));
        
        if (tariffType == null || tariffType.trim().isEmpty()) {                // (!) Tariff Type left empty   //TODO; need validate? w/enum maybe
            throw new RuntimeException("Tariff type cannot be left empty.");
        }

        // Rate & Flat Fee (only one must be present)
        Double rate = request.getStandardRate();
        Double flatFee = request.getFlatFee();

        if (rate == null && flatFee == null) {                                  // (!) Both left empty
            throw new RuntimeException("Tariff must have either a standard rate or a flat fee.");
        }
        else if (rate != null && flatFee != null) {                             // (!) Both are provided
            throw new RuntimeException("Tariff cannot have both a standard rate or a flat fee.");
        }
        
        // Start & End Date (optional)
        String startDateStr = request.getStartDate();                               // TODO: i dunno if can be empty
        String endDateStr = request.getEndDate();                                   // if empty, tariff is currently being used

        if (startDateStr == null && endDateStr != null) {                           // (!) Tariff has an end date but no start date
            throw new RuntimeException("Tariff cannot have a end date without a start date");
        }
        
        LocalDate startDate = validateLocalDate(startDateStr, "Start");             
        LocalDate endDate = validateLocalDate(endDateStr, "End");                   
        
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {   // (!) Both dates are given but start date is after end date 
            throw new RuntimeException("Start date of the tariff cannot be after its end date");
        }

        // (2) Check if a tariff with the same origin, dest, hsCode, tariff type exists
        if (tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)){
            throw new RuntimeException(String.format("A(n) '%s' tariff for %s (%s) between %s (origin) and %s (destination) already exists.", tariffType, hsCodeValue, hsCode.getDescription(), originCountry.getName(), destCountry.getName()));
        }

        // debug: to see see values
        // System.out.printf("Origin: %s \nDestination: %s \nHS Code: %s \nType: %s \nRate: %s \nFee: %s \nStart: %s \nEnd: %s%n",originCountry.getName(), destCountry.getName(), hsCode.getDescription(), tariffType, rate, flatFee, startDate, endDate);

        // (3) Create & save tariff
        Tariff tariff = new Tariff();
        tariff.setOriginCountry(originCountry);
        tariff.setDestCountry(destCountry);
        tariff.setHsCode(hsCode);
        tariff.setTariffType(tariffType);
        tariff.setStandardRate(rate);
        tariff.setFlatFee(flatFee);
        tariff.setStartDate(startDate);
        tariff.setEndDate(endDate);
        return tariffs.save(tariff);
    }

    // Helper function to validate date string
    private LocalDate validateLocalDate(String dateStr, String type) {
        if (dateStr != null && !dateStr.isEmpty()) {                                    // Date provided
            try {
                    return LocalDate.parse(dateStr);
            }
            catch (DateTimeException e) {                                               // (!) Given in invalid format   
                System.out.println(e.getMessage());
                throw new RuntimeException(type+" date must be a valid date and in the format YYYY-MM-DD.");
            }
        }
        return null;                                                                    // No date provided
    }

    // TODO: allow updating parameter values? - we agreed that if user want to edit country or hs codes or tariff type, they should be making a new one
    // TODO: if value is null - is it removed or unchange - maybe to know it is unchanged, set value as "UNCHANGED" or smth
    
    // Updates only standardRate, flatFee, start & end date; ; Find tariff using country codes, hs code & tariff type
    public Tariff updateTariff(String originCode, String destCode, String hsCodeValue, String tariffType, TariffRequest request) {
        // (1) Retrieve queried tariff
        Tariff existingTariff = tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)
        .orElseThrow(() -> new RuntimeException("Tariff not found."));

        // (2) Validate tariff request
        Double rate = request.getStandardRate();
        Double flatFee = request.getFlatFee();  

        if (rate == null && flatFee == null) {                                      // (!) Both left empty
            throw new RuntimeException("Tariff must have either a standard rate or a flat fee.");
        }
        else if (rate != null && flatFee != null) {                                 // (!) Both are provided
            throw new RuntimeException("Tariff cannot have both a standard rate or a flat fee.");
        }

        String startDateStr = request.getStartDate();                               // TODO: i dunno if can be empty
        String endDateStr = request.getEndDate();                                   // if empty, tariff is currently used

        if (startDateStr == null && endDateStr != null) {                           // (!) Tariff has an end date but no start date
            throw new RuntimeException("Tariff cannot have a end date without a start date");
        }
        
        LocalDate startDate = validateLocalDate(startDateStr, "Start");             
        LocalDate endDate = validateLocalDate(endDateStr, "End");                   
        
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {   // (!) Both dates are given but start date is after end date 
            throw new RuntimeException("Start date of the tariff cannot be after its end date");
        }

        // (3) Update queried tariff 
        existingTariff.setStandardRate(rate);
        existingTariff.setFlatFee(flatFee);
        existingTariff.setStartDate(startDate);
        existingTariff.setEndDate(endDate);
        return tariffs.save(existingTariff);
    }

    // Update tariff; Find using tariff id
    public Tariff updateTariffById(Long id, TariffRequest request) {
        Tariff eT = getTariffByID(id);
        return updateTariff(eT.getOriginCountry().getCode(), eT.getDestCountry().getCode(), eT.getHsCode().getCode(), eT.getTariffType(), request);
    }

    // Delete tariff; Find tariff using country codes, hs code & tariff type
    @Transactional
    public void deleteTariff(String originCode, String destCode, String hsCodeValue, String tariffType) {
        if (!tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)){
            throw new RuntimeException(String.format("Tariff not found"));
        }

        tariffs.deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType);
    }

    // Delete tariff; Find tariff using tariff id
    @Transactional
    public void  deleteTariffById(Long id) {
        if (!tariffs.existsById(id)){
            throw new RuntimeException(String.format("Tariff not found"));
        }

        tariffs.deleteById(id);
    }
}