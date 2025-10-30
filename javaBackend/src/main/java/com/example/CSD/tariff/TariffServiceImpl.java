package com.example.CSD.tariff;

import java.util.*;
import java.time.DateTimeException;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.country.*;
import com.example.CSD.hscode.*;

@Service
public class TariffServiceImpl implements TariffService {
    private TariffRepository tariffs;
    private CountryRepository countries;
    private HSCodeRepository hscodes;

    public TariffServiceImpl(TariffRepository tariffs, CountryRepository countries, HSCodeRepository hscodes) {
        this.tariffs = tariffs;
        this.countries = countries;
        this.hscodes = hscodes;
    }

    // Retrieve all tariffs in DB
    public List<Tariff> listTariffs() {
        return getTariff(null, null, null, null);
    }

    // Retrieve tariffs based on given condition(s)
    public List<Tariff> getTariff(String originCode, String destCode, String hsCode, String tariffType) {
        return tariffs.findByFilters(originCode, destCode, hsCode, tariffType);
    }
    
    // Retrieve tariff by its id
    public Tariff getTariffByID(Long id) {
        return tariffs.findById(id).orElseThrow(() -> new RuntimeException("No tariff with id "+id+" exist."));
    }

    // Retrieve active tariffs based on given condition(s) and date
    public List<Tariff> getActiveTariffs(String originCode, String destCode, String hsCode, String tariffType, String date) {
        LocalDate queryDate = validateDateStr(date, "Query");

        if (queryDate == null) {
            throw new RuntimeException("Please provide a valid date in the format YYYY-MM-DD.");
        }

        // If no parameters provided, return all active tariffs on that date
        if (originCode == null && destCode == null && hsCode == null && tariffType == null) {
            return tariffs.findActiveTariffs(queryDate);
        }

        // Othwerwise, filter based on provided parameters
        return tariffs.findActiveTariffsByFilters(originCode, destCode, hsCode, tariffType, queryDate);
    }

    // TODO: what kind of exception to throw - custom TariffException or Runtime or IllegalArg or etc
    // Create & add a new tariff to DB          
    public Tariff createTariff(TariffCreateRequest request) {
        // (1) Validate Tariff Request
        String originCode = request.getOriginCountry();
        String destCode = request.getDestCountry();
        
        // Origin & Destination Country Codes (compulsory fields)
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
        LocalDate startDate = validateDateStr(request.getEffectiveDate(), "Effective");         // returns LocalDate or throws exception if invalid format      
        LocalDate endDate = validateDateStr(request.getExpirationDate(), "Expiration");         // if empty/null, tariff is currently used        
        
        if (endDate != null && startDate.isAfter(endDate)) {                                    // (!) Start date is after end date 
            throw new RuntimeException("Effective date cannot be after expiration date. Please provide a valid effective date.");
        }

        // (2) Check if a tariff with the same origin, dest, hsCode, tariff type exists
        
        if (tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)){
            // Find all existing tariffs with same origin, dest, hsCode & tariff type
            List<Tariff> existingTariffs = tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType);
            validateDates(existingTariffs,startDate, endDate);
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
    private LocalDate validateDateStr(String dateStr, String type) {
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

    private void validateDates(List<Tariff> existingTariffs, LocalDate startDate, LocalDate endDate) {
        for (Tariff tariff : existingTariffs) {                                     // Check each tariff for date overlaps
            LocalDate existingEffective = tariff.getEffectiveDate();
            LocalDate existingExpiration = tariff.getExpirationDate();

            boolean newEndsBeforeExisting = endDate != null && endDate.isBefore(existingEffective.plusDays(1));
            boolean newStartsAfterExisting = existingExpiration != null && startDate.isAfter(existingExpiration.minusDays(1));

            if (!newEndsBeforeExisting && !newStartsAfterExisting) {                // (!) Overlap found
                String issue = "";

                if (endDate != null && endDate.isAfter(existingEffective) && (existingExpiration == null || startDate.isBefore(existingExpiration))) {
                    issue = "The new tariff's period overlaps with the existing tariff.";
                } 
                else if (existingExpiration != null && startDate.isBefore(existingExpiration)) {
                    issue = "The new tariff starts before the existing tariff ends.";
                } 
                else if (existingExpiration == null) {
                    issue = "The new tariff overlaps with an ongoing tariff.";
                }
                
                throw new RuntimeException(
                    issue + 
                    String.format(" Existing: %s to %s. ", existingEffective, existingExpiration != null ? existingExpiration : "Ongoing") + 
                    String.format(" New: %s to %s. ", startDate, endDate != null ? endDate : "Ongoing") +
                    "Please adjust the dates to avoid overlap."
                );
            }
        }
    }

    // Updates only standardRate, flatFee, start & end date; ; Find tariff using country codes, hs code & tariff type
    public Tariff updateTariff(String originCode, String destCode, String hsCodeValue, String tariffType, String effectiveDateStr, TariffUpdateRequest request) {
        System.out.println("CALLING RIGHT METHOD");
        // (1) Retrieve queried tariff
        LocalDate effectiveDate = validateDateStr(effectiveDateStr, "Effective");
        Tariff existingTariff = tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(originCode, destCode, hsCodeValue, tariffType, effectiveDate)
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
            LocalDate finalStart = request.isEffectiveDateProvided() ? validateDateStr(request.getEffectiveDate(), "Effective") : existingTariff.getEffectiveDate();
            LocalDate finalEnd = request.isExpirationDateProvided() ? validateDateStr(request.getExpirationDate(), "Expiration") : existingTariff.getExpirationDate();

            if (finalStart == null) {
                throw new RuntimeException("Cannot remove a tariff's effective date.");
            }
            if (finalEnd != null && finalEnd.isBefore(finalStart)) {
                throw new RuntimeException("Cannot have an start date ("+finalStart+") after its end date ("+finalEnd+").");
            }

            // Check for date overlaps with other tariffs of same origin, dest, hsCode & type
            List<Tariff> existingTariffs = tariffs.findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType);
            existingTariffs.remove(existingTariff);                             // Exclude checking against itself
            validateDates(existingTariffs, finalStart, finalEnd);

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
        return updateTariff(eT.getOriginCountry().getCode(), eT.getDestCountry().getCode(), eT.getHsCode().getCode(), eT.getTariffType(), eT.getEffectiveDate().toString(), request);
    }

    // Delete tariff; Find tariff using country codes, hs code & tariff type
    @Transactional
    public void deleteTariff(String originCode, String destCode, String hsCodeValue, String tariffType, String effectiveDateStr) {
        LocalDate effectiveDate = validateDateStr(effectiveDateStr, "Effective");
        if (effectiveDate == null) {
            throw new RuntimeException("Please provide a valid effective date in the format YYYY-MM-DD.");
        }
        if (!tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode, hsCodeValue, tariffType)){
            throw new RuntimeException(String.format("Tariff not found"));
        }

        tariffs.deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(originCode, destCode, hsCodeValue, tariffType, effectiveDate);
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