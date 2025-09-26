package com.example.CSD.tariff;

import java.util.*;
import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

// import com.example.CSD.tariff.TariffRepository;

@RestController
@RequestMapping("/tariffs")        // url starts with /tariffs
public class TariffController {
    private TariffService tariffService;

    public TariffController(TariffService ts) {
        this.tariffService = ts;
    }

    @GetMapping("/test")
    public String index() {
        return "Tariff microservice is running.";
    }

    @GetMapping("/all")
    public List<Tariff> getAllTariffs() {
        return tariffService.listTariffs();
    }

    @GetMapping()       // optional request parameters
    public List<Tariff> getTariff(@RequestParam(required=false) String origin, @RequestParam(required=false) String dest, 
    @RequestParam(required=false) String hsCode, @RequestParam(required=false) String type, @RequestParam(required=false) String date) {
        if (date == null) {                                                 // No date specified - No need consider effective & expiration date
            return tariffService.getTariff(origin, dest, hsCode, type);
        }
        else {                                                              // Date specified - Need consider effective & expiration date
            return tariffService.getActiveTariffs(origin, dest, hsCode, type, date);
        }
    }

    @GetMapping("/{id}")
    public Tariff getTariffByID(@PathVariable Long id) {
        return tariffService.getTariffByID(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Tariff createTariff(@Valid @RequestBody TariffCreateRequest request) {
        return tariffService.createTariff(request);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping()       // compulsory request parameters
    public Tariff updateTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type, @RequestParam String effectiveDate, @RequestBody TariffUpdateRequest request) {
        return tariffService.updateTariff(origin, dest, hsCode, type, effectiveDate, request);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")       
    public Tariff updateTariff(@PathVariable Long id, @RequestBody TariffUpdateRequest request) {
        return tariffService.updateTariffById(id, request);
    }

    @DeleteMapping()       // compulsory request parameters
    public void deleteTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type, @RequestParam String effectiveDate) {
        tariffService.deleteTariff(origin, dest, hsCode, type, effectiveDate);
    }

    @DeleteMapping("/{id}")
    public void deleteTariffById(@PathVariable Long id) {
        tariffService.deleteTariffById(id);
    }
}