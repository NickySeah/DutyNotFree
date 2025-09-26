package com.example.CSD.tariff;

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
public class TariffUpdateRequest {                      // Not an entity, just a data carrier
    private Double standardRate;        
    private Double flatFee;
    private String effectiveDate;                       // YYYY-MM-DD format
    private String expirationDate;                      // YYYY-MM-DD format

    @JsonIgnore private boolean standardRateProvided = false;       // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean flatFeeProvided = false;
    @JsonIgnore private boolean effectiveDateProvided = false;
    @JsonIgnore private boolean expirationDateProvided = false;

    @Schema(description = "Updated standard rate percentage", example = "8.0")
    public void setStandardRate(Double standardRate) {
        this.standardRate = standardRate;
        this.standardRateProvided = true;
    }
    
    @Schema(description = "Updated flat fee applied regardless of product value", example = "60.0")
    public void setFlatFee(Double flatFee) {
        this.flatFee = flatFee;
        this.flatFeeProvided = true;
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
