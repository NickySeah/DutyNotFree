package com.example.CSD.hscode; 

import java.util.Set;

import com.example.CSD.product.Product;
import com.example.CSD.fta.FTA;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString(exclude = {"products","excludedFromFTA"})
@EqualsAndHashCode(exclude = {"products","excludedFromFTA"})
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Represents a Harmonized System (HS) code used for product classification")
public class HSCode {
    @Id
    @Column(length = 20)
    @Schema(description = "HS code identifier", example = "847130")
    private String code;

    @NotNull //@Size(max = 200)
    @Schema(description = "Description of the HS code", example = "Portable automatic data processing machines")
    private String description;

    @JsonIgnore private String uom;

    @OneToMany(mappedBy = "hsCode")
    @JsonIgnore  
    @Schema(hidden = true)
    private Set<Product> products;      // one hscode can belong to any number of products
    
    @ManyToMany(mappedBy = "excludedHsCodes")               
    @JsonIgnore
    @Schema(hidden = true)
    private Set<FTA> excludedFromFTA;            // one country can belong to any number of blocs 
}
