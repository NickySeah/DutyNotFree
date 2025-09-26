package com.example.CSD.hscode; 

import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import com.example.CSD.product.Product;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode 
public class HSCode {
    @Id
    @Column(length = 20)
    private String code;

    @NotNull //@Size(max = 200)
    private String description;

    @JsonIgnore private String uom;

    @OneToMany(mappedBy = "hsCode")
    @JsonIgnore  
    private Set<Product> products;
}
