package com.example.CSD.bloc;

import java.util.LinkedHashSet;
import java.util.Set;

import com.example.CSD.country.Country;
import com.example.CSD.tradeParty.TradeParty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = {"memberCountries","tradeParty"})       // to prevent error due to circular referencing 
@EqualsAndHashCode(exclude = {"memberCountries","tradeParty"})
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents a group of countries")
public class Bloc {
    @Id
    @Schema(description = "Acronym or code of the bloc", example = "ASEAN")
    private String code;                                    // Bloc acronym/code

    @NotBlank
    @Schema(description = "Full name of the bloc", example = "Association of Southeast Asian Nations")
    private String name;                                    // Full bloc name

    @ManyToMany // many-to-many requires new table
    @JoinTable(
        name = "bloc_country",
        joinColumns = @JoinColumn(name = "bloc_code"),
        inverseJoinColumns = @JoinColumn(name = "country_code")
    )
    @OrderBy("name ASC")
    @Schema(hidden = true)
    private Set<Country> memberCountries = new LinkedHashSet<>(); // one bloc have many members (countries)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_party_id", insertable = false, updatable = false)
    @JsonIgnore
    @Schema(hidden = true)
    private TradeParty tradeParty;                          // for usage in FTA as party A & party B
}
