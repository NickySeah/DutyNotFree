package com.example.CSD.tariff;

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
@Schema(description = "Request payload for creating a new tariff")
public class TariffCreateRequest {  // Not an entity, just a data carrier   // if want to change JSON field names, use @JsonProperty("field_name")
    @NotBlank(message = "Tariff must have a valid HS code")
    @Schema(description = "HS code for the product", example = "847130")
    private String hsCode;          

    @NotBlank(message = "Tariff must have a valid ISO code for origin country")
    @Schema(description = "ISO code of the origin country", example = "SG")
    private String originCountry;

    @NotBlank(message = "Tariff must have a valid ISO code for destination country")
    @Schema(description = "ISO code of the destination country", example = "US")
    private String destCountry;
    
    @NotBlank(message = "Tariff must have a tariff type")
    @Schema(description = "Type of tariff applied", example = "Standard")
    private String tariffType;

    @Schema(description = "Standard rate percentage applied to the product", example = "7.5")
    private Double standardRate;
    
    @Schema(description = "Flat fee applied regardless of product value", example = "50.0")
    private Double flatFee;
    
    @NotBlank(message = "Tariff must have a valid effective date (YYYY-MM-DD)")
    @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    private String effectiveDate;           // YYYY-MM-DD format
    
    @Schema(description = "Date when the tariff expires", example = "2025-12-31")
    private String expirationDate;          // YYYY-MM-DD format
}
