package com.example.CSD.product;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ProductRequest {
    private String hsCode;
    private String name;
    private Integer userId;
    private Boolean isPrivate;      //= true;  // Default to true
}