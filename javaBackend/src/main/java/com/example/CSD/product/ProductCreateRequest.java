package com.example.CSD.product;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Product creation request payload")
public class ProductCreateRequest {
    @NotBlank(message = "Product must have a valid HS code")
    @Schema(description = "HS code for the product", example = "847130")
    private String hsCode;

    @NotBlank(message = "Product must have a name")
    @Schema(description = "Name of the product", example = "Laptop")
    private String name;

    @NotBlank(message = "Product must belong to a user")
    @Schema(description = "User ID associated with the product", example = "42")
    private String userId;

    @Schema(description = "Whether the product is private", example = "true")
    private Boolean isPrivate;
}