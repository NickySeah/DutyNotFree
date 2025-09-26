package com.example.CSD.product; 

// import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*; 
import jakarta.validation.constraints.*;
import lombok.*;

import com.example.CSD.hscode.HSCode;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hscode_code", nullable = false)
    // @JsonBackReference   
    private HSCode hsCode;

    @NotBlank @Column(length = 100)
    private String name;

    @NotBlank
    private String userId;

    private boolean isPrivate;
}
