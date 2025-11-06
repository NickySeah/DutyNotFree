package com.example.CSD.tariff; 

import java.time.LocalDate;

import com.example.CSD.country.Country;
import com.example.CSD.hscode.HSCode;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Represents a tariff applied between countries for a specific HS code")
public class Tariff {  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier for the tariff", example = "1001")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hscode_code", nullable = false)
    @Schema(description = "HS code associated with the tariff")
    private HSCode hsCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origin_country_code", nullable = false)
    @Schema(description = "Country of origin for the tariff")
    private Country originCountry;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dest_country_code", nullable = false)
    @Schema(description = "Destination country for the tariff")
    private Country destCountry;

    @NotBlank @Column(length = 20) 
    @Schema(description = "Type of tariff applied", example = "Standard")
    private String tariffType;

    //TODO: maybe add tariff description later
    @Schema(description = "Standard rate percentage applied to the product", example = "7.5")
    private Double standardRate;

    @Schema(description = "Flat fee applied regardless of product value", example = "50.0")
    private Double flatFee;

    @NotNull 
    @Schema(description = "Date when the tariff becomes effective", example = "2025-01-01")
    private LocalDate effectiveDate;
    
    @Schema(description = "Date when the tariff expires", example = "2025-12-31")
    private LocalDate expirationDate;
} 
