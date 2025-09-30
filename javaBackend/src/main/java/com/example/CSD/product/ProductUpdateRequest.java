package com.example.CSD.product;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Product update request payload")
public class ProductUpdateRequest {
    @Schema(description = "Updated name of the product", example = "Gaming Laptop")
    private String name;
    @Schema(description = "Whether the product is private", example = "true")
    private Boolean isPrivate;
 
    @JsonIgnore private boolean nameProvided = false;           // Flags to indicate if a field was provided in the update request
    @JsonIgnore private boolean privateProvided = false;

    public void setName(String name) {
        this.name = name;
        this.nameProvided = true;
    }

    public void setPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
        this.privateProvided = true;
    }
}