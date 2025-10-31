package com.example.CSD.tariff;

import java.util.*;
import java.time.DateTimeException;
import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import jakarta.persistence.criteria.Predicate;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import com.example.CSD.country.*;
import com.example.CSD.email.EmailService;
import com.example.CSD.hscode.*;
import com.example.CSD.user.UserDTO;
import com.example.CSD.wishlist.Wishlist;

import com.example.CSD.wishlist.WishlistService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class TariffService {
    private TariffRepository tariffs;
    private CountryRepository countries;
    private HSCodeRepository hscodes;
    private WishlistService wishlistService;
    private final RestTemplate restTemplate;
    private final EmailService emailService;

    @Value("${user.service.url}")
    private String userServiceUrl;

    @Value("${user.service.api-key}")
    private String internalApiKey;

    public TariffService(TariffRepository tariffs, CountryRepository countries,
            HSCodeRepository hscodes,
            WishlistService wishlistService, // <-- Inject the SERVICE
            EmailService emailService, // <-- Inject the SERVICE
            RestTemplate restTemplate) {
        this.tariffs = tariffs;
        this.countries = countries;
        this.hscodes = hscodes;
        this.wishlistService = wishlistService; // <-- Assign the SERVICE
        this.emailService = emailService;
        this.restTemplate = restTemplate;
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
        return tariffs.findById(id).orElseThrow(() -> new RuntimeException("No tariff with id " + id + " exist."));
    }

    // Retrieve active tariffs based on given condition(s) and date
    public List<Tariff> getActiveTariffs(String originCode, String destCode, String hsCode, String tariffType,
            String date) {
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

    // TODO: what kind of exception to throw - custom TariffException or Runtime or
    // IllegalArg or etc
    // Create & add a new tariff to DB
    public Tariff createTariff(TariffCreateRequest request) {
        // (1) Validate Tariff Request
        String originCode = request.getOriginCountry();
        String destCode = request.getDestCountry();

        // Origin & Destination Country Codes (compulsory fields)
        if (originCode.equals(destCode)) { // (!) Origin & destination codes are the same
            throw new RuntimeException("Origin and destination country codes cannot be the same.");
        }

        Country originCountry = countries.findByCode(originCode) // (?) Check if country with originCode exists
                .orElseThrow(() -> new RuntimeException("No country with ISO code '" + originCode
                        + "' found. Please provide a valid country code for origin country."));
        Country destCountry = countries.findByCode(destCode) // (?) Check if country with destCode exists
                .orElseThrow(() -> new RuntimeException("No country with ISO code '" + destCode
                        + "' found. Please provide a valid country code for destination country."));

        // HS Code & Tariff Type (compulsory fields)
        String hsCodeValue = request.getHsCode();
        String tariffType = request.getTariffType();

        HSCode hsCode = hscodes.findByCode(hsCodeValue) // (?) Check if HS code exists
                .orElseThrow(() -> new RuntimeException(
                        "HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));

        // Rate & Flat Fee (only one must be present)
        Double rate = request.getStandardRate();
        Double flatFee = request.getFlatFee();

        if (rate == null && flatFee == null) { // (!) Both left empty
            throw new RuntimeException(
                    "Both standardRate and flatFee not provided. Please provide either one but not both.");
        } else if (rate != null && flatFee != null) { // (!) Both are provided
            throw new RuntimeException(
                    "Both standardRate and flatFee provided. Please provide either one but not both.");
        }

        // Start Date (compulsory) & End Date (optional)
        LocalDate startDate = validateDateStr(request.getEffectiveDate(), "Effective"); // returns LocalDate or throws
                                                                                        // exception if invalid format
        LocalDate endDate = validateDateStr(request.getExpirationDate(), "Expiration"); // if empty/null, tariff is
                                                                                        // currently used

        if (endDate != null && startDate.isAfter(endDate)) { // (!) Start date is after end date
            throw new RuntimeException(
                    "Effective date cannot be after expiration date. Please provide a valid effective date.");
        }

        // (2) Check if a tariff with the same origin, dest, hsCode, tariff type exists

        if (tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode,
                hsCodeValue, tariffType)) {
            // Find all existing tariffs with same origin, dest, hsCode & tariff type
            List<Tariff> existingTariffs = tariffs
                    .findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode,
                            hsCodeValue, tariffType);
            validateDates(existingTariffs, startDate, endDate);
        }

        // debug: to see see values
        // System.out.printf("Origin: %s \nDestination: %s \nHS Code: %s \nType: %s
        // \nRate: %s \nFee: %s \nStart: %s \nEnd: %s%n",originCountry.getName(),
        // destCountry.getName(), hsCode.getDescription(), tariffType, rate, flatFee,
        // startDate, endDate);

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

        Tariff savedTariff = tariffs.save(tariff);

        notifyWishlistUsers(savedTariff, "created");
        return savedTariff;
    }

    // Helper function to validate date string
    private LocalDate validateDateStr(String dateStr, String type) {
        if (dateStr != null && !dateStr.isEmpty()) { // Date provided
            try {
                return LocalDate.parse(dateStr);
            } catch (DateTimeException e) { // (!) Given in invalid format
                System.out.println(e.getMessage());
                throw new RuntimeException(type + " date must be a valid date and in the format YYYY-MM-DD.");
            }
        }
        return null; // No date provided
    }

    private void validateDates(List<Tariff> existingTariffs, LocalDate startDate, LocalDate endDate) {
        for (Tariff tariff : existingTariffs) { // Check each tariff for date overlaps
            LocalDate existingEffective = tariff.getEffectiveDate();
            LocalDate existingExpiration = tariff.getExpirationDate();

            boolean newEndsBeforeExisting = endDate != null && endDate.isBefore(existingEffective.plusDays(1));
            boolean newStartsAfterExisting = existingExpiration != null
                    && startDate.isAfter(existingExpiration.minusDays(1));

            if (!newEndsBeforeExisting && !newStartsAfterExisting) { // (!) Overlap found
                String issue = "";

                if (endDate != null && endDate.isAfter(existingEffective)
                        && (existingExpiration == null || startDate.isBefore(existingExpiration))) {
                    issue = "The new tariff's period overlaps with the existing tariff.";
                } else if (existingExpiration != null && startDate.isBefore(existingExpiration)) {
                    issue = "The new tariff starts before the existing tariff ends.";
                } else if (existingExpiration == null) {
                    issue = "The new tariff overlaps with an ongoing tariff.";
                }

                throw new RuntimeException(
                        issue +
                                String.format(" Existing: %s to %s. ", existingEffective,
                                        existingExpiration != null ? existingExpiration : "Ongoing")
                                +
                                String.format(" New: %s to %s. ", startDate, endDate != null ? endDate : "Ongoing") +
                                "Please adjust the dates to avoid overlap.");
            }
        }
    }

    // Updates only standardRate, flatFee, start & end date; ; Find tariff using
    // country codes, hs code & tariff type
    public Tariff updateTariff(String originCode, String destCode, String hsCodeValue, String tariffType,
            String effectiveDateStr, TariffUpdateRequest request) {
        System.out.println("CALLING RIGHT METHOD");
        // (1) Retrieve queried tariff
        LocalDate effectiveDate = validateDateStr(effectiveDateStr, "Effective");
        Tariff existingTariff = tariffs
                .findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(originCode,
                        destCode, hsCodeValue, tariffType, effectiveDate)
                .orElseThrow(() -> new RuntimeException("Tariff not found."));

        // (2) Validate tariff request & update queried tariff
        // Rate & Fee
        if (request.isStandardRateProvided() || request.isFlatFeeProvided()) {
            Double finalRate = request.isStandardRateProvided() ? request.getStandardRate()
                    : existingTariff.getStandardRate();
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
            LocalDate finalStart = request.isEffectiveDateProvided()
                    ? validateDateStr(request.getEffectiveDate(), "Effective")
                    : existingTariff.getEffectiveDate();
            LocalDate finalEnd = request.isExpirationDateProvided()
                    ? validateDateStr(request.getExpirationDate(), "Expiration")
                    : existingTariff.getExpirationDate();

            if (finalStart == null) {
                throw new RuntimeException("Cannot remove a tariff's effective date.");
            }
            if (finalEnd != null && finalEnd.isBefore(finalStart)) {
                throw new RuntimeException(
                        "Cannot have an start date (" + finalStart + ") after its end date (" + finalEnd + ").");
            }

            // Check for date overlaps with other tariffs of same origin, dest, hsCode &
            // type
            List<Tariff> existingTariffs = tariffs
                    .findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode,
                            hsCodeValue, tariffType);
            existingTariffs.remove(existingTariff); // Exclude checking against itself
            validateDates(existingTariffs, finalStart, finalEnd);

            if (request.isEffectiveDateProvided()) {
                existingTariff.setEffectiveDate(finalStart);
            }
            if (request.isExpirationDateProvided()) {
                existingTariff.setExpirationDate(finalEnd);
            }
        }
        Tariff savedTariff = tariffs.save(existingTariff);
        notifyWishlistUsers(savedTariff, "updated");

        return savedTariff;
    }

    // Update tariff; Find using tariff id
    public Tariff updateTariffById(Long id, TariffUpdateRequest request) {
        Tariff eT = getTariffByID(id);
        return updateTariff(eT.getOriginCountry().getCode(), eT.getDestCountry().getCode(), eT.getHsCode().getCode(),
                eT.getTariffType(), eT.getEffectiveDate().toString(), request);
    }

    // Delete tariff; Find tariff using country codes, hs code & tariff type
    @Transactional
    public void deleteTariff(String originCode, String destCode, String hsCodeValue, String tariffType,
            String effectiveDateStr) {
        LocalDate effectiveDate = validateDateStr(effectiveDateStr, "Effective");
        if (effectiveDate == null) {
            throw new RuntimeException("Please provide a valid effective date in the format YYYY-MM-DD.");
        }
        if (!tariffs.existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(originCode, destCode,
                hsCodeValue, tariffType)) {
            throw new RuntimeException(String.format("Tariff not found"));
        }

        tariffs.deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(originCode,
                destCode, hsCodeValue, tariffType, effectiveDate);
    }

    // Delete tariff; Find tariff using tariff id
    @Transactional
    public void deleteTariffById(Long id) {
        if (!tariffs.existsById(id)) {
            throw new RuntimeException(String.format("Tariff not found"));
        }

        tariffs.deleteById(id);
    }

    /**
     * Gets all tariffs that match the criteria for a user's wishlist.
     *
     * @param userId The user's ID.
     * @return A list of matching Tariff entities.
     */
    public List<Tariff> getTariffsForWishlist(String userId) {
        // 1. Get all items the user is watching
        List<Wishlist> wishlistItems = wishlistService.getWishlistsByUserId(userId);

        if (wishlistItems.isEmpty()) {
            return List.of(); // Return an empty list if the wishlist is empty
        }

        // 2. Build a dynamic "OR" query using Specifications.
        // This creates a single efficient query to the database.
        Specification<Tariff> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (Wishlist item : wishlistItems) {
                // For each wishlist item, create an "AND" group:
                // (hsCode = ? AND originCountry = ? AND destCountry = ?)
                Predicate p = cb.and(
                        // We join on the entity's field, then get the 'code' field from that entity.
                        // This assumes your Country and HSCode entities have a field named 'code'.
                        cb.equal(root.get("hsCode").get("code"), item.getHsCode()),
                        cb.equal(root.get("originCountry").get("code"), item.getExportingCountry()),
                        cb.equal(root.get("destCountry").get("code"), item.getImportingCountry()));
                predicates.add(p);
            }

            // 3. Combine all the "AND" groups with "OR"
            // (item1_match) OR (item2_match) OR (item3_match) ...
            return cb.or(predicates.toArray(new Predicate[0]));
        };

        // 4. Execute the single query and return the results

        return tariffs.findAll(spec);
    }

    private void notifyWishlistUsers(Tariff tariff, String action) {
        String hsCode = tariff.getHsCode().getCode();
        String hsDescription = tariff.getHsCode().getDescription();
        String origin = tariff.getOriginCountry().getName();
        String dest = tariff.getDestCountry().getName();
        String originCode = tariff.getOriginCountry().getCode();
        String destCode = tariff.getDestCountry().getCode();

        List<Wishlist> matchingItems = wishlistService.findMatchingWishlists(hsCode, originCode, destCode);

        // Create the headers that will be sent with each request
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-internal-api-key", internalApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        for (Wishlist item : matchingItems) {
            String userId = item.getUserId();
            String userEmail = null;

            try {
                // Call your Next.js API: e.g., "http://.../api/users/cxkcFQ48n..."
                String urlToCall = userServiceUrl + userId;

                // --- NEW: Use exchange() to send headers ---
                ResponseEntity<UserDTO> response = restTemplate.exchange(
                        urlToCall,
                        HttpMethod.GET,
                        entity, // <-- This includes your API key
                        UserDTO.class);

                UserDTO user = response.getBody();

                if (user != null) {
                    userEmail = user.getEmail();
                }

            } catch (HttpClientErrorException.NotFound e) {
                System.err.println("User not found in Next.js app for ID: " + userId);
                continue;
            } catch (HttpClientErrorException.Unauthorized e) {
                System.err.println("Unauthorized: API key for user service is wrong or missing.");
                // Stop trying, as all requests will fail
                return;
            } catch (Exception e) {
                System.err.println("User service API call failed. Is Next.js running? Error: " + e.getMessage());
                continue;
            }

            if (userEmail == null || userEmail.isEmpty()) {
                System.err.println("User " + userId + " has no email, skipping notification.");
                continue;
            }

            // --- 4. Determine the rate to display (NEW LOGIC) ---
            String tariffValueText;
            if (tariff.getStandardRate() != null) {
                tariffValueText = tariff.getStandardRate() + "%";
            } else if (tariff.getFlatFee() != null) {
                // Assuming a currency like dollars. You can change "$" as needed.
                tariffValueText = "$" + String.format("%.2f", tariff.getFlatFee()) + " (flat fee)";
            } else {
                tariffValueText = "N/A";
            }

            // Build and send the email (same as before)
            String subject = "Tariff Update: " + hsCode + " (" + origin + " to " + dest + ")";
            String body = String.format(
                    "Hello,\n\nA tariff you are watching has been %s.\n\n" +
                            "--- Tariff Details ---\n" +
                            "HS Code: %s\n" +
                            "Description: %s\n" +
                            "Origin Country: %s\n" +
                            "Destination Country: %s\n" +
                            "Tariff Type: %s\n" +
                            "Rate: %s\n" +
                            "Effective Date: %s\n" +
                            "Expiration Date: %s\n\n" +
                            "Thank you.",
                    action,
                    hsCode,
                    hsDescription,
                    origin,
                    dest,
                    tariff.getTariffType(),
                    tariffValueText,
                    tariff.getEffectiveDate(),
                    tariff.getExpirationDate() != null ? tariff.getExpirationDate().toString() : "Ongoing");

            emailService.sendEmail(userEmail, subject, body);
            System.out.println("Going to send an email");
        }
    }
    /**
     * A scheduled task that runs every day at 1:00 AM server time.
     * This task finds all tariffs that expired on the previous day
     * and sends email notifications to all users who wishlisted them.
     */
    @Async
    @Scheduled(cron = "0 0 1 * * *") // Runs at 1:00 AM every day
    public void notifyForExpiredTariffs() {
        // 1. We check for tariffs that expired "yesterday"
        LocalDate yesterday = LocalDate.now().minusDays(1);
        System.out.println("Running daily expiration check for: " + yesterday);

        // 2. Find all tariffs that expired on that date
        List<Tariff> expiredTariffs = tariffs.findAllByExpirationDate(yesterday);

        if (expiredTariffs.isEmpty()) {
            System.out.println("No tariffs expired on " + yesterday);
            return;
        }

        System.out.println("Found " + expiredTariffs.size() + " expired tariffs. Notifying users...");

        // 3. Loop through each expired tariff and notify users
        for (Tariff tariff : expiredTariffs) {
            System.out.println("Notifying for expired tariff ID: " + tariff.getId());
            
            // 4. Call your existing notification logic!
            notifyWishlistUsers(tariff, "expired");
        }

        System.out.println("Finished expired tariff notification task.");
    }
}