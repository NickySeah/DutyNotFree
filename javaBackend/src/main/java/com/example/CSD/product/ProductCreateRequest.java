package com.example.CSD.product;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ProductCreateRequest {
    @NotBlank(message = "Product must have a valid HS code")
    private String hsCode;

    @NotBlank(message = "Product must have a name")
    private String name;

    @NotBlank(message = "Product must belong to a user")
    private String userId;

    private Boolean isPrivate;
}