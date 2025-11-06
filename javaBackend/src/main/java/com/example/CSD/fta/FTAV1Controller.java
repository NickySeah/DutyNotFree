package com.example.CSD.fta;

import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;

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

@Tag(name = "FTA Controller", description = "Operations related to TradeParty management")
@RestController
@RequestMapping("/api/v1/ftas")
public class FTAV1Controller {
    private FTAService FTAService;

    public FTAV1Controller(FTAService fs) {
        this.FTAService = fs;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the FTA microservice is running")
    @GetMapping("/test")
    public String index() {
        return "FTA microservice is running.";
    }

    @Operation(summary = "Get all FTA", description = "Returns a list of all FTA in the database")
    @GetMapping("/all")
    public List<FTA> getAllFTAs() {
        return FTAService.listFTAs();
    }

    @Operation(summary = "Search FTA", description = "Search FTA by optional FTA type, country, bloc, date")  //TODO: consider HSCode
    @GetMapping()
    public List<FTA> getFTA(
        @Parameter(description = "FTA Type") @RequestParam(required=false) String type,             // filter by Bilateral FTA & Plurilateral FTA
        @Parameter(description = "CountryA Code") @RequestParam(required=false) String partyA,
        @Parameter(description = "CountryB Code") @RequestParam(required=false) String partyB, 
        @Parameter(description = "Date") @RequestParam(required=false) String date
    ) {
        if (date == null) {                                                 // No date specified - No need consider effective & expiration date
            return FTAService.getFTA(type, partyA, partyB);
        }
        else {                                                              // Date specified - Need consider effective & expiration date
            return FTAService.getActiveFTA(type, partyA, partyB, date);                       
        }
    }

    @Operation(summary = "Get FTA by ID", description = "Retrieve a FTA using its unique ID")
    @GetMapping("/{id}")
    public FTA getFTAByID(@Parameter(description = "FTA ID") @PathVariable Long id) {
        return FTAService.getFTAByID(id);
    }

    @Operation(summary = "Create a new FTA", description = "Adds a new FTA to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "FTA created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public FTA createFTA(@RequestBody FTACreateRequest request){
        return FTAService.createFTA(request);
    }

    @Operation(summary = "Update FTA by id", description = "Updates an existing FTA using its id")
    @PutMapping("/{id}")
    public FTA updateFTA(@Parameter(description = "Id of the FTA to delete") @PathVariable Long id, @RequestBody FTAUpdateRequest request) {
        return FTAService.updateFTA(id, request);
    }

    @Operation(summary = "Delete FTA by id", description = "Deletes a FTA using its id")
    @DeleteMapping("/{id}")
    public void deleteFTA(@Parameter(description = "Id of the FTA to delete") @PathVariable Long id) {
        FTAService.deleteFTA(id);
    }
}