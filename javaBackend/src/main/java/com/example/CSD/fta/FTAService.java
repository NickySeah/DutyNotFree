package com.example.CSD.fta;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

// import javax.swing.text.html.Option;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.fta.FTA.FTAType;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.tradeParty.TradeParty;
import com.example.CSD.tradeParty.TradeParty.PartyType;
import com.example.CSD.tradeParty.TradePartyRepository;

@Service
public class FTAService {
    private FTARepository agreements;
    private TradePartyRepository parties;
    private HSCodeRepository hscodes;

    public FTAService(FTARepository agreements, TradePartyRepository parties, HSCodeRepository hscodes) {
        this.agreements = agreements;
        this.parties = parties;
        this.hscodes = hscodes;
    }

    public List<FTA> listFTAs() {
        return agreements.findAll();
    }

    public FTA getFTAByID(Long id) {
        return agreements.findById(id).orElseThrow(() -> new RuntimeException("No FTA with id "+id+" exist."));
    }

    public List<FTA> getFTA(String type, String partyA, String partyB) {
        // Validate party A & B
        TradeParty tPartyA = validateTradeParty(partyA);                            // Validate country code or bloc code
        TradeParty tPartyB = validateTradeParty(partyB);                            // Returns null if unspecified, TradeParty if found, or error if not found 

        if (tPartyA != null && tPartyA.equals(tPartyB)) {                           // Check if both given, A not the same as B
            throw new RuntimeException("Same country/bloc cannot have a FTA with itself. Please provide a valid party.");
        };

        // Filter by FTA type first
        FTAType enumType = validateFTAType(type);
        List<FTA> results = enumType==null ? agreements.findAll() : agreements.findAllByType(enumType);
        
        // Filer out those w/o partyA and/or partyB
        if (tPartyA != null || tPartyB != null) {
            Iterator<FTA> iter = results.iterator();
            while (iter.hasNext()) {                                                // Check all bloc to find bloc(s) that contain all specified countries
                FTA f = iter.next();
                TradeParty existingPA = f.getPartyA();                              // Get both parties in current FTA
                TradeParty existingPB = f.getPartyB();
                boolean AisBloc = existingPA.getType() == PartyType.BLOC;
                boolean BisBloc = existingPB.getType() == PartyType.BLOC;
                boolean matchA = true;
                boolean matchB = true;

                if (tPartyA != null) {                                                  // Check if query partyA matches either party    // TODO: make a helper if used elsewhere
                    boolean targetAisCountry = tPartyA.getType() == PartyType.COUNTRY;
                    matchA = existingPA.equals(tPartyA) || existingPB.equals(tPartyA);

                    if (!matchA && targetAisCountry) {
                        if (AisBloc && existingPA.getBloc().getMemberCountries().contains(tPartyA.getCountry())) {
                            matchA = true;
                        } 
                        else if (BisBloc && existingPB.getBloc().getMemberCountries().contains(tPartyA.getCountry())) {
                            matchA = true;
                        }
                    }
                }
                if (tPartyB != null) {
                    boolean targetBisCountry = tPartyB.getType() == PartyType.COUNTRY;
                    matchB = existingPA.equals(tPartyB) || existingPB.equals(tPartyB);

                    if (!matchB && targetBisCountry) {
                        if (AisBloc && existingPA.getBloc().getMemberCountries().contains(tPartyB.getCountry())) {
                            matchB = true;
                        } 
                        else if (BisBloc && existingPB.getBloc().getMemberCountries().contains(tPartyB.getCountry())) {
                            matchB = true;
                        }
                    }
                }

                if (!matchA || !matchB) {
                    iter.remove();
                }
            }
        }

        return results;    //agreements.findByFilters(iso, name, alpha3);
    }

    public List<FTA> getActiveFTA(String type, String partyA, String partyB, String date) {
        LocalDate queryDate = validateDateStr(date, "Query");

        if (queryDate == null) {
            throw new RuntimeException("Please provide a valid date in the format YYYY-MM-DD.");
        }

        List<FTA> results = getFTA(type, partyA, partyB);
        Iterator<FTA> iter = results.iterator();
        while (iter.hasNext()) {                                    // Check all bloc to find bloc(s) that contain all specified countries
            FTA f = iter.next();
            LocalDate effectiveDate = f.getEffectiveDate();
            LocalDate expirationDate = f.getExpirationDate();

            if (effectiveDate.isAfter(queryDate) || (expirationDate!=null && expirationDate.isBefore(queryDate))) {
                iter.remove();
            }
        }
        
        return results;
    }

