package com.example.CSD.fta;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Schema(description = "Request payload for updating an existing tariff")
public class FTAUpdateRequest {                      // Not an entity, just a data carrier
    private Double defaultRate; 
    private String effectiveDate;                       // YYYY-MM-DD format
    private String expirationDate;                      // YYYY-MM-DD format
    private Set<String> includeHSCodes;
    private Set<String> excludeHSCodes;

    @JsonIgnore private boolean defaultRateProvided = false;       // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean effectiveDateProvided = false;
    @JsonIgnore private boolean expirationDateProvided = false;

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
