package com.example.CSD.product.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.product.Product;
import com.example.CSD.product.ProductRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class ProductRepositoryTest {
  @Autowired
  private ProductRepository repo;

  @Autowired
  private HSCodeRepository hsCodeRepository;

  private HSCode testHsCode;

  @BeforeEach
  void setUp() {
    // Create and save HSCode first (required foreign key for Product)
    testHsCode = new HSCode();
    testHsCode.setCode("847130");
    testHsCode.setDescription("Test Description");
    hsCodeRepository.save(testHsCode);
  }

  @Test
  void saveProduct_ShouldPersistSuccessfully() {
    // Arrange: Create product with HSCode
    Product product = new Product();
    product.setHsCode(testHsCode);
    product.setName("Orange juice");
    product.setUserId("user67");
    product.setPrivate(false);
    
    // Act
    Product saved = repo.save(product);
    Optional<Product> found = repo.findById(saved.getId());
    
    // Assert
    assertTrue(found.isPresent());
    assertEquals("user67", found.get().getUserId());
    assertEquals("Orange juice", found.get().getName());
  }

  @Test
  void findById_ShouldReturnProduct_WhenExists() {
    // Arrange: Create and save product
    Product product = new Product();
    product.setHsCode(testHsCode);
    product.setName("Orange juice");
    product.setUserId("user67");
    product.setPrivate(false);
    Product saved = repo.save(product);
    
    // Act
    Optional<Product> found = repo.findById(saved.getId());

    // Assert
    assertTrue(found.isPresent());
    assertEquals("Orange juice", found.get().getName());
    assertEquals("user67", found.get().getUserId());
    assertEquals(testHsCode.getCode(), found.get().getHsCode().getCode());
  }

  @Test
  void findById_ShouldReturnEmpty_WhenNotExists() {
    // Act: Try to find non-existent product
    // Note: ProductRepository has custom findById(long) that returns List
    java.util.List<Product> found = repo.findById(999L);
    
    // Assert: Handle null or empty list
    assertTrue(found == null || found.isEmpty());
  }

  @Test
  void deleteProduct_ShouldRemoveProducts() {
    // Arrange: Create and save product
    Product product = new Product();
    product.setHsCode(testHsCode);
    product.setName("Orange juice");
    product.setUserId("user67");
    product.setPrivate(false);
    Product saved = repo.save(product);
    
    // Act: Delete the product
    repo.delete(saved);
    Optional<Product> found = repo.findById(saved.getId());
    
    // Assert
    assertFalse(found.isPresent());
    assertTrue(found.isEmpty());
  }

  @Test
  void updateProduct_ShouldUpdateFields_WhenExists() {
    // Arrange: Create and save initial product
    Product product = new Product();
    product.setHsCode(testHsCode);
    product.setName("Orange juice");
    product.setUserId("user67");
    product.setPrivate(false);
    Product saved = repo.save(product);
    Long productId = saved.getId();
    
    // Act: Update the product fields
    saved.setName("Apple juice");
    saved.setPrivate(true);
    Product updated = repo.save(saved);
    
    // Assert: Verify product was updated
    Optional<Product> found = repo.findById(productId);
    assertTrue(found.isPresent());
    assertEquals("Apple juice", found.get().getName());
    assertTrue(found.get().isPrivate());
    assertEquals(productId, found.get().getId()); // ID should remain the same
    assertEquals("user67", found.get().getUserId()); // User ID should remain unchanged
    assertEquals(testHsCode.getCode(), found.get().getHsCode().getCode()); // HS Code should remain unchanged
  }

}
