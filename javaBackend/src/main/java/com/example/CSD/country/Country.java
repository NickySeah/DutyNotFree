package com.example.CSD.country;

import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore; 
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import com.example.CSD.tariff.Tariff;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Entity
public class Country {
    @Id
    private String code;  // 3-letter country code

    @NotNull
    private String name;  // Full country name

    @NotNull @Column(length = 3)
    private String alpha3; 

    @OneToMany(mappedBy = "originCountry")
    @JsonIgnore
    private Set<Tariff> originTariffs;

    @OneToMany(mappedBy = "destCountry")
    @JsonIgnore
    private Set<Tariff> destTariffs;
}
