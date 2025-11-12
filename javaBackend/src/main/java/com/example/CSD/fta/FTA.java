package com.example.CSD.fta;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.CSD.concession.Concession;
import com.example.CSD.hscode.HSCode;
import com.example.CSD.tradeParty.TradeParty;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents a group of free trade agreements")
public class FTA {
    public enum FTAType {
        BILATERAL,
        PLURILATERAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;    // TODO: simple implmnt; review validation needed 

    @Enumerated(EnumType.STRING)
    private FTAType type; // BILATERAL (country-country) or PLURILATERAL (country-bloc/bloc-bloc) 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ftasAsPartyA_id", nullable = false)
    @Schema(description = "1st party in the FTA")
    private TradeParty partyA;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ftasAsPartyB_id", nullable = false)
    @Schema(description = "2nd part in the FTA")
    private TradeParty partyB;

    // private LocalDate signedDate;
    @NotNull 
    @Schema(description = "Date when the FTA becomes effective", example = "2025-01-01")
    private LocalDate effectiveDate;

    @Schema(description = "Date when the FTA expires", example = "2025-12-31")
    private LocalDate expirationDate;

    @Schema(description = "Default ad valorem rate unless specified otherwise", example = "7.5")
    private Double defaultRate;

    @ManyToMany // many-to-many requires new table
    @JoinTable(
        name = "fta_excluded_hscode",
        joinColumns = @JoinColumn(name = "fta_id"),         
        inverseJoinColumns = @JoinColumn(name = "hscode_code")
    )
    // @Schema(hidden = true)
    private Set<HSCode> excludedHsCodes = new LinkedHashSet<>();

    @OneToMany(mappedBy = "fta", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Concession> specialConcessions = new HashSet<>();

    @JsonIgnore
    public Set<HSCode> getAllSpecialHsCodes() {
        return specialConcessions.stream()
        .map(Concession :: getHsCode).collect(Collectors.toSet());
    }
}
