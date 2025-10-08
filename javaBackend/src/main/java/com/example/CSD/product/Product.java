package com.example.CSD.product; 

// import com.fasterxml.jackson.annotation.JsonBackReference;
import com.example.CSD.hscode.HSCode;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Represents a product entity stored in the database")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier for the product", example = "101")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hscode_code", nullable = false)
    // @JsonBackReference   
    @Schema(description = "HS code associated with the product")
    private HSCode hsCode;

    @NotBlank @Column(length = 100)
    @Schema(description = "Name of the product", example = "Laptop")
    private String name;

    @Column(length = 36)
    @NotBlank
    @Schema(description = "User ID who owns or created the product", example = "user42")
    private String userId;

    @Schema(description = "Indicates whether the product is private", example = "true")
    private boolean isPrivate;
}
