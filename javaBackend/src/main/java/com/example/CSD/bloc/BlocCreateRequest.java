package com.example.CSD.bloc;

import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
 
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Request payload for creating a new bloc")
public class BlocCreateRequest {  // Not an entity, just a data carrier
    @NotBlank(message = "Bloc must have a code")
    @Schema(description = "Acronym or code of the bloc", example = "ASEAN")
    private String code;                    // Bloc acronym/code
    
    @NotBlank(message = "Bloc must have a name")
    @Schema(description = "Full name of the bloc", example = "Association of Southeast Asian Nations")
    private String name;                    // Full bloc name

    @NotNull(message = "Bloc must have at least two member countries")
    @Schema(description = "ISO codes of bloc's member countries", example = "[096, 116, 360]")
    private Set<String> memberCodes;        // ISO codes of bloc's members (countries)
}