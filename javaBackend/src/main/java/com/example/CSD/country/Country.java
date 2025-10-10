package com.example.CSD.country;

import java.util.HashSet;
import java.util.Set;

import com.example.CSD.bloc.Bloc;
import com.example.CSD.tariff.Tariff;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
// @ToString
// @EqualsAndHashCode
@ToString(exclude = {"originTariffs", "destTariffs", "blocs"})
@EqualsAndHashCode(exclude = {"originTariffs", "destTariffs", "blocs"})
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents a country with ISO codes and name")
public class Country {
    @Id
    @Schema(description = "3-digit ISO country code", example = "702")
    @Column(columnDefinition = "CHAR(3)") // Exactly 3 characters
    private String code;  // 3-digit country code

    @NotNull
    @Schema(description = "Full name of the country", example = "Singapore")
    private String name;  // Full country name

    @NotNull @Column(columnDefinition = "CHAR(3)") // Exactly 3 characters
    @Schema(description = "Alpha-3 code of the country", example = "SGP")
    private String alpha3; 

    @OneToMany(mappedBy = "originCountry")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Tariff> originTariffs;

    @OneToMany(mappedBy = "destCountry")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Tariff> destTariffs;

    @ManyToMany(mappedBy = "memberCountries")
    @JsonIgnore
    @Schema(hidden = true)
    private Set<Bloc> blocs = new HashSet<>();
}
