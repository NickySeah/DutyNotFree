package com.example.CSD.tradeParty;

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

// @Tag(name = "TradeParty Controller", description = "Operations related to TradeParty management")
@RestController
@RequestMapping("/api/v1/tradeParties")        // TODO: nothing for now
public class TradePartyV1Controller {
    private TradePartyService TradePartyService;

    public TradePartyV1Controller(TradePartyService cs) {
        this.TradePartyService = cs;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the TradeParty microservice is running")
    @GetMapping("/test")
    public String index() {
        return "TradeParty microservice is running.";
    }

    // @Operation(summary = "Get all countries", description = "Returns a list of all countries in the database")
    // @GetMapping("/all")
    // public List<TradeParty> getAllTradeParty() {
    //     return TradePartyService.listCountries();
    // }

    // @Operation(summary = "Search countries", description = "Search countries by optional ISO code, name, or alpha-3 code")
    // @GetMapping()
    // public List<TradeParty> getTradeParty(@Parameter(description = "ISO code of the TradeParty")
    // @RequestParam(required=false) String iso, @Parameter(description = "Name of the TradeParty")
    // @RequestParam(required=false) String name, @Parameter(description = "Alpha-3 code of the TradeParty")
    // @RequestParam(required=false) String alpha3) {
    //     return TradePartyService.getTradeParty(iso, name, alpha3);
    // }

    // @Operation(summary = "Create a new TradeParty", description = "Adds a new TradeParty to the database")
    // @ApiResponses({
    //     @ApiResponse(responseCode = "201", description = "TradeParty created successfully")
    // })
    // @ResponseStatus(HttpStatus.CREATED)
    // @PostMapping()
    // public TradeParty addTradeParty(@RequestBody TradeParty TradeParty){
    //     return TradePartyService.addTradeParty(TradeParty);
    // }

    // @Operation(summary = "Update TradeParty by ISO code", description = "Updates an existing TradeParty using its ISO code")
    // @PutMapping()
    // public TradeParty updateTradeParty(@Parameter(description = "ISO code of the TradeParty to update") 
    // @RequestParam String iso, @RequestBody TradeParty updatedTradeParty) {
    //     return TradePartyService.updateTradeParty(iso, updatedTradeParty);
    // }

    // @Operation(summary = "Delete TradeParty by ISO code", description = "Deletes a TradeParty using its ISO code")

    // @DeleteMapping()
    // public void deleteTradeParty(@Parameter(description = "ISO code of the TradeParty to delete") @RequestParam String iso) {
    //     TradePartyService.deleteTradeParty(iso);
    // }
}