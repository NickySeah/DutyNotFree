package com.example.CSD.product;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ProductUpdateRequest {
    private String name;
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