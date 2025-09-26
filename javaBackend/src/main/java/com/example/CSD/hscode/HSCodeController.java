package com.example.CSD.hscode;

import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController 
@RequestMapping("/hscodes")        // url starts with /hscodes
public class HSCodeController {
    private HSCodeService hsCodeService;

    public HSCodeController(HSCodeService hsCodeService) {
        this.hsCodeService = hsCodeService;
    }

    @GetMapping("/test")
    public String index() {
        return "HS Code microservice is running.";
    }

    @GetMapping("/all")
    public List<HSCode> getAllHSCode() {
        return hsCodeService.listHSCode();
    }

    @GetMapping()
    public List<HSCode> getHSCode(@RequestParam(required = false) String code, @RequestParam(required = false) String keyword) {
        return hsCodeService.getHSCode(code, keyword);
    } 

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public HSCode addHSCode(@RequestBody HSCode newHSCode) {
        return hsCodeService.addHSCode(newHSCode);
    }

    @PutMapping()
    public HSCode updateHSCode(@RequestParam String code, @RequestBody HSCode updatedHSCode) {
        return hsCodeService.updateHSCode(code, updatedHSCode);
    }

    @DeleteMapping()
    public void deleteHSCode(@RequestParam String code) {
        hsCodeService.deleteHSCode(code);
    }
}