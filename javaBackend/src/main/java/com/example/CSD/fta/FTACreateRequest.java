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
@Schema(description = "Request payload for creating a new FTA")
public class FTACreateRequest {  // Not an entity, just a data carrier
    // @NotBlank(message = "FTA is either Bilateral or Plurilateral")
    // @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    // private String type; // BILATERAL (country-country) or PLURILATERAL (country-bloc/bloc-bloc) 

    @NotBlank(message = "FTA must have a trade party with a valid code")
    @Schema(description = "Code of first trade party in FTA", example = "702/ASEAN")
    private String partyA;

    @NotBlank(message = "FTA must have a trade party with a valid code")
    @Schema(description = "Code of second trade party in FTA", example = "702/ASEAN")
    private String partyB;

    @NotBlank(message = "FTA must have a valid effective date (YYYY-MM-DD)")
    @Schema(description = "Date when the FTA becomes effective", example = "2025-01-01")
    private String effectiveDate;           // YYYY-MM-DD format
    
    @Schema(description = "Date when the FTA expires", example = "2025-12-31")
    private String expirationDate;          // YYYY-MM-DD format

    @NotBlank(message = "FTA must have a default rate (minimal 0%)")
    @Schema(description = "Default ad valorem rate unless specified otherwise", example = "7.5")
    private Double defaultRate;

    @Schema(description = "HS Code(s) not included in the FTA", example = "01012100")
    private Set<String> excludedHsCodes;

    @Schema(description = "Special concessions (different rates, has staging) included in the FTA")
    private Set<FTAConcessionRequest> concessions;
}
