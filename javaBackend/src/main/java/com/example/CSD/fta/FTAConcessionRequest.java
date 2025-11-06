package com.example.CSD.fta;

import io.swagger.v3.oas.annotations.media.Schema;
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
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Request payload for creating a new special concession for a FTA")
public class FTAConcessionRequest {  // Not an entity, just a data carrier which this concession belongs
    @NotBlank(message = "HS Code must be provided")
    @Schema(description = "HS Code specified in the Special Concession", example = "01012100")
    private String hsCode;                  // HS Code for which the concession is defined

    @NotNull(message = "Final rate must be provided")
    @Schema(description = "Final reduced rate", example = "5.0")
    private Double finalRate;               // Final concession rate

    // @NotNull(message = "Staging duration must be provided")
    // @Schema(description = "The time period which rate is reduced", example = "3")
    // private Integer stagingDuration;        // Staging duration in years
}