package com.example.CSD.country;

import java.util.Set;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.tariff.Tariff;
import com.example.CSD.tradeParty.TradeParty;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = {"originTariffs", "destTariffs", "blocs","tradeParty"})
@EqualsAndHashCode(exclude = {"originTariffs", "destTariffs", "blocs","tradeParty"})
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents a country with ISO codes and name")
public class Country {
    @Id
    @Schema(description = "3-digit ISO country code", example = "702")
    @Column(columnDefinition = "CHAR(3)")                   // Exactly 3 characters
    private String code;                                    // 3-digit country code

    @NotBlank
    @Schema(description = "Full name of the country", example = "Singapore")
    private String name;                                    // Full country name

    @NotBlank @Column(columnDefinition = "CHAR(3)")          // Exactly 3 characters
    @Schema(description = "Alpha-3 code of the country", example = "SGP")
    private String alpha3;                                  // 3-character country code 

    @OneToMany(mappedBy = "originCountry")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Tariff> originTariffs;                      // one country can have any number of tariff lines as origin country

    @OneToMany(mappedBy = "destCountry")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Tariff> destTariffs;                        // one country can have any number of tariff lines as destination country

    @ManyToMany(mappedBy = "memberCountries")               
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Bloc> blocs;                                // one country can belong to any number of blocs 

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "trade_party_id")
    @JsonIgnore
    @Schema(hidden = true)
    private TradeParty tradeParty;                          // for usage in FTA as party A & party B
}