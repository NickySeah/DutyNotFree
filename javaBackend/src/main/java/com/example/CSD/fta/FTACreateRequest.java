package com.example.CSD.fta;

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
@Schema(description = "Request payload for creating a new fta")
public class FTACreateRequest {  // Not an entity, just a data carrier   //TODO: add schema description and not blank message
    // @NotBlank(message = "FTA is either Bilateral or Plurilateral")
    // // @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    // private String type; // BILATERAL (country-country) or PLURILATERAL (country-bloc/bloc-bloc) 

    @NotBlank(message = "")
    // @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    private String partyA;

    @NotBlank(message = "")
    // @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    private String partyB;

    @NotBlank(message = "Tariff must have a valid effective date (YYYY-MM-DD)")
    @Schema(description = "Date when the FTA becomes effective", example = "2025-01-01")
    private String effectiveDate;           // YYYY-MM-DD format
    
    @Schema(description = "Date when the FTA expires", example = "2025-12-31")
    private String expirationDate;          // YYYY-MM-DD format

    @NotBlank(message = "Min 0% plz")
    @Schema(description = "Default ad valorem rate unless specified otherwise", example = "7.5")
    private Double defaultRate;

    @Schema(description = "HS Code(s) not included in the FTA", example = "7.5")
    private Set<String> excludedHsCodes;
}
