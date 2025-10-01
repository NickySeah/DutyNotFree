package com.example.CSD.country;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Country Controller", description = "Operations related to country management")
@RestController
@RequestMapping("/api/v1/countries")        // url starts with /countries
public class CountryV1Controller {
    private CountryService countryService;

    public CountryV1Controller(CountryService cs) {
        this.countryService = cs;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the country microservice is running")
    public String index() {
        return "Country microservice is running.";
    }

    @Operation(summary = "Get all countries", description = "Returns a list of all countries in the database")
    @GetMapping("/all")
    public List<Country> getAllCountry() {
        return countryService.listCountries();
    }

    @Operation(summary = "Search countries", description = "Search countries by optional ISO code, name, or alpha-3 code")
    @GetMapping()
    public List<Country> getCountry(@Parameter(description = "ISO code of the country")
    @RequestParam(required=false) String iso, @Parameter(description = "Name of the country")
    @RequestParam(required=false) String name, @Parameter(description = "Alpha-3 code of the country")
    @RequestParam(required=false) String alpha3) {
        return countryService.getCountry(iso, name, alpha3);
    }

    @Operation(summary = "Create a new country", description = "Adds a new country to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Country created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Country addCountry(@RequestBody Country country){
        return countryService.addCountry(country);
    }

    @Operation(summary = "Update country by ISO code", description = "Updates an existing country using its ISO code")
    @PutMapping()
    public Country updateCountry(@Parameter(description = "ISO code of the country to update") 
    @RequestParam String iso, @RequestBody Country updatedCountry) {
        return countryService.updateCountry(iso, updatedCountry);
    }

    @Operation(summary = "Delete country by ISO code", description = "Deletes a country using its ISO code")

    @DeleteMapping()
    public void deleteCountry(@Parameter(description = "ISO code of the country to delete") @RequestParam String iso) {
        countryService.deleteCountry(iso);
    }
}