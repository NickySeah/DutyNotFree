package com.example.CSD.tariff;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
import jakarta.validation.Valid;

// import com.example.CSD.tariff.TariffRepository;
@Tag(name = "Tariff Controller", description = "Operations related to tariff management")
@RestController
@RequestMapping("/api/v1/tariffs")        // url starts with /tariffs
public class TariffV1Controller {
    private TariffServiceImpl tariffService;

    public TariffV1Controller(TariffServiceImpl ts) {
        this.tariffService = ts;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the tariff microservice is running")
    @GetMapping("/test")
    public String index() {
        return "Tariff microservice is running.";
    }

    @Operation(summary = "Get all tariffs", description = "Returns a list of all tariffs in the database")
    @GetMapping("/all")
    public List<Tariff> getAllTariffs() {
        return tariffService.listTariffs();
    }

    @Operation(summary = "Search tariffs", description = "Search tariffs by origin, destination, HS code, type, and optionally filter by date")
    @GetMapping()       // optional request parameters
    public List<Tariff> getTariff(@Parameter(description = "Country of origin") @RequestParam(required=false) String origin, @Parameter(description = "Destination country") @RequestParam(required=false) String dest, @Parameter(description = "HS code of the product") @RequestParam(required=false) String hsCode, @Parameter(description = "Tariff type") @RequestParam(required=false) String type, @Parameter(description = "Date to filter active tariffs (YYYY-MM-DD)")
    @RequestParam(required=false) String date) {
        if (date == null) {                                                 // No date specified - No need consider effective & expiration date
            return tariffService.getTariff(origin, dest, hsCode, type);
        }
        else {                                                              // Date specified - Need consider effective & expiration date
            return tariffService.getActiveTariffs(origin, dest, hsCode, type, date);
        }
    }

    @Operation(summary = "Get tariff by ID", description = "Retrieve a tariff using its unique ID")
    @GetMapping("/{id}")
    public Tariff getTariffByID(@Parameter(description = "Tariff ID")
    @PathVariable Long id) {
        return tariffService.getTariffByID(id);
    }

    @Operation(summary = "Create a new tariff", description = "Adds a new tariff to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Tariff created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Tariff createTariff(@Valid @RequestBody TariffCreateRequest request) {
        return tariffService.createTariff(request);
    }

    @Operation(summary = "Update tariff by composite key", description = "Updates a tariff using origin, destination, HS code, and type")
    @ResponseStatus(HttpStatus.OK)
    @PutMapping()       // compulsory request parameters
    public Tariff updateTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type, @RequestParam String effectiveDate, @Valid @RequestBody TariffUpdateRequest request) {
        return tariffService.updateTariff(origin, dest, hsCode, type, effectiveDate, request);
    }

    @Operation(summary = "Update tariff by ID", description = "Updates a tariff using its unique ID")
    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")       
    public Tariff updateTariff(@Parameter(description = "Tariff ID")@PathVariable Long id, @Valid @RequestBody TariffUpdateRequest request) {
        return tariffService.updateTariffById(id, request);
    }

    @Operation(summary = "Delete tariff by composite key", description = "Deletes a tariff using origin, destination, HS code, and type")
    @DeleteMapping()       // compulsory request parameters
    public void deleteTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type, @RequestParam String effectiveDate) {
        tariffService.deleteTariff(origin, dest, hsCode, type, effectiveDate);
    }

    @Operation(summary = "Delete tariff by ID", description = "Deletes a tariff using its unique ID")
    @DeleteMapping("/{id}")
    public void deleteTariffById(@Parameter(description = "Tariff ID") @PathVariable Long id) {
        tariffService.deleteTariffById(id);
    }
}