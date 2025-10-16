package com.example.CSD.country;

import java.util.*;
// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class CountryService {
    private CountryRepository countries;

    public CountryService(CountryRepository countries) {
        this.countries = countries;
    }

    public List<Country> listCountries() {
        return countries.findAllByOrderByNameAsc();
    }

    public List<Country> getCountry(String iso, String name, String alpha3) {
        if (iso == null && name == null && alpha3 == null) {
            return listCountries();
        }

        return countries.findByFilters(iso, name, alpha3);
    }

    public Country addCountry(Country newCountry) {
        // Check if country already exists
        if (countries.existsByCode(newCountry.getCode())) {
            throw new RuntimeException("Country with code " + newCountry.getCode() + " already exists");
        }

        String iso = newCountry.getCode();
        String name = newCountry.getName();
        String alpha3 = newCountry.getAlpha3();

        if (iso == null || iso.trim().length() != 3) {
            throw new RuntimeException("Invalid ISO code");
        }
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Country name cannot be empty");
        }
        if (alpha3 == null || alpha3.trim().length() != 3) {
            throw new RuntimeException("Invalid Alpha 3 code");
        }

        return countries.save(newCountry);
    }

    public Country updateCountry(String code, Country updatedCountry) {
        Country country = countries.findByCode(code)
                .orElseThrow(() -> new RuntimeException("No country found with iso code " + code));

        String name = updatedCountry.getName();
        String alpha3 = updatedCountry.getAlpha3();

        if (name != null) {
            if (!name.isBlank()) {
                country.setName(name);
            } else {
                throw new RuntimeException("Country name cannot be empty");
            }
        }
        if (alpha3 != null) {
            if (alpha3.length() == 3) {
                country.setAlpha3(alpha3);
            } else {
                throw new RuntimeException("Alpha 3 code must be exactly 3 characters long");
            }
        }
        return countries.save(country);
    }

    @Transactional
    public void deleteCountry(String code) {
        // Check if country exists before attempting to delete
        if (!countries.existsByCode(code)) {
            throw new RuntimeException("No country found with code " + code);
        }
        countries.deleteByCode(code);
    }
}