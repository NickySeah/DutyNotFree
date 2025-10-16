package com.example.CSD.tradeParty;

import java.util.HashSet;
import java.util.Set;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.country.Country;
import com.example.CSD.fta.FTA;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = {"ftasAsPartyA","ftasAsPartyB"})
@EqualsAndHashCode(exclude = {"ftasAsPartyA","ftasAsPartyB"})
@AllArgsConstructor
@NoArgsConstructor
@Entity
// @Schema(description = "Represents a group of countries")
public class TradeParty {
    public enum PartyType {
        COUNTRY,
        BLOC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PartyType type; // COUNTRY or BLOC

    @OneToOne(mappedBy = "tradeParty", fetch = FetchType.LAZY)
    private Country country;

    @OneToOne(mappedBy = "tradeParty", fetch = FetchType.LAZY)
    private Bloc bloc; 

    @OneToMany(mappedBy = "partyA")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<FTA> ftasAsPartyA = new HashSet<>();

    @OneToMany(mappedBy = "partyB")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<FTA> ftasAsPartyB = new HashSet<>();

    // private Set<FTA> getAllFTAs() {
    //     Set<FTA> ftas = new HashSet<>();
    //     ftas.addAll(ftasAsPartyA);
    //     ftas.addAll(ftasAsPartyB);
    //     return ftas;
    // }
}
