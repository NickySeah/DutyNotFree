package com.example.CSD.test.wishlist;

import java.util.Arrays;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.CSD.wishlist.*;

@ExtendWith(MockitoExtension.class)
class WishlistControllerTest {
    private static final String BASE_URL = "/api/v1/wishlists";

    @Mock
    private WishlistService wishlistService;

    @InjectMocks
    private WishlistController wishlistController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("admin-test", "", "ROLE_admin"));
        mockMvc = MockMvcBuilders.standaloneSetup(wishlistController).build();
        objectMapper = new ObjectMapper();
    }

    @org.junit.jupiter.api.AfterEach
    void clearIdentity() { org.springframework.security.core.context.SecurityContextHolder.clearContext(); }

    @Test
    void userCannotReadAnotherWatchlist() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("owner", "", "ROLE_importer"));
        mockMvc.perform(get("/api/v1/wishlists").param("userId", "another-user")).andExpect(status().isForbidden());
        verify(wishlistService, never()).getWishlistsByUserId(anyString());
    }

    @Test
    void userCannotDeleteOutsideOwnWatchlist() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("owner", "", "ROLE_importer"));
        when(wishlistService.getWishlistsByUserId("owner")).thenReturn(java.util.List.of());
        mockMvc.perform(delete(BASE_URL + "/99")).andExpect(status().isForbidden());
        verify(wishlistService, never()).deleteWishlist(anyLong());
    }

    @Test
    void getWishlistsByUserId_ShouldReturnListOfItems() throws Exception {
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

        when(wishlistService.getWishlistsByUserId("user-1"))
                .thenReturn(Arrays.asList(w1, w2));

        mockMvc.perform(get(BASE_URL)
                        .param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].userId", is("user-1")))
                .andExpect(jsonPath("$[0].hsCode", is("847130")))
                .andExpect(jsonPath("$[1].hsCode", is("010190")));

        verify(wishlistService).getWishlistsByUserId("user-1");
    }

    @Test
    void addWishlistItem_ShouldReturnCreated_WhenServiceSucceeds() throws Exception {
        CreateWishlistDTO dto = new CreateWishlistDTO();
        dto.setUserId("user-1");
        dto.setHsCode("847130");
        dto.setExportingCountry("702");
        dto.setImportingCountry("840");

        Wishlist created = new Wishlist();
        created.setId(10L);
        created.setUserId(dto.getUserId());
        created.setHsCode(dto.getHsCode());
        created.setExportingCountry(dto.getExportingCountry());
        created.setImportingCountry(dto.getImportingCountry());

        when(wishlistService.createWishlist(any(CreateWishlistDTO.class)))
                .thenReturn(created);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.userId", is("user-1")))
                .andExpect(jsonPath("$.hsCode", is("847130")));

        verify(wishlistService).createWishlist(any(CreateWishlistDTO.class));
    }

    @Test
    void addWishlistItem_ShouldReturnBadRequest_WhenServiceThrowsIllegalState() throws Exception {
        CreateWishlistDTO dto = new CreateWishlistDTO();
        dto.setUserId("user-1");
        dto.setHsCode("847130");
        dto.setExportingCountry("702");
        dto.setImportingCountry("840");

        when(wishlistService.createWishlist(any(CreateWishlistDTO.class)))
                .thenThrow(new IllegalStateException("This item is already in your wishlist."));

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("This item is already in your wishlist."));

        verify(wishlistService).createWishlist(any(CreateWishlistDTO.class));
    }

    @Test
    void deleteWishlistItem_ShouldReturnOk_WhenServiceSucceeds() throws Exception {
        doNothing().when(wishlistService).deleteWishlist(5L);

        mockMvc.perform(delete(BASE_URL + "/{id}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Wishlist item deleted successfully.")));

        verify(wishlistService).deleteWishlist(5L);
    }

    @Test
    void deleteWishlistItem_ShouldReturnNotFound_WhenServiceThrowsIllegalState() throws Exception {
        doThrow(new IllegalStateException("Wishlist item with id 99 not found."))
                .when(wishlistService).deleteWishlist(99L);

        mockMvc.perform(delete(BASE_URL + "/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Wishlist item with id 99 not found."));

        verify(wishlistService).deleteWishlist(99L);
    }
}
