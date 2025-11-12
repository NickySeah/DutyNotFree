package com.example.CSD.bloc;

import java.util.*;

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
import jakarta.validation.Valid;

@Tag(name = "Bloc Controller", description = "Operations related to bloc management")
@RestController
@RequestMapping("/api/v1/blocs")        // url starts with /blocs
public class BlocV1Controller {
    private BlocServiceImpl blocService;

    public BlocV1Controller(BlocServiceImpl bs) {
        this.blocService = bs;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the bloc microservice is running")
    @GetMapping("/test")
    public String index() {
        return "Bloc microservice is running.";
    }

    @Operation(summary = "Get all blocs", description = "Returns a list of all blocs in the database")
    @GetMapping("/all")
    public List<Bloc> getAllBlocs() {
        return blocService.listBlocs();
    }

    @Operation(summary = "Search blocs", description = "Search blocs by optional name, code, or country code(s)")
    @GetMapping()
    public List<Bloc> getBloc(
        @Parameter(description = "Part of name of the bloc") @RequestParam(required=false) String keyword, 
        @Parameter(description = "Exact name of the bloc") @RequestParam(required=false) String name, 
        @Parameter(description = "Code of the bloc") @RequestParam(required=false) String code,
        @Parameter(description = "ISO codes of countries to find") @RequestParam(required=false) Set<String> country
    ) {
        return blocService.getBloc(keyword, name, code, country);
    }

    @Operation(summary = "Create a new bloc", description = "Adds a new bloc to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Bloc created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Bloc addBloc(@Valid @RequestBody BlocCreateRequest request){
        return blocService.addBloc(request);
    }

    @Operation(summary = "Update members of a bloc", description = "Updates an existing bloc")
    @PutMapping()
    public Bloc updateBloc(@Parameter(description = "Code of the bloc to update") @RequestParam String code, @Valid @RequestBody BlocUpdateRequest request) {
        return blocService.updateBloc(code, request);
    }

    @Operation(summary = "Delete bloc by code", description = "Deletes a bloc using its code")
    @DeleteMapping()
    public void deleteBloc(@Parameter(description = "Code of the bloc to delete") @RequestParam String code) {
        blocService.deleteBloc(code);
    }
}