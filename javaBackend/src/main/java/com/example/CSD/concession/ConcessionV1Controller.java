package com.example.CSD.concession;

import java.util.*;

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

import com.example.CSD.fta.FTA;
import com.example.CSD.fta.FTAServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "SpecialConcession Controller", description = "Operations related to SpecialConcession management")
@RestController
@RequestMapping("/api/v1/concessions")        // url starts with /blocs
public class ConcessionV1Controller {
    private ConcessionServiceImpl concessionService;

    public ConcessionV1Controller(ConcessionServiceImpl cs) {
        this.concessionService = cs;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the concession microservice is running")
    @GetMapping("/test")
    public String index() {
        return "Special concession microservice is running.";
    }

    // @Operation(summary = "Get all concessions", description = "Returns a list of all concessions in the database")
    // @GetMapping("/all")
    // public List<Concession> getAllConcessions() {
    //     return concessionService.listConcessions();
    // }

    // @Operation(summary = "Get concession by ID", description = "Retrieve a special concession using its unique ID")
    // @GetMapping("/{id}")
    // public Concession getConcessionByID(@Parameter(description = "Concession ID") @PathVariable Long id) {
    //     return concessionService.getConcessionByID(id);
    // }

    // @Operation(summary = "Search concessions", description = "Search concessions by optional FTA ID and HS Code")
    // @GetMapping()
    // public List<Concession> getConcessions(
    //     @Parameter(description = "FTA Id") @RequestParam(required=false) Long ftaID, 
    //     @Parameter(description = "HS Code") @RequestParam(required=false) String hsCode
    // ) {
    //     return concessionService.getConcessions(ftaID, hsCode);
    // }

    // @Operation(summary = "Create a new concession", description = "Adds a new concession to the database")
    // @ApiResponses({
    //     @ApiResponse(responseCode = "201", description = "Concession created successfully")
    // })
    // @ResponseStatus(HttpStatus.CREATED)
    // @PostMapping()
    // public Concession addConcession(@Valid @RequestBody ConcessionCreateRequest request){
    //     return concessionService.addConcession(request);
    // }

    // @Operation(summary = "Update a concession", description = "Updates an existing concession")
    // @PutMapping("/{id}")
    // public Concession updateConcession(@Parameter(description = "Code of the bloc to update") @PathVariable Long id, @Valid @RequestBody ConcessionUpdateRequest request) {
    //     return concessionService.updateConcession(id, request);
    // }

    // @Operation(summary = "Delete concession by id", description = "Deletes a concession using its id")
    // @DeleteMapping("/{id}")
    // public void deleteConcession(@Parameter(description = "Id of concession to delete") @PathVariable Long id) {
    //     concessionService.deleteConcession(id);
    // }
}