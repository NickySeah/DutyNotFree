package com.example.CSD.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    /**
     * Finds all wishlist items associated with a specific user.
     * This is for the "Get Wishlist by userID" feature.
     *
     * @param userId The ID of the user.
     * @return A list of wishlist items.
     */
    List<Wishlist> findByUserId(String userId);

    /**
     * Finds all wishlist items that match a specific tariff combination.
     * This is for the "Email Feature" to find all users to notify.
     *
     * @param hsCode The HS Code.
     * @param exportingCountry The exporting country code.
     * @param importingCountry The importing country code.
     * @return A list of matching wishlist items (and their owners).
     */
    List<Wishlist> findByHsCodeAndExportingCountryAndImportingCountry(String hsCode, String exportingCountry, String importingCountry);
}
