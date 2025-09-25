package com.example.CSD.product;

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

    private boolean nameProvided = false;           // Flags to indicate if a field was provided in the update request
    private boolean privateProvided = false;

    public void setName(String name) {
        this.name = name;
        this.nameProvided = true;
    }

    public void setPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
        this.privateProvided = true;
    }
}