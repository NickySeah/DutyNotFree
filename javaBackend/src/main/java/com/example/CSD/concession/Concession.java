package com.example.CSD.concession;

import com.example.CSD.fta.FTA;
import com.example.CSD.hscode.HSCode;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "fta")
@EqualsAndHashCode(exclude = "fta")
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Schema(description = "Represents special concessions of a FTA")
public class Concession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                                    // Bloc acronym/code

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    @JoinColumn(name = "fta_id", nullable = false)
    private FTA fta;                                    // one concession belongs to one FTA

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hscode_code", nullable = false)
    private HSCode hsCode;                              // one concession about one HSCode

    @NotNull
    private Double finalRate;
    
    // @NotNull
    // private Integer stagingDuration;                    // e.g., 0 = immediate, 3 = phased over 3 years
}