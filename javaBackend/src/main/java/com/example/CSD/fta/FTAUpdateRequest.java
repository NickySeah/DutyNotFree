package com.example.CSD.fta;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request payload for updating an existing tariff")
public class FTAUpdateRequest {                      // Not an entity, just a data carrier
    private String name;
    private Double defaultRate; 
    private String effectiveDate;                       // YYYY-MM-DD format
    private String expirationDate;                      // YYYY-MM-DD format
    private Set<String> includeHSCodes;
    private Set<String> excludeHSCodes;

    private Set<FTAConcessionRequest> addConcessions;
    private Set<String> removeConcessions;                          // HS Code(s) specified by concession(s) to be removed

    @JsonIgnore private boolean nameProvided = false;       // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean defaultRateProvided = false;       // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean effectiveDateProvided = false;
    @JsonIgnore private boolean expirationDateProvided = false;

    @Schema(description = "Updated name of FTA")
    public void setName(String name) {
        this.name = name;
        this.nameProvided = true;
    }

    @Schema(description = "Updated standard rate percentage", example = "8.0")
    public void setDefaultRate(Double defaultRate) {
        this.defaultRate = defaultRate;
        this.defaultRateProvided = true;
    }
    
    @Schema(description = "Updated effective date (YYYY-MM-DD)", example = "2025-02-01")
    public void setEffectiveDate(String effectiveDate) {
        this.effectiveDate = effectiveDate;
        this.effectiveDateProvided = true;
    }

    @Schema(description = "Updated expiration date (YYYY-MM-DD)", example = "2025-12-31")
    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
        this.expirationDateProvided = true;
    }
}
