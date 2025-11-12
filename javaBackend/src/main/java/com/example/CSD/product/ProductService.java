package com.example.CSD.product;

import java.util.*;

public interface ProductService {
    /**
     * Retrieves all products in the system
     * 
     * @return a list of all products currently stored in the system
     *         Returns an empty list if no products are found
     */
    public List<Product> listProducts();
    
    /**
     * Retrieves products based on given condition(s)
     * 
     * @param userID the ID of the user who owns the product
     * @param name the name of the product
     * @param hsCode the HS code associated with the product
     * @return a list of products matching the specified criteria
     *         If no parameters are provided, returns all products
     */
    public List<Product> getProduct(String userID, String name, String hsCode);

    /**
     * Retrieves a product by its unique ID
     * 
     * @param id the unique ID of the product
     * @return the product with the specified ID
     */
    public Product getProductById(Long id);

    /**
     * Retrieves products that are either owned by the specified user or are public
     * 
     * @param userId the ID of the user
     * @return a list of products owned by the user or public products
     */
    public List<Product> getProductsByUserId(String userId);

    /**
     * Adds a new product to the system
     * 
     * @param request data carrier with the details of the product to be created
     * @return the newly created product
     */
    public Product createProduct(ProductCreateRequest request);
     
    /**
     * Updates an existing product identified by its HS code, name, and user ID
     * 
     * @param hsCode the HS code of the product
     * @param name the name of the product
     * @param userID the ID of the user who owns the product
     * @param request data carrier with the details of the product to be updated
     * @return the updated product
     */
    public Product updateProduct(String hsCode, String name, String userID, ProductUpdateRequest request);

    /**
     * Updates an existing product identified by its ID
     * 
     * @param id the unique ID of the product
     * @param request data carrier with the details of the product to be updated
     * @return the updated product
     */
    public Product updateProductById(Long id, ProductUpdateRequest request);

    /**
     * Deletes an existing product identified by its HS code, name, and user ID
     * 
     * @param hsCode the HS code of the product
     * @param name the name of the product
     * @param userID the ID of the user who owns the product
     */
    public void deleteProduct(String hsCode, String name, String userID);

    /**
     * Deletes an existing product identified by its ID
     * 
     * @param id the unique ID of the product
     */
    public void deleteProductById(Long id);
}