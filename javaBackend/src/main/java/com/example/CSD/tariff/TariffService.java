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
    public Tariff createTariff(TariffCreateRequest request) {
        // (1) Validate Tariff Request
        String originCode = request.getOriginCountry();
        String destCode = request.getDestCountry();
        
        // Origin & Destination Country Codes (compulsory fields)               // TODO: note null/trim().length() checks removed because of @NotBlank
        if (originCode.equals(destCode)) {                                      // (!) Origin & destination codes are the same
            throw new RuntimeException("Origin and destination country codes cannot be the same.");
        }

        Country originCountry = countries.findByCode(originCode)                // (?) Check if country with originCode exists
        .orElseThrow(() -> new RuntimeException("No country with ISO code '" + originCode + "' found. Please provide a valid country code for origin country."));
        Country destCountry = countries.findByCode(destCode)                    // (?) Check if country with destCode exists
        .orElseThrow(() -> new RuntimeException("No country with ISO code '" + destCode + "' found. Please provide a valid country code for destination country."));

        // HS Code & Tariff Type  (compulsory fields)
        String hsCodeValue = request.getHsCode();
        String tariffType = request.getTariffType();

        HSCode hsCode = hscodes.findByCode(hsCodeValue)                         // (?) Check if HS code exists
        .orElseThrow(() -> new RuntimeException("HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));
    
        // Rate & Flat Fee (only one must be present)
        Double rate = request.getStandardRate();
        Double flatFee = request.getFlatFee();

        if (rate == null && flatFee == null) {                                  // (!) Both left empty
            throw new RuntimeException("Both standardRate and flatFee not provided. Please provide either one but not both.");
        }
        else if (rate != null && flatFee != null) {                             // (!) Both are provided
            throw new RuntimeException("Both standardRate and flatFee provided. Please provide either one but not both.");
        }
        
        // Start Date (compulsory) & End Date (optional)
        LocalDate startDate = validateLocalDate(request.getEffectiveDate(), "Start");       // returns LocalDate or throws exception if invalid format      
        LocalDate endDate = validateLocalDate(request.getExpirationDate(), "End");             // if empty/null, tariff is currently used        
        
        if (endDate != null && startDate.isAfter(endDate)) {                            // (!) Start date is after end date 
            throw new RuntimeException("Start date of the tariff cannot be after its end date. Please provide a valid start date.");
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
        tariff.setEffectiveDate(startDate);
        tariff.setExpirationDate(endDate);
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

    // Updates only standardRate, flatFee, start & end date; ; Find tariff using country codes, hs code & tariff type
    public Tariff updateTariff(String originCode, String destCode, String hsCodeValue, String tariffType, TariffUpdateRequest request) {
        // (1) Retrieve queried tariff
        Tariff existingTariff = tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)
        .orElseThrow(() -> new RuntimeException("Tariff not found."));
        
        // (2) Validate tariff request & update queried tariff
        // Rate & Fee
        if (request.isStandardRateProvided() || request.isFlatFeeProvided()) {
            Double finalRate = request.isStandardRateProvided() ? request.getStandardRate() : existingTariff.getStandardRate();
            Double finalFee = request.isFlatFeeProvided() ? request.getFlatFee() : existingTariff.getFlatFee();

            if ((finalRate == null && finalFee == null) || (finalRate != null && finalFee != null)) {
                throw new RuntimeException("Cannot have both standardRate & flatFee or have none defined.");
            }
            if (request.isStandardRateProvided()) {
                existingTariff.setStandardRate(request.getStandardRate());
            }
            if (request.isFlatFeeProvided()) {
                existingTariff.setFlatFee(request.getFlatFee());
            }
        }

        // Start & End Dates
        if (request.isEffectiveDateProvided() || request.isExpirationDateProvided()) {
            LocalDate finalStart = request.isEffectiveDateProvided() ? validateLocalDate(request.getEffectiveDate(), "Effective") : existingTariff.getEffectiveDate();
            LocalDate finalEnd = request.isExpirationDateProvided() ? validateLocalDate(request.getExpirationDate(), "Expiration") : existingTariff.getExpirationDate();

            if (finalStart == null) {
                throw new RuntimeException("Cannot remove a tariff's effective date.");
            }
            if (finalEnd != null && finalEnd.isBefore(finalStart)) {
                throw new RuntimeException("Cannot have an start date ("+finalStart+") after its end date ("+finalEnd+").");
            }

            if (request.isEffectiveDateProvided()) {
                existingTariff.setEffectiveDate(finalStart);
            }
            if (request.isExpirationDateProvided()) {
                existingTariff.setExpirationDate(finalEnd);
            }
        }

        return tariffs.save(existingTariff);
    }
    
    // Update tariff; Find using tariff id
    public Tariff updateTariffById(Long id, TariffUpdateRequest request) {
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