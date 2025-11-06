package com.example.CSD.hscode;

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

@Tag(name = "HS Code Controller", description = "Operations related to HS code management")
@RestController 
@RequestMapping("/api/v1/hscodes")        // url starts with /hscodes
public class HSCodeV1Controller {
    private HSCodeService hsCodeService;

    public HSCodeV1Controller(HSCodeService hsCodeService) {
        this.hsCodeService = hsCodeService;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the HS Code microservice is running")
    @GetMapping("/test")
    public String index() {
        return "HS Code microservice is running.";
    }

    @Operation(summary = "Get all HS codes", description = "Returns a list of all HS codes in the database")
    @GetMapping("/all")
    public List<HSCode> getAllHSCode() {
        return hsCodeService.listHSCode();
    }

    @Operation(
    summary = "Search HS codes",
    description = "Search HS codes by exact code or keyword in description. If both are provided, only 'code' is used."
    )
    @GetMapping()
    public List<HSCode> getHSCode(
        @Parameter(description = "Exact HS code to search for", example = "847130") @RequestParam(required = false) String code,
        @Parameter(description = "Keyword to search within HS code descriptions", example = "laptop") @RequestParam(required = false) String keyword
    ) {
        return hsCodeService.getHSCode(code, keyword);
    } 

    @Operation(
    summary = "Create a new HS code",
    description = "Adds a new HS code to the database with its description"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "HS code created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public HSCode addHSCode(@RequestBody HSCode newHSCode) {
        return hsCodeService.addHSCode(newHSCode);
    }

    @Operation(summary = "Update HS code by code", description = "Updates an existing HS code using its code value")
    @PutMapping()
    public HSCode updateHSCode(@Parameter(description = "HS code to update") @RequestParam String code, @RequestBody HSCode updatedHSCode) {
        return hsCodeService.updateHSCode(code, updatedHSCode);
    }

    @Operation(summary = "Delete HS code by code", description = "Deletes an HS code using its code value")
    @DeleteMapping()
    public void deleteHSCode(@Parameter(description = "HS code to delete") @RequestParam String code) {
        hsCodeService.deleteHSCode(code);
    }
}