    public FTA createFTA(FTACreateRequest request) {
        // (1) Validate FTA Request
        // Party A and B
        TradeParty tPartyA = validateTradeParty(request.getPartyA());                           
        TradeParty tPartyB = validateTradeParty(request.getPartyB());  

        if (tPartyA == null || tPartyB == null) {                                           // (!) Less than 2 parties given
            throw new RuntimeException("FTA cannot have no/one party involved. Please provide two valid parties.");
        }
        else if (tPartyA.equals(tPartyB)) {                                                 // (!) A is same as B
            throw new RuntimeException("Same country/bloc cannot have a FTA with itself. Please provide two valid parties.");
        };

        // Determine type of FTA
        FTAType enumType = FTAType.BILATERAL;    //validateFTAType(request.getType());
        if (tPartyA.getType() == PartyType.BLOC || tPartyB.getType() == PartyType.BLOC) {   // There is Bloc as one or both parties
            enumType = FTAType.PLURILATERAL;
        } 

        // Default Rate
        Double defaultRate = request.getDefaultRate();
        if (defaultRate < 0) {
            throw new RuntimeException("Default rate under FTA cannot be negative. Please provide a valid default rate.");
        }

        // Excluded HS Codes
        Set<String> excludedHsCodesStr = request.getExcludedHsCodes();                          
        Set<HSCode> excludedHsCodes = new LinkedHashSet<>();
        if (excludedHsCodesStr != null && !excludedHsCodesStr.isEmpty()) {                      // HS Code(s) are given
            for (String hsCodeValue : excludedHsCodesStr) {
                HSCode hsCode = hscodes.findByCode(hsCodeValue)                                 // (?) Check if HS code exists
                .orElseThrow(() -> new RuntimeException("HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));

                excludedHsCodes.add(hsCode);                                                    // Add into set of hs codes
            }
        }

        // Start Date (compulsory) & End Date (optional)
        LocalDate startDate = validateDateStr(request.getEffectiveDate(), "Effective");         // returns LocalDate or throws exception if invalid format      
        LocalDate endDate = validateDateStr(request.getExpirationDate(), "Expiration");         // if empty/null, fta is currently effective        
        
        if (endDate != null && startDate.isAfter(endDate)) {                                    // (!) Effective date is after Expiration date 
            throw new RuntimeException("Effective date cannot be after expiration date. Please provide a valid effective date.");
        }

        // (2) Check if a FTA between the same parties exists
        List<FTA> existingFTAs = agreements.findByParties(tPartyA, tPartyB);
        if (!existingFTAs.isEmpty()){
            FTA f = existingFTAs.get(0);
            if (!f.getPartyA().equals(tPartyA)) {               // Check order of existing FTA
                TradeParty temp = tPartyA;                          // Swap order to match existing FTA
                tPartyA = tPartyB;
                tPartyB = temp;
            }

            validateDates(existingFTAs,startDate, endDate);     // Validate new date with dates of all existing FTA
        }

        // (3) Create & save FTA
        FTA fta = new FTA();
        fta.setType(enumType);
        fta.setPartyA(tPartyA);
        fta.setPartyB(tPartyB);
        fta.setDefaultRate(defaultRate);
        fta.setEffectiveDate(startDate);
        fta.setExpirationDate(endDate);
        fta.setExcludedHsCodes(excludedHsCodes);
        return agreements.save(fta);
    }

    public FTA updateFTA(String partyA, String partyB, String effectiveDateStr, FTAUpdateRequest request) {
        // // Validate party A & B
        // TradeParty tPartyA = validateTradeParty(partyA);                            // Validate country code or bloc code
        // TradeParty tPartyB = validateTradeParty(partyB);                            // Returns null if unspecified, TradeParty if found, or error if not found 

        // if (tPartyA == null || tPartyB == null) {
        //     throw new RuntimeException("Both parties of the FTA must be given. Please provide 2 valid parties.");
        // }
        // else if (tPartyA.equals(tPartyB)) {                                        // Check if both given, A not the same as B
        //     throw new RuntimeException("Same country/bloc cannot have a FTA with itself. Please provide 2 valid parties.");
        // };

        // // Validate LocalDate
        // LocalDate effectiveDate = validateDateStr(effectiveDateStr, "Effective");
        return null;
    }

    public FTA updateFTA(Long id, FTAUpdateRequest request) {
        // (1) Retrieve queried FTA
        FTA queryFTA = getFTAByID(id);

        // (2) Validate FTA request
        // Default Rate
        if (request.isDefaultRateProvided()) {
            Double finalRate = request.getDefaultRate();
            System.out.println("\n\n"+finalRate+"\n\n");
            if (finalRate < 0) {
                throw new RuntimeException("Default rate under FTA cannot be negative. Please provide a valid default rate.");
            }
            queryFTA.setDefaultRate(finalRate);
        }

        // Start & End Dates
        if (request.isEffectiveDateProvided() || request.isExpirationDateProvided()) {
            LocalDate finalStart = request.isEffectiveDateProvided() ? validateDateStr(request.getEffectiveDate(), "Effective") : queryFTA.getEffectiveDate();
            LocalDate finalEnd = request.isExpirationDateProvided() ? validateDateStr(request.getExpirationDate(), "Expiration") : queryFTA.getExpirationDate();

            if (finalStart == null) {
                throw new RuntimeException("Cannot remove a tariff's effective date.");
            }
            if (finalEnd != null && finalEnd.isBefore(finalStart)) {
                throw new RuntimeException("Cannot have an start date ("+finalStart+") after its end date ("+finalEnd+").");
            }

            // Check for date overlaps with other tariffs of same origin, dest, hsCode & type
            List<FTA> existingFTAs = agreements.findByParties(queryFTA.getPartyA(), queryFTA.getPartyB());  // List of all FTA between 2 parties
            existingFTAs.remove(queryFTA);                                                                  // Remove queried FTA from this list
            if (!existingFTAs.isEmpty()){                                                                   // Has old/new versions of the quried FTA
                validateDates(existingFTAs, finalStart, finalEnd);                                          // Validate new date with dates of all existing FTA
            }

            if (request.isEffectiveDateProvided()) {
                queryFTA.setEffectiveDate(finalStart);
            }
            if (request.isExpirationDateProvided()) {
                queryFTA.setExpirationDate(finalEnd);
            }
        }

        Set<HSCode> excludedHsCodes = queryFTA.getExcludedHsCodes();
        Set<String> toInclude = request.getIncludeHSCodes();       // remove from list excluded hs codes
        Set<String> toExclude = request.getExcludeHSCodes();       // add to list of excluded hs codes

        if (toInclude != null) {                                   // Exists hs code to remove from excluded list
            for (String include : toInclude) {
                HSCode h = hscodes.findByCode(include)
                .orElseThrow(() -> new RuntimeException("No HS Code found with code " + include));      // If one doesn't exist, don't update FTA

                excludedHsCodes.remove(h);
            }
        }
        if (toExclude != null) {
            for (String exclude : toExclude) {
                HSCode h = hscodes.findByCode(exclude)
                .orElseThrow(() -> new RuntimeException("No HS Code found with code " + exclude));      // If one doesn't exist, don't update FTA

                excludedHsCodes.add(h);
            }
        }

        return agreements.save(queryFTA);
    }

    @Transactional
    public void deleteFTA(Long id) {
        // Check if TradeParty exists before attempting to delete
        if (!agreements.existsById(id)) {
            throw new RuntimeException("No FTA found with id " + id);
        }
        agreements.deleteById(id);
    }

    // Helper Functions to validate
    private TradeParty validateTradeParty(String code) {
        // Check if code is for Country (3 digits) or Block
        if (code == null || code.isBlank()) {   // No code given
            return null;
        }

        boolean isCountry = false;
        if (code.length() == 3) {               // Code is 3 chars only
            try {
                Integer.parseInt(code);             // Checks if code is all digits
                isCountry = true;                   // Code is for Country
            } 
            catch (NumberFormatException e) {}  // Else, Code is for Bloc
        }

        Optional<TradeParty> result = isCountry ? parties.findByCountryCode(code) : parties.findByBlocCode(code);
        return result.orElseThrow(() -> new RuntimeException("No country/bloc found with code: " + code));
    }

    private FTAType validateFTAType(String type) {
        if (type != null && type.isBlank()) {                                       // FTA type specified
            if (!EnumUtils.isValidEnumIgnoreCase(FTAType.class, type)) {                // BUT not a valid type
                throw new RuntimeException(type + " is not a valid FTA type.");
            }
            return FTAType.valueOf(type.toUpperCase());                                 // Valid; Return enum FTAType
        }
        return null;                                                               // Not specified; Return null
    }

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

    private void validateDates(List<FTA> existingFTAs, LocalDate startDate, LocalDate endDate) {
        for (FTA fta : existingFTAs) {                                     // Check each tariff for date overlaps
            LocalDate existingEffective = fta.getEffectiveDate();
            LocalDate existingExpiration = fta.getExpirationDate();

            boolean newEndsBeforeExisting = endDate != null && endDate.isBefore(existingEffective.plusDays(1));
            boolean newStartsAfterExisting = existingExpiration != null && startDate.isAfter(existingExpiration.minusDays(1));

            if (!newEndsBeforeExisting && !newStartsAfterExisting) {                // (!) Overlap found
                String issue = "";

                if (endDate != null && endDate.isAfter(existingEffective) && (existingExpiration == null || startDate.isBefore(existingExpiration))) {
                    issue = "The new FTA's period overlaps with the existing FTA.";
                } 
                else if (existingExpiration != null && startDate.isBefore(existingExpiration)) {
                    issue = "The new FTA starts before the existing FTA ends.";
                } 
                else if (existingExpiration == null) {
                    issue = "The new FTA overlaps with an ongoing FTA.";
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
}