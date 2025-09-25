package com.example.CSD.tariff; 

import java.time.LocalDate;
// import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

// import com.example.CSD.product.*;
import com.example.CSD.hscode.*;
import com.example.CSD.country.*;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Tariff {  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hscode_code", nullable = false)
    // @JsonBackReference   
    private HSCode hsCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origin_country_code", nullable = false)
    private Country originCountry;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dest_country_code", nullable = false)
    private Country destCountry;

    @NotBlank @Column(length = 20) 
    private String tariffType;

    //TODO: maybe add tariff description later

    private Double standardRate;
    private Double flatFee;
    @NotNull private LocalDate effectiveDate;
    private LocalDate expirationDate;
} 
