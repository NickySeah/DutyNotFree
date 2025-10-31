package com.example.CSD.wishlist;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishlists")
@Tag(name = "Wishlist API", description = "Manages user wishlist items")
public class WishlistController {

    private final WishlistService wishlistService;

    @Autowired
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @Operation(summary = "Get all wishlist items for a user")
    @ApiResponse(responseCode = "200", description = "List of wishlist items")
    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlistsByUserId(@RequestParam String userId) {
        List<Wishlist> items = wishlistService.getWishlistsByUserId(userId);
        return ResponseEntity.ok(items);
    }

    @Operation(summary = "Add a new item to the wishlist")
    @ApiResponse(responseCode = "201", description = "Item created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data or duplicate item")
    @PostMapping
    public ResponseEntity<?> addWishlistItem(@Valid @RequestBody CreateWishlistDTO dto) {
        try {
            Wishlist createdItem = wishlistService.createWishlist(dto);
            return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // This now catches the "duplicate item" exception from the service
            // and returns a clean 400 Bad Request with the error message.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Delete a wishlist item by its ID")
    @ApiResponse(responseCode = "200", description = "Item deleted successfully")
    @ApiResponse(responseCode = "404", description = "Item not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWishlistItem(@PathVariable Long id) {
        try {
            // The service throws an IllegalStateException if not found
            wishlistService.deleteWishlist(id);
            // Return 200 OK with a success message
            return ResponseEntity.ok(Map.of("message", "Wishlist item deleted successfully."));
        } catch (IllegalStateException e) {
            // This catches the "not found" exception and returns a 404
            // with the error message from the service.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

