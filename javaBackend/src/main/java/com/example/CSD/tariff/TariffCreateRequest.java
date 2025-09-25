package com.example.CSD.tariff;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class TariffCreateRequest {  // Not an entity, just a data carrier   //TODO: if want to change JSON field names, use @JsonProperty("field_name")
    @NotBlank(message = "Tariff must have a valid HS code")
    private String hsCode;          

    @NotBlank(message = "Tariff must have a valid ISO code for origin country")
    private String originCountry;

    @NotBlank(message = "Tariff must have a valid ISO code for destination country")
    private String destCountry;
    
    @NotBlank(message = "Tariff must have a tariff type")
    private String tariffType;

    private Double standardRate;
    
    private Double flatFee;
    
    @NotBlank(message = "Tariff must have a valid effective date (YYYY-MM-DD)")
    private String effectiveDate;           // YYYY-MM-DD format
    
    private String expirationDate;          // YYYY-MM-DD format
}
