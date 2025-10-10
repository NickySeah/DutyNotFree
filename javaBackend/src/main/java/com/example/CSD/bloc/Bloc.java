package com.example.CSD.bloc;

import java.util.HashSet;
import java.util.Set;

import com.example.CSD.country.Country;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
// @ToString
// @EqualsAndHashCode
@ToString(exclude = "memberCountries")
@EqualsAndHashCode(exclude = "memberCountries")
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents a group of countries")
public class Bloc {
    @Id
    @Schema(description = "Acronym/Code of the bloc", example = "ASEAN")
    private String code;  // Full bloc acronym/code

    @NotBlank
    @Schema(description = "Full name of the bloc", example = "Association of Southeast Asian Nations")
    private String name;  // Full bloc name

    @ManyToMany
    @JoinTable(
        name = "bloc_country",
        joinColumns = @JoinColumn(name = "bloc_code"),
        inverseJoinColumns = @JoinColumn(name = "country_code")
    )
    @Schema(hidden = true)
    private Set<Country> memberCountries = new HashSet<>();
}
