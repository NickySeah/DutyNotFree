package com.example.CSD.wishlist;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateWishlistDTO {

    @NotBlank
    @Schema(description = "User ID to associate this item with", example = "LCfLPP2Xs5sPHWUKYYwtCxG03A1DKhgQ")
    private String userId;

    @NotBlank
    @Schema(description = "HS code to watch", example = "847130")
    private String hsCode;

    @NotBlank
    @Size(min = 3, max = 3)
    @Schema(description = "Exporting country (ISO 3-letter code)", example = "702")
    private String exportingCountry;

    @NotBlank
    @Size(min = 3, max = 3)
    @Schema(description = "Importing country (ISO 3-letter code)", example = "702")
    private String importingCountry;
}
