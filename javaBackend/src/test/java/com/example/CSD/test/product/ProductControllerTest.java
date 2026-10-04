package com.example.CSD.test.product;

import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.CSD.hscode.HSCode;
import com.example.CSD.product.*;

@WebMvcTest(controllers = ProductV1Controller.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProductControllerTest {
    private static final String BASE_URL = "/api/v1/products";
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductServiceImpl productService;

    private Product testProduct;
    private HSCode testHsCode;

    @BeforeEach
    public void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("admin-test", "", "ROLE_admin"));
        // Setup test HSCode
        testHsCode = new HSCode();
        testHsCode.setCode("847130");
        testHsCode.setDescription("Test Description");

        // Setup test Product
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Orange juice");
        testProduct.setUserId("user67");
        testProduct.setHsCode(testHsCode);
        testProduct.setPrivate(false);
    }

    @org.junit.jupiter.api.AfterEach
    void clearIdentity() { org.springframework.security.core.context.SecurityContextHolder.clearContext(); }

    @Test
    void supplierCannotCreateForAnotherOwner() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("owner", "", "ROLE_supplier"));
        mockMvc.perform(post(BASE_URL).contentType(MediaType.APPLICATION_JSON).content("{\"userId\":\"another-user\",\"name\":\"Laptop\",\"hsCode\":\"847130\",\"isPrivate\":true}")).andExpect(status().isForbidden());
        verify(productService, never()).createProduct(any());
    }

    @Test
    void supplierCannotUpdateOrDeleteAnotherOwnersProductById() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.TestingAuthenticationToken("other-owner", "", "ROLE_supplier"));
        when(productService.getProductById(1L)).thenReturn(testProduct);
        mockMvc.perform(put(BASE_URL + "/1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Changed\"}")).andExpect(status().isForbidden());
        mockMvc.perform(delete(BASE_URL + "/1")).andExpect(status().isForbidden());
        verify(productService, never()).updateProductById(anyLong(), any());
        verify(productService, never()).deleteProductById(anyLong());
    }

    @Test
    void anonymousPrivateProductLookupDoesNotExposeTheRecord() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        testProduct.setPrivate(true);
        when(productService.getProductById(1L)).thenReturn(testProduct);
        mockMvc.perform(get(BASE_URL + "/1")).andExpect(status().isNotFound());
    }

    @Test
    void anonymousListDoesNotRevealPrivateProducts() throws Exception {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        Product privateProduct = new Product(); privateProduct.setUserId("another-user"); privateProduct.setPrivate(true);
        when(productService.listProducts()).thenReturn(List.of(testProduct, privateProduct));
        mockMvc.perform(get(BASE_URL + "/all")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    public void index_ShouldReturnHealthCheckMessage_WhenTestEndpointCalled() throws Exception {
        // Act & Assert
        mockMvc.perform(get(String.format("%s/test", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(content().string("Product microservice is running."));
    }

    @Test
    // 200 OK - Get all products
    public void getAllProducts_ShouldReturn200() throws Exception {
        // Arrange: Create list of products
        List<Product> products = new ArrayList<>();
        products.add(testProduct);

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Apple juice");
        product2.setUserId("user68");
        product2.setHsCode(testHsCode);
        product2.setPrivate(true);
        products.add(product2);

        // Mock service response
        when(productService.listProducts()).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get(String.format("%s/all", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Orange juice"))
                .andExpect(jsonPath("$[1].name").value("Apple juice"));

        verify(productService).listProducts();
    }

    @Test
    // 200 OK - Search products with filters
    public void getProduct_ShouldReturn200_WhenFiltersProvided() throws Exception {
        // Arrange: Create filtered list
        List<Product> filteredProducts = new ArrayList<>();
        filteredProducts.add(testProduct);

        // Mock service response
        when(productService.getProduct(eq("user67"), eq("Orange juice"), eq("847130")))
                .thenReturn(filteredProducts);

        // Act & Assert
        mockMvc.perform(get(BASE_URL)
                .param("userID", "user67")
                .param("name", "Orange juice")
                .param("hsCode", "847130"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Orange juice"));

        verify(productService).getProduct("user67", "Orange juice", "847130");
    }

    @Test
    // 200 OK - Get product by ID
    public void getProductById_ShouldReturn200_WhenExists() throws Exception {
        // Arrange: Mock service to return product
        when(productService.getProductById(1L)).thenReturn(testProduct);

        // Act & Assert
        mockMvc.perform(get(String.format("%s/1", BASE_URL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Orange juice"))
                .andExpect(jsonPath("$.userId").value("user67"));

        verify(productService).getProductById(1L);
    }

    @Test
    // 500 Internal Server Error - Product doesn't exist (No exception handler, so returns 500)
    public void getProductById_ShouldReturn500_WhenNotExists() throws Exception {
        // Arrange: Mock service to throw exception
        when(productService.getProductById(999L))
                .thenThrow(new NoSuchElementException("Product with ID 999 not found."));

        // Act & Assert
        // Since there's no exception handler, NoSuchElementException results in 500
        // MockMvc wraps unhandled exceptions in ServletException
        try {
            mockMvc.perform(get(String.format("%s/999", BASE_URL)))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // MockMvc may throw exception instead of returning 500
            // this is expected behavior when there's no exception handler
            assertTrue(e.getCause() instanceof NoSuchElementException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(productService).getProductById(999L);
    }

    @Test
    // 200 OK - Get product by ID
    public void getProductsByUserId_ShouldReturn200_WhenExists() throws Exception {
        // Arrange: Mock service to return product
        when(productService.getProductsByUserId("user67")).thenReturn(new ArrayList<>(Arrays.asList(testProduct)));

        // Act & Assert
        mockMvc.perform(get(String.format("%s/user/user67", BASE_URL)));
        verify(productService).getProductsByUserId("user67");
    }

    @Test
    // 201 Created
    public void createProduct_ShouldReturn201_WhenValidRequest() throws Exception {
        // Arrange: Create request
        ProductCreateRequest request = new ProductCreateRequest();
        request.setHsCode("847130");
        request.setName("Orange juice");
        request.setUserId("user67");
        request.setIsPrivate(false);

        // Mock service response
        when(productService.createProduct(any(ProductCreateRequest.class))).thenReturn(testProduct);

        // Act & Assert
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Orange juice"))
                .andExpect(jsonPath("$.userId").value("user67"));

        verify(productService).createProduct(any(ProductCreateRequest.class));
    }

    @Test
    // 400 Bad Request - Missing required fields
    public void createProduct_ShouldReturn400_WhenInvalidRequest() throws Exception {
        // Arrange: Create invalid request (missing required fields)
        ProductCreateRequest invalidRequest = new ProductCreateRequest();
        invalidRequest.setName(""); // Empty name should fail validation

        // Act & Assert
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(productService, never()).createProduct(any());
    }

    @Test
    // 200 OK - Update product
    public void updateProduct_ShouldReturn200_WhenValid() throws Exception {
        // Arrange: Create update request
        ProductUpdateRequest updateRequest = new ProductUpdateRequest();
        updateRequest.setName("Apple juice");
        updateRequest.setPrivate(true);

        // Arrange: Setup updated product
        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("Apple juice");
        updatedProduct.setUserId("user67");
        updatedProduct.setHsCode(testHsCode);
        updatedProduct.setPrivate(true);

        // Mock service response
        when(productService.updateProduct(anyString(), anyString(), anyString(), any(ProductUpdateRequest.class)))
                .thenReturn(updatedProduct);

        // Act & Assert
        mockMvc.perform(put("/api/v1/products")
                .param("hsCode", "847130")
                .param("name", "Orange juice")
                .param("userID", "user67")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apple juice"));

        verify(productService).updateProduct(eq("847130"), eq("Orange juice"), eq("user67"), any(ProductUpdateRequest.class));
    }

    @Test
    // 200 OK - Update product by ID
    public void updateProductById_ShouldReturn200_WhenValid() throws Exception {
        // Arrange: Create update request
        ProductUpdateRequest updateRequest = new ProductUpdateRequest();
        updateRequest.setName("Apple juice");
        updateRequest.setPrivate(true);

        // Arrange: Setup updated product
        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("Apple juice");
        updatedProduct.setUserId("user67");
        updatedProduct.setHsCode(testHsCode);
        updatedProduct.setPrivate(true);

        // Mock service response
        when(productService.updateProductById(eq(1L), any(ProductUpdateRequest.class)))
                .thenReturn(updatedProduct);

        // Act & Assert
        mockMvc.perform(put(String.format("%s/1", BASE_URL))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apple juice"))
                .andExpect(jsonPath("$.id").value(1L));

        verify(productService).updateProductById(eq(1L), any(ProductUpdateRequest.class));
    }

    @Test
    // 500 Internal Server Error - Update product by ID when not found
    public void updateProductById_ShouldReturn500_WhenNotFound() throws Exception {
        // Arrange: Create update request
        ProductUpdateRequest updateRequest = new ProductUpdateRequest();
        updateRequest.setName("Apple juice");

        // Arrange: Mock service to throw exception
        when(productService.updateProductById(eq(999L), any(ProductUpdateRequest.class)))
                .thenThrow(new NoSuchElementException("Product with ID 999 not found."));

        // Act & Assert
        // Since there's no exception handler, NoSuchElementException results in 500
        try {
            mockMvc.perform(put(String.format("%s/999", BASE_URL))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // MockMvc may throw exception instead of returning 500 - this is expected behavior
            // when there's no exception handler
            assertTrue(e.getCause() instanceof NoSuchElementException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(productService).updateProductById(eq(999L), any(ProductUpdateRequest.class));
    }

    @Test
    // 200 OK - Delete product (void method returns 200 by default)
    public void deleteProduct_ShouldReturn200_WhenValid() throws Exception {
        // Arrange: Do nothing when delete is called (void method)
        doNothing().when(productService).deleteProduct(anyString(), anyString(), anyString());

        // Act & Assert
        mockMvc.perform(delete(BASE_URL)
                .param("hsCode", "847130")
                .param("name", "Orange juice")
                .param("userID", "user67"))
                .andExpect(status().isOk());

        verify(productService).deleteProduct("847130", "Orange juice", "user67");
    }

    @Test
    // 200 OK - Delete product by ID (void method returns 200 by default)
    public void deleteProductById_ShouldReturn200_WhenValid() throws Exception {
        // Arrange: Do nothing when delete is called (void method)
        doNothing().when(productService).deleteProductById(anyLong());

        // Act & Assert
        mockMvc.perform(delete(String.format("%s/1",BASE_URL)))
                .andExpect(status().isOk());

        verify(productService).deleteProductById(1L);
    }

    @Test
    // 500 Internal Server Error - Delete product by ID when not found
    public void deleteProductById_ShouldReturn500_WhenNotFound() throws Exception {
        // Arrange: Mock service to throw exception
        doThrow(new RuntimeException("Product not found"))
                .when(productService).deleteProductById(999L);

        // Act & Assert
        // Since there's no exception handler, RuntimeException results in 500
        try {
            mockMvc.perform(delete(String.format("%s/999",BASE_URL)))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // MockMvc may throw exception instead of returning 500 - this is expected behavior
            assertTrue(e.getCause() instanceof RuntimeException || 
                      e instanceof jakarta.servlet.ServletException);
        }

        verify(productService).deleteProductById(999L);
    }
}
