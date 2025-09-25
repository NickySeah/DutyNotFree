package com.example.CSD.tariff;

import java.util.*;
import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // @GetMapping("/origin/{countryCode}")
    // public List<Tariff> getTariffsByOriginCountry(@PathVariable String countryCode) {
    //     return tariffService.listTariffsByOriginCountry(countryCode);
    // }

    // @GetMapping("/dest/{countryCode}")
    // public List<Tariff> getTariffsByDestCountry(@PathVariable String countryCode) {
    //     return tariffService.listTariffsByDestCountry(countryCode);
    // }

    // @GetMapping("/code/{code}")
    // public List<Tariff> getTariffsByHSCode(@PathVariable String code) {
    //     return tariffService.listTariffsByHSCode(code);
    // }

    // @GetMapping("/origin/{originCode}/dest/{destCode}")
    // public List<Tariff> getTariffsByOriginAndDestCountry(@PathVariable String originCode, @PathVariable String destCode) {
    //     return tariffService.listTariffsByOriginAndDestCountry(originCode, destCode);
    // }

    // @GetMapping("/origin/{originCode}/dest/{destCode}/code/{hsCode}")
    // public List<Tariff> getTariffsByOriginDestAndHSCode(@PathVariable String originCode, @PathVariable String destCode, @PathVariable String hsCode) {
    //     return tariffService.listTariffsByOriginDestAndHSCode(originCode, destCode, hsCode);
    // }

    @GetMapping()       // optional request parameters
    public List<Tariff> getTariff(@RequestParam(required=false) String origin, @RequestParam(required=false) String dest, @RequestParam(required=false) String hsCode, @RequestParam(required=false) String type) {
        return tariffService.getTariff(origin, dest, hsCode, type);
    }

    @GetMapping("/{id}")
    public Tariff getTariffByID(@PathVariable Long id) {
        return tariffService.getTariffByID(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Tariff createTariff(@RequestBody TariffRequest request) {
        return tariffService.createTariff(request);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping()       // compulsory request parameters
    public Tariff updateTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type, @RequestBody TariffRequest request) {
        return tariffService.updateTariff(origin, dest, hsCode, type, request);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")       
    public Tariff updateTariff(@PathVariable Long id, @RequestBody TariffRequest request) {
        return tariffService.updateTariffById(id, request);
    }

    @DeleteMapping()       // compulsory request parameters
    public void deleteTariff(@RequestParam String origin, @RequestParam String dest, @RequestParam String hsCode, @RequestParam String type) {
        tariffService.deleteTariff(origin, dest, hsCode, type);
    }

    @DeleteMapping("/{id}")
    public void deleteTariffById(@PathVariable Long id) {
        tariffService.deleteTariffById(id);
    }
}