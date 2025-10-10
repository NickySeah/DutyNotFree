package com.example.CSD.bloc;

import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
public class BlocCreateRequest {  // Not an entity, just a data carrier   //TODO: if want to change JSON field names, use @JsonProperty("field_name")
    @NotBlank(message = "Bloc must have a code")
    @Schema(description = "Updated name of the product", example = "ASEAN")
    private String code;  // Full bloc code
    
    @NotBlank(message = "Bloc must have a name")
    @Schema(description = "Updated name of the product", example = "Association of Southeast Asian Nations")
    private String name;  // Full bloc name

    @NotBlank(message = "Bloc must have at least two member countries")
    @Schema(description = "ISO codes of countries that are members", example = "[096, 116, 360]")
    private Set<String> memberCodes;
}