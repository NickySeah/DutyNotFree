package com.example.CSD.wishlist;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService{

    private WishlistRepository wishlistRepository;

    @Autowired
    public WishlistServiceImpl(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    /**
     * Gets all wishlist items for a specific user.
     *
     * @param userId The user's ID.
     * @return A list of their wishlist items.
     */
    public List<Wishlist> getWishlistsByUserId(String userId) {
        return wishlistRepository.findByUserId(userId);
    }

    /**
     * Creates a new wishlist item.
     *
     * @param dto The DTO containing item details.
     * @return The saved Wishlist entity.
     * @throws DataIntegrityViolationException if a duplicate item (same user, hsCode, countries) exists.
     */
    public Wishlist createWishlist(CreateWishlistDTO dto) {
        Wishlist newWishlist = new Wishlist();
        newWishlist.setUserId(dto.getUserId());
        newWishlist.setHsCode(dto.getHsCode());
        newWishlist.setExportingCountry(dto.getExportingCountry());
        newWishlist.setImportingCountry(dto.getImportingCountry());
        
        // The @CreationTimestamp will automatically set createdAt
        
        try {
            return wishlistRepository.save(newWishlist);
        } catch (DataIntegrityViolationException e) {
            // This is how you handle the unique constraint violation
            throw new IllegalStateException("This item is already in your wishlist.", e);
        }
    }

    /**
     * Deletes a wishlist item by its unique ID.
     *
     * @param id The ID of the wishlist item to delete.
     */
    public void deleteWishlist(Long id) {
        if (!wishlistRepository.existsById(id)) {
            // You can create a custom exception here
            throw new IllegalStateException("Wishlist item with id " + id + " not found.");
        }
        wishlistRepository.deleteById(id);
    }

    /**
     * Finds all wishlist entries matching a tariff.
     * This method will be called by your TariffService (or similar) when a tariff changes.
     *
     * @param hsCode HS Code of the changed tariff.
     * @param exportingCountry Exporting country of the changed tariff.
     * @param importingCountry Importing country of the changed tariff.
     * @return List of Wishlist items to notify.
     */
    public List<Wishlist> findMatchingWishlists(String hsCode, String exportingCountry, String importingCountry) {
        return wishlistRepository.findByHsCodeAndExportingCountryAndImportingCountry(hsCode, exportingCountry, importingCountry);
    }
}
