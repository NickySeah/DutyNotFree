package com.example.CSD.wishlist;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Represents a user's wishlist item for a specific tariff combination")
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "hsCode", "exportingCountry", "importingCountry"})
})
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier for the wishlist item", example = "1")
    private Long id;

    @NotBlank
    @Column(length = 36)
    @Schema(description = "User ID who owns this wishlist item", example = "user-uuid-12345")
    private String userId;

    @NotBlank
    @Column(length = 20) // Adjust length as needed for your HS Codes
    @Schema(description = "HS code to watch", example = "8517.12")
    private String hsCode;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(length = 3)
    @Schema(description = "Exporting country (ISO 3-letter code)", example = "CN")
    private String exportingCountry;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(length = 3)
    @Schema(description = "Importing country (ISO 3-letter code)", example = "US")
    private String importingCountry;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    @Schema(description = "Timestamp when the item was added")
    private LocalDateTime createdAt;
}
