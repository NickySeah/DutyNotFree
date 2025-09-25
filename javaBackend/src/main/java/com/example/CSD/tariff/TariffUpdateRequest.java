package com.example.CSD.tariff;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class TariffUpdateRequest {                      // Not an entity, just a data carrier
    private Double standardRate;        
    private Double flatFee;
    private String effectiveDate;                       // YYYY-MM-DD format
    private String expirationDate;                      // YYYY-MM-DD format

    @JsonIgnore private boolean standardRateProvided = false;       // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean flatFeeProvided = false;
    @JsonIgnore private boolean effectiveDateProvided = false;
    @JsonIgnore private boolean expirationDateProvided = false;

    public void setStandardRate(Double standardRate) {
        this.standardRate = standardRate;
        this.standardRateProvided = true;
    }
    
    public void setFlatFee(Double flatFee) {
        this.flatFee = flatFee;
        this.flatFeeProvided = true;
    }

    public void setEffectiveDate(String effectiveDate) {
        this.effectiveDate = effectiveDate;
        this.effectiveDateProvided = true;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
        this.expirationDateProvided = true;
    }
}
