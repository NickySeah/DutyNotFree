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
    // @Column(name = "product_id")    // maps to column product_id in db
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

    @NotNull @Column(length = 20) 
    private String tariffType;

    private Double standardRate;
    private Double flatFee;
    private LocalDate startDate;
    private LocalDate endDate;
} 
