package com.example.CSD.wishlist;

import java.util.List;

/**
 * Interface for the Wishlist service.
 * Defines all public-facing business logic for managing wishlists.
 */
public interface WishlistService {

    /**
     * Retrieves all wishlist items for a specific user.
     * @param userId The ID of the user.
     * @return A list of wishlist items.
     */
    List<Wishlist> getWishlistsByUserId(String userId);

    /**
     * Creates a new wishlist item.
     * @param dto The DTO containing data for the new item.
     * @return The created Wishlist entity.
     * @throws IllegalStateException if the item already exists.
     */
    Wishlist createWishlist(CreateWishlistDTO dto);

    /**
     * Deletes a wishlist item by its ID.
     * @param id The ID of the wishlist item to delete.
     * @throws IllegalStateException if the item is not found.
     */
    void deleteWishlist(Long id);

    /**
     * Finds all wishlist items that match a given tariff's criteria.
     * Used for sending email notifications.
     * @param hsCode The HS code.
     * @param exportingCountry The origin country code.
     * @param importingCountry The destination country code.
     * @return A list of matching wishlist items.
     */
    List<Wishlist> findMatchingWishlists(String hsCode, String exportingCountry, String importingCountry);
}

