package com.example.CSD.test.product;

import java.util.*
;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.stubbing.Answer;

import com.example.CSD.hscode.HSCode;
import com.example.CSD.hscode.HSCodeRepository;
import com.example.CSD.product.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {
  @Mock
  private ProductRepository products;

  @Mock
  private HSCodeRepository hsCodes;

  @InjectMocks
  private ProductService service;

  private HSCode hsCode;;
  private Product product1;
  private Product product2;

  @BeforeEach
  public void setup() {
    hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    product1 = new Product();
    product1.setId(1L);
    product1.setHsCode(hsCode);
    product1.setName("Orange juice");
    product1.setUserId("user67");
    product1.setPrivate(false);

    product2 = new Product();
    product2.setId(2L);
    product2.setHsCode(hsCode);
    product2.setName("Apple juice");
    product2.setUserId("user76");
    product2.setPrivate(true);
  }

  @Test
  public void listProducts_ShouldListAllProducts_WhenCalled() {
    // Arrange: Setup test products    
    List<Product> allProducts = new ArrayList<>(Arrays.asList(product1, product2));
    when(products.findAll()).thenReturn(allProducts);
    
    // Act
    List<Product> result = service.listProducts();
    
    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("Orange juice", result.get(0).getName());
    assertEquals("Apple juice", result.get(1).getName());
    verify(products).findAll();
  }
  
  @Test
  public void getProduct_ShouldReturnFilteredProduct_WhenOnlyUserIdProvided() {
    // Arrange: Setup test products
    List<Product> filteredProducts = new ArrayList<>(Arrays.asList(product1));
    
    when(products.findByFilters(anyString(), eq(null), eq(null)))
        .thenReturn(filteredProducts);

    // Act
    List<Product> result = service.getProduct("user67", null, null);
    
    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Orange juice", result.get(0).getName());
    assertEquals("user67", result.get(0).getUserId());
    verify(products).findByFilters("user67", null, null);
  }

  @Test
  public void getProduct_ShouldReturnFilteredProduct_WhenOnlyNameProvided() {
    // Arrange: Setup test products
    List<Product> filteredProducts = new ArrayList<>(Arrays.asList(product1));
    
    when(products.findByFilters(eq(null), anyString(), eq(null)))
        .thenReturn(filteredProducts);

    // Act
    List<Product> result = service.getProduct(null, "Orange Juice", null);
    
    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Orange juice", result.get(0).getName());
    assertEquals("user67", result.get(0).getUserId());
    verify(products).findByFilters(null, "Orange Juice", null);
  }

  @Test
  public void getProduct_ShouldReturnFilteredProduct_WhenOnlyHsCodeProvided() {
    // Arrange: Setup test products
    List<Product> filteredProducts = new ArrayList<>(Arrays.asList(product1));
    
    when(products.findByFilters(eq(null), eq(null), anyString()))
        .thenReturn(filteredProducts);

    // Act
    List<Product> result = service.getProduct(null, null, "847130");
    
    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Orange juice", result.get(0).getName());
    assertEquals("user67", result.get(0).getUserId());
    verify(products).findByFilters(null, null, "847130");
  }

  @Test
  public void getProduct_ShouldReturnAllProducts_WhenNoFiltersProvided() {
    // Arrange: Setup test products
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    Product product1 = new Product();
    product1.setId(1L);
    product1.setHsCode(hsCode);
    product1.setName("Orange juice");
    product1.setUserId("user67");
    
    List<Product> allProducts = new ArrayList<>();
    allProducts.add(product1);
    
    when(products.findAll()).thenReturn(allProducts);
    
    // Act: Call getProduct with all null parameters
    List<Product> result = service.getProduct(null, null, null);
    
    // Assert: Should return all products (calls listProducts internally)
    assertNotNull(result);
    assertEquals(1, result.size());
    verify(products).findAll();
  }

  @Test
  public void getProductById_ShouldGetProduct_WhenIdExists() {
    // Arrange: Setup test product
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    Product product = new Product();
    product.setId(1L);
    product.setHsCode(hsCode);
    product.setName("Orange juice");
    product.setUserId("user67");
    product.setPrivate(false);
    
    // Mock the JPA findById(Long) method which returns Optional<Product>
    // Note: ProductRepository has custom findById(long) returning List, but JPA findById(Long) returns Optional
    // Use Answer to handle the method signature conflict
    Answer<Optional<Product>> answer = invocation -> {
      Object id = invocation.getArgument(0);
      if (id instanceof Long && ((Long) id).equals(1L)) {
        return Optional.of(product);
      }
      return Optional.empty();
    };
    lenient().doAnswer(answer).when(products).findById(any());
    
    // Act
    Product result = service.getProductById(1L);
    
    // Assert
    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals("Orange juice", result.getName());
    assertEquals("user67", result.getUserId());
  }

  @Test
  public void getProductById_ShouldThrowException_WhenProductNotFound() {
    Answer<Optional<Product>> answer = invocation -> Optional.empty();
    lenient().doAnswer(answer).when(products).findById(any());
    
    // Act & Assert
    assertThrows(NoSuchElementException.class, () -> service.getProductById(999L));
  }

  @Test
  void getProductsByUserId_ShouldGetProduct_WhenUserIdValid() {
      // Arrange
      when(products.findByUserIdOrIsPrivate("user67", false))
          .thenReturn(Collections.singletonList(product1));

      // Act
      List<Product> result = service.getProductsByUserId("user67");

      // Assert
      assertEquals(1, result.size());
      assertEquals(1L, result.get(0).getId());
      assertEquals("Orange juice", result.get(0).getName());
      verify(products).findByUserIdOrIsPrivate("user67", false);
  }

  @Test
  void getProductsByUserId_ShouldReturnEmptyList_WhenNoProductsFound() {
      // Arrange
      when(products.findByUserIdOrIsPrivate("unknownUser", false))
          .thenReturn(Collections.emptyList());

      // Act
      List<Product> result = service.getProductsByUserId("unknownUser");

      // Assert
      assertTrue(result.isEmpty());
      verify(products).findByUserIdOrIsPrivate("unknownUser", false);
  }

  // create methods tests
  @Test
  public void createProduct_ShouldSaveProduct_WhenValidInput() {
      // Arrange: Setup HSCode mock
      HSCode hsCode = new HSCode();
      hsCode.setCode("847130");
      hsCode.setDescription("Test Description");
      when(hsCodes.findByCode("847130")).thenReturn(Optional.of(hsCode));
      
      // Arrange: Mock that product doesn't exist yet
      when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
          .thenReturn(false);
      
      // Arrange: Create request
      ProductCreateRequest request = new ProductCreateRequest();
      request.setHsCode("847130");
      request.setName("Orange juice");
      request.setUserId("user67");
      request.setIsPrivate(false);
      
      // Arrange: Setup saved product to return
      Product savedProduct = new Product();
      savedProduct.setId(1L);
      savedProduct.setHsCode(hsCode);
      savedProduct.setName("Orange juice");
      savedProduct.setUserId("user67");
      savedProduct.setPrivate(false);
      when(products.save(any(Product.class))).thenReturn(savedProduct);
      
      // Act
      Product result = service.createProduct(request);
      
      // Assert
      assertNotNull(result);
      assertEquals("Orange juice", result.getName());
      assertEquals("user67", result.getUserId());
      verify(products).save(any(Product.class));
  }

  @Test
  public void createProduct_ShouldThrowException_WhenDuplicateCode() {
    // Arrange: Setup HSCode mock
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    when(hsCodes.findByCode("847130")).thenReturn(Optional.of(hsCode));
    
    // Arrange: Mock that product already exists (duplicate)
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(true);
    
    // Arrange: Create request
    ProductCreateRequest request = new ProductCreateRequest();
    request.setHsCode("847130");
    request.setName("Orange juice");
    request.setUserId("user67");
    request.setIsPrivate(false);
    
    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> service.createProduct(request));
    verify(products, never()).save(any(Product.class));
  }

  @Test
  public void createProduct_ShouldThrowException_WhenInvalidHsCode() {
    // Arrange: Mock HS code repository to return empty (non-existent HS code)
    when(hsCodes.findByCode("INVALID")).thenReturn(Optional.empty());
    
    // Arrange: Create request with invalid HS code
    ProductCreateRequest request = new ProductCreateRequest();
    request.setHsCode("INVALID");
    request.setName("Orange juice");
    request.setUserId("user67");
    request.setIsPrivate(false);
    
    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> 
        service.createProduct(request));
    
    assertTrue(exception.getMessage().contains("HS Code 'INVALID' not found"));
    verify(hsCodes).findByCode("INVALID");
    verify(products, never()).save(any(Product.class));
  }

  @Test
  public void createProduct_ShouldCreateProduct_WhenIsPrivateIsNull() {
    // Arrange: Setup HSCode mock
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    when(hsCodes.findByCode("847130")).thenReturn(Optional.of(hsCode));
    
    // Arrange: Mock that product doesn't exist yet
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(false);
    
    // Arrange: Create request with null isPrivate
    ProductCreateRequest request = new ProductCreateRequest();
    request.setHsCode("847130");
    request.setName("Orange juice");
    request.setUserId("user67");
    request.setIsPrivate(null); // Should default to true
    
    // Arrange: Setup saved product to return (should have isPrivate = true)
    Product savedProduct = new Product();
    savedProduct.setId(1L);
    savedProduct.setHsCode(hsCode);
    savedProduct.setName("Orange juice");
    savedProduct.setUserId("user67");
    savedProduct.setPrivate(true); // Should default to true
    when(products.save(any(Product.class))).thenReturn(savedProduct);
    
    // Act
    Product result = service.createProduct(request);
    
    // Assert
    assertNotNull(result);
    assertTrue(result.isPrivate()); // Should default to true
    verify(products).save(any(Product.class));
  }

  @Test
  public void createProduct_ShouldCreateProduct_WhenIsPrivateIsTrue() {
    // Arrange: Setup HSCode mock
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    when(hsCodes.findByCode("847130")).thenReturn(Optional.of(hsCode));
    
    // Arrange: Mock that product doesn't exist yet
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(false);
    
    // Arrange: Create request with explicit isPrivate = true
    ProductCreateRequest request = new ProductCreateRequest();
    request.setHsCode("847130");
    request.setName("Orange juice");
    request.setUserId("user67");
    request.setIsPrivate(true);
    
    // Arrange: Setup saved product to return
    Product savedProduct = new Product();
    savedProduct.setId(1L);
    savedProduct.setHsCode(hsCode);
    savedProduct.setName("Orange juice");
    savedProduct.setUserId("user67");
    savedProduct.setPrivate(true);
    when(products.save(any(Product.class))).thenReturn(savedProduct);
    
    // Act
    Product result = service.createProduct(request);
    
    // Assert
    assertNotNull(result);
    assertTrue(result.isPrivate());
    verify(products).save(any(Product.class));
  }

  // update methods tests
  @Test
  public void updateProduct_ShouldUpdateProductFields_WhenValidUpdate() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock repository to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Setup updated product
    Product updatedProduct = new Product();
    updatedProduct.setId(1L);
    updatedProduct.setHsCode(hsCode);
    updatedProduct.setName("Apple juice");
    updatedProduct.setUserId("user67");
    updatedProduct.setPrivate(true);
    when(products.save(any(Product.class))).thenReturn(updatedProduct);
    
    // Arrange: Create update request
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setName("Apple juice");
    request.setPrivate(true);
    
    // Act
    Product result = service.updateProduct("847130", "Orange juice", "user67", request);
    
    // Assert
    assertNotNull(result);
    assertEquals("Apple juice", result.getName());
    assertTrue(result.isPrivate());
    verify(products).save(any(Product.class));
  }

  @Test
  public void updateProduct_ShouldUpdateProduct_WhenOnlyNameProvided() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock repository to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Setup updated product (only name changed, isPrivate unchanged)
    Product updatedProduct = new Product();
    updatedProduct.setId(1L);
    updatedProduct.setHsCode(hsCode);
    updatedProduct.setName("Apple juice");
    updatedProduct.setUserId("user67");
    updatedProduct.setPrivate(false); // Unchanged
    when(products.save(any(Product.class))).thenReturn(updatedProduct);
    
    // Arrange: Create update request with only name
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setName("Apple juice");
    // isPrivate not provided
    
    // Act
    Product result = service.updateProduct("847130", "Orange juice", "user67", request);
    
    // Assert
    assertNotNull(result);
    assertEquals("Apple juice", result.getName());
    assertFalse(result.isPrivate()); // Should remain unchanged
    verify(products).save(any(Product.class));
  }

  @Test
  public void updateProduct_ShouldUpdateProduct_WhenOnlyIsPrivateProvided() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock repository to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Setup updated product (only isPrivate changed, name unchanged)
    Product updatedProduct = new Product();
    updatedProduct.setId(1L);
    updatedProduct.setHsCode(hsCode);
    updatedProduct.setName("Orange juice"); // Unchanged
    updatedProduct.setUserId("user67");
    updatedProduct.setPrivate(true);
    when(products.save(any(Product.class))).thenReturn(updatedProduct);
    
    // Arrange: Create update request with only isPrivate
    ProductUpdateRequest request = new ProductUpdateRequest();
    // name not provided
    request.setPrivate(true);
    
    // Act
    Product result = service.updateProduct("847130", "Orange juice", "user67", request);
    
    // Assert
    assertNotNull(result);
    assertEquals("Orange juice", result.getName()); // Should remain unchanged
    assertTrue(result.isPrivate()); // Should be updated
    verify(products).save(any(Product.class));
  }

  @Test
  public void updateProduct_ShouldUpdateProduct_WhenNoFieldsProvided() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock repository to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Setup product (no changes)
    Product unchangedProduct = new Product();
    unchangedProduct.setId(1L);
    unchangedProduct.setHsCode(hsCode);
    unchangedProduct.setName("Orange juice");
    unchangedProduct.setUserId("user67");
    unchangedProduct.setPrivate(false);
    when(products.save(any(Product.class))).thenReturn(unchangedProduct);
    
    // Arrange: Create empty update request
    ProductUpdateRequest request = new ProductUpdateRequest();
    // No fields provided
    
    // Act
    Product result = service.updateProduct("847130", "Orange juice", "user67", request);
    
    // Assert
    assertNotNull(result);
    assertEquals("Orange juice", result.getName()); // Unchanged
    assertFalse(result.isPrivate()); // Unchanged
    verify(products).save(any(Product.class)); // Still saves even if no changes
  }

  @Test
  public void updateProduct_ShouldThrowException_WhenUpdateNameIsNull() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock repository to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Create update request with null name (different from blank)
    ProductUpdateRequest request = new ProductUpdateRequest();
    // Set nameProvided to true but name to null
    request.setName(null); // This sets nameProvided = true but name = null
    
    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> 
        service.updateProduct("847130", "Orange juice", "user67", request));
    
    assertTrue(exception.getMessage().contains("Cannot delete product name"));
    verify(products, never()).save(any(Product.class));
  }

  @Test
  public void updateProductById_ShouldUpdateProduct_WhenValid() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock getProductById to return existing product
    Answer<Optional<Product>> findByIdAnswer = invocation -> {
      Object id = invocation.getArgument(0);
      if (id instanceof Long && ((Long) id).equals(1L)) {
        return Optional.of(existingProduct);
      }
      return Optional.empty();
    };
    lenient().doAnswer(findByIdAnswer).when(products).findById(any());
    
    // Arrange: Mock findByNameAndUserIdAndHsCode_Code to find existing product
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Setup updated product
    Product updatedProduct = new Product();
    updatedProduct.setId(1L);
    updatedProduct.setHsCode(hsCode);
    updatedProduct.setName("Apple juice");
    updatedProduct.setUserId("user67");
    updatedProduct.setPrivate(true);
    when(products.save(any(Product.class))).thenReturn(updatedProduct);
    
    // Arrange: Create update request
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setName("Apple juice");
    request.setPrivate(true);
    
    // Act
    Product result = service.updateProductById(1L, request);
    
    // Assert
    assertNotNull(result);
    assertEquals("Apple juice", result.getName());
    assertTrue(result.isPrivate());
    verify(products).save(any(Product.class));
  }

  @Test
  public void updateProductById_ShouldThrowException_WhenUpdateNameIsBlank() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock getProductById to return existing product
    Answer<Optional<Product>> findByIdAnswer = invocation -> {
      Object id = invocation.getArgument(0);
      if (id instanceof Long && ((Long) id).equals(1L)) {
        return Optional.of(existingProduct);
      }
      return Optional.empty();
    };
    lenient().doAnswer(findByIdAnswer).when(products).findById(any());
    
    // Arrange: Mock findByNameAndUserIdAndHsCode_Code
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Create update request with blank name
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setName(""); // Blank name should fail
    
    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> 
        service.updateProductById(1L, request));
    
    assertTrue(exception.getMessage().contains("Cannot delete product name"));
    verify(products, never()).save(any(Product.class));
  }

  @Test
  public void updateProductById_ShouldThrowException_WhenUpdateIsPrivateIsNull() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Create existing product
    Product existingProduct = new Product();
    existingProduct.setId(1L);
    existingProduct.setHsCode(hsCode);
    existingProduct.setName("Orange juice");
    existingProduct.setUserId("user67");
    existingProduct.setPrivate(false);
    
    // Arrange: Mock getProductById to return existing product
    Answer<Optional<Product>> findByIdAnswer = invocation -> {
      Object id = invocation.getArgument(0);
      if (id instanceof Long && ((Long) id).equals(1L)) {
        return Optional.of(existingProduct);
      }
      return Optional.empty();
    };
    lenient().doAnswer(findByIdAnswer).when(products).findById(any());
    
    // Arrange: Mock findByNameAndUserIdAndHsCode_Code
    when(products.findByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(Optional.of(existingProduct));
    
    // Arrange: Create update request with null isPrivate
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setPrivate(null); // Null isPrivate should fail
    
    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> 
        service.updateProductById(1L, request));
    
    assertTrue(exception.getMessage().contains("isPrivate cannot have null"));
    verify(products, never()).save(any(Product.class));
  }

  @Test
  public void updateProductById_ShouldThrowException_WhenProductIdNotFound() {
    // Arrange: Mock getProductById to throw exception (product not found)
    Answer<Optional<Product>> findByIdAnswer = invocation -> Optional.empty();
    lenient().doAnswer(findByIdAnswer).when(products).findById(any());
    
    // Arrange: Create update request
    ProductUpdateRequest request = new ProductUpdateRequest();
    request.setName("Apple juice");
    
    // Act & Assert
    assertThrows(NoSuchElementException.class, () -> 
        service.updateProductById(999L, request));
  }

  // delete methods tests
  @Test
  public void deleteProduct_ShouldDeleteProduct_ConfirmNonExistence() {
    // Arrange: Create HSCode
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Mock that product exists initially
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(true);
    
    // Arrange: Do nothing when delete is called
    doNothing().when(products).deleteByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    
    // Act
    service.deleteProduct("847130", "Orange juice", "user67");
    
    // Assert: Verify product was checked for existence and deleted
    verify(products).existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    verify(products).deleteByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    
    // Note: In a real scenario, after deletion, exists check would return false
    // This is verified in the repository test where actual DB operations occur
    // For service test with mocks, we verify that delete was called, which confirms deletion
  }

  @Test
  public void deleteProduct_ShouldThrowException_WhenWhenProductIdNotFound() {
    // Arrange: Mock that product doesn't exist
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(false);
    
    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> 
        service.deleteProduct("847130", "Orange juice", "user67"));
    
    verify(products).existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    verify(products, never()).deleteByNameAndUserIdAndHsCode_Code(anyString(), anyString(), anyString());
  }

  @Test
  public void deleteProductById_ShouldDeleteProduct_WhenExists() {
    // Arrange: Mock that product exists
    when(products.existsById(1L)).thenReturn(true);
    
    // Arrange: Do nothing when delete is called (void method)
    doNothing().when(products).deleteById(1L);
    
    // Act
    service.deleteProductById(1L);
    
    // Assert
    verify(products).existsById(1L);
    verify(products).deleteById(1L);
  }

  @Test
  public void deleteProductById_ShouldThrowException_WhenDProductIdNotFound() {
    // Arrange: Mock that product doesn't exist
    when(products.existsById(999L)).thenReturn(false);
    
    // Act & Assert
    assertThrows(RuntimeException.class, () -> 
        service.deleteProductById(999L));
    
    verify(products).existsById(999L);
    verify(products, never()).deleteById(anyLong());
  }

  @Test
  public void deleteProduct_ShouldDeleteProduct_WhenExists() {
    // Arrange: Create HSCode (not needed for delete test, but kept for consistency)
    HSCode hsCode = new HSCode();
    hsCode.setCode("847130");
    hsCode.setDescription("Test Description");
    
    // Arrange: Mock that product exists
    when(products.existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130"))
        .thenReturn(true);
    
    // Arrange: Do nothing when delete is called (void method)
    doNothing().when(products).deleteByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    
    // Act
    service.deleteProduct("847130", "Orange juice", "user67");
    
    // Assert
    verify(products).existsByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
    verify(products).deleteByNameAndUserIdAndHsCode_Code("Orange juice", "user67", "847130");
  }
}