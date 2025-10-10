package com.example.CSD.bloc;

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

@Tag(name = "Bloc Controller", description = "Operations related to bloc management")
@RestController
@RequestMapping("/api/v1/blocs")        // url starts with /blocs
public class BlocV1Controller {
    private BlocService blocService;

    public BlocV1Controller(BlocService bs) {
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

    @Operation(summary = "Search blocs", description = "Search blocs by optional name, or code")
    @GetMapping()
    public List<Bloc> getBloc(
        @Parameter(description = "Name of the bloc") @RequestParam(required=false) String name, 
        @Parameter(description = "Code of the bloc") @RequestParam(required=false) String code) {
        return blocService.getBloc(name, code);
    }

    @Operation(summary = "Create a new bloc", description = "Adds a new bloc to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Bloc created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Bloc addBloc(@RequestBody BlocCreateRequest bloc){
        return blocService.addBloc(bloc);
    }

    @Operation(summary = "Update members of bloc", description = "Updates an existing bloc using its acronym/code")
    @PutMapping()
    public Bloc updateBloc(@Parameter(description = "Code of the bloc to update") @RequestParam String code, @RequestBody BlocUpdateRequest updatedBloc) {
        return blocService.updateBloc(code, updatedBloc);
    }

    @Operation(summary = "Delete bloc by code", description = "Deletes a bloc using its acronym/code")
    @DeleteMapping()
    public void deleteBloc(@Parameter(description = "Code of the counbloctry to delete") @RequestParam String code) {
        blocService.deleteBloc(code);
    }
}