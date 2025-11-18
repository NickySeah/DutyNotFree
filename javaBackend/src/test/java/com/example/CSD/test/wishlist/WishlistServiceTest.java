package com.example.CSD.test.wishlist;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.CSD.wishlist.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @InjectMocks
    private WishlistServiceImpl wishlistService;

    @Test
    void getWishlistsByUserId_ShouldReturnItemsFromRepository() {
        Wishlist w1 = new Wishlist();
        w1.setId(1L);
        w1.setUserId("user-1");
        w1.setHsCode("847130");
        w1.setExportingCountry("702");
        w1.setImportingCountry("840");

        Wishlist w2 = new Wishlist();
        w2.setId(2L);
        w2.setUserId("user-1");
        w2.setHsCode("010190");
        w2.setExportingCountry("702");
        w2.setImportingCountry("156");

        when(wishlistRepository.findByUserId("user-1"))
                .thenReturn(Arrays.asList(w1, w2));

        List<Wishlist> result = wishlistService.getWishlistsByUserId("user-1");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("847130", result.get(0).getHsCode());
        verify(wishlistRepository).findByUserId("user-1");
    }

    @Test
    void createWishlist_ShouldSaveAndReturnWishlist_WhenValid() {
        CreateWishlistDTO dto = new CreateWishlistDTO();
        dto.setUserId("user-1");
        dto.setHsCode("847130");
        dto.setExportingCountry("702");
        dto.setImportingCountry("840");

        Wishlist saved = new Wishlist();
        saved.setId(10L);
        saved.setUserId(dto.getUserId());
        saved.setHsCode(dto.getHsCode());
        saved.setExportingCountry(dto.getExportingCountry());
        saved.setImportingCountry(dto.getImportingCountry());

        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(saved);

        Wishlist result = wishlistService.createWishlist(dto);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("user-1", result.getUserId());
        assertEquals("847130", result.getHsCode());
        verify(wishlistRepository).save(any(Wishlist.class));
    }

    @Test
    void createWishlist_ShouldThrowIllegalStateException_WhenDuplicateConstraintViolation() {
        CreateWishlistDTO dto = new CreateWishlistDTO();
        dto.setUserId("user-1");
        dto.setHsCode("847130");
        dto.setExportingCountry("702");
        dto.setImportingCountry("840");

        when(wishlistRepository.save(any(Wishlist.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> wishlistService.createWishlist(dto));

        assertTrue(ex.getMessage().contains("already in your wishlist"));
        verify(wishlistRepository).save(any(Wishlist.class));
    }

    @Test
    void deleteWishlist_ShouldDelete_WhenItemExists() {
        when(wishlistRepository.existsById(5L)).thenReturn(true);

        wishlistService.deleteWishlist(5L);

        verify(wishlistRepository).existsById(5L);
        verify(wishlistRepository).deleteById(5L);
    }

    @Test
    void deleteWishlist_ShouldThrowIllegalStateException_WhenItemDoesNotExist() {
        when(wishlistRepository.existsById(99L)).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> wishlistService.deleteWishlist(99L));

        assertTrue(ex.getMessage().contains("Wishlist item with id 99 not found"));
        verify(wishlistRepository).existsById(99L);
        verify(wishlistRepository, never()).deleteById(anyLong());
    }

    @Test
    void findMatchingWishlists_ShouldDelegateToRepository() {
        Wishlist w = new Wishlist();
        w.setId(1L);
        w.setUserId("user-1");
        w.setHsCode("847130");
        w.setExportingCountry("702");
        w.setImportingCountry("840");

        when(wishlistRepository.findByHsCodeAndExportingCountryAndImportingCountry(
                "847130", "702", "840"))
                .thenReturn(Collections.singletonList(w));

        List<Wishlist> result = wishlistService.findMatchingWishlists("847130", "702", "840");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("user-1", result.get(0).getUserId());
        verify(wishlistRepository).findByHsCodeAndExportingCountryAndImportingCountry(
                "847130", "702", "840");
    }
}