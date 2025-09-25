package com.example.CSD.country;

import java.util.*;
import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/countries")        // url starts with /countries
public class CountryController {
    private CountryService countryService;

    public CountryController(CountryService cs) {
        this.countryService = cs;
    }

    @GetMapping("/test")
    public String index() {
        return "Country microservice is running.";
    }

    @GetMapping("/all") 
    public List<Country> getAllCountry() {
        return countryService.listCountries();
    }

    @GetMapping()
    public List<Country> getCountry(@RequestParam(required=false) String iso, @RequestParam(required=false) String name, @RequestParam(required=false) String alpha3) {
        return countryService.getCountry(iso, name, alpha3);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Country addCountry(@RequestBody Country country){
        return countryService.addCountry(country);
    }

    @PutMapping()
    public Country updateCountry(@RequestParam String iso, @RequestBody Country updatedCountry) {
        return countryService.updateCountry(iso, updatedCountry);
    }

    @DeleteMapping()
    public void deleteCountry(@RequestParam String iso) {
        countryService.deleteCountry(iso);
    }
}