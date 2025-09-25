package com.example.CSD.product;

import java.util.*;
// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.hscode.*;

@Service
public class ProductService {
    private ProductRepository products;
    private HSCodeRepository hsCodes;

    public ProductService(ProductRepository products, HSCodeRepository hsCodeRepository) {
        this.products = products;
        this.hsCodes = hsCodeRepository;
    }

    // Retrieve all tariffs in DB
    public List<Product> listProducts() {
        return products.findAll();
    }
    
    // public List<Product> getProductByHSCode(String code) {
    //     return products.findByHsCode_Code(code);
    // }
    
    // TODO: Review this method - I think it is a better query (general method that can filter anything; no strict format)

    // Retrieve products based on given condition(s)
    public List<Product> getProduct(Integer userID, String name, String hsCode) {
        // If no parameters provided, return all tariffs
        if (userID == null && name == null && hsCode == null) {
            return listProducts();
        }
        
        return products.findByFilters(userID, name, hsCode);
    }

    // Retrieve product based on its id
    public Product getProductById(Long id) {
        return products.findById(id).orElseThrow(() -> new NoSuchElementException("Product with ID " + id + " not found."));
    }

    // Create & add a new tariff to DB
    public Product createProduct(ProductRequest request) {
        // (1) Validate Tariff Request
        Integer userID = request.getUserId();
        String pName = request.getName();
        String hsCodeValue = request.getHsCode();
        Boolean isPrivate = request.getIsPrivate();

        // UserID TODO: need to update after implementing table
        if (userID == null || userID <= 0) {                                            // (!) temp simple validation
            throw new IllegalArgumentException("User ID must be a positive integer.");
        }

        // Product Name
        if (pName == null || pName.trim().isEmpty()) {                                  // (!) Product name left empty
            throw new IllegalArgumentException("Product name cannot be left empty.");
        } 
        
        // HS Code
        if (hsCodeValue == null || hsCodeValue.isEmpty()) {                             // (!) HS code left empty
            throw new IllegalArgumentException("HS Code cannot be left empty.");
        }

        HSCode hsCode = hsCodes.findByCode(hsCodeValue)                                 // (?) Check if HS code exists
        .orElseThrow(() -> new RuntimeException("HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));

        // TODO: if left empty, whether set to True or throw an error
        if (isPrivate == null) {
            isPrivate = true; // throw new IllegalArgumentException("isPrivate cannot be left empty.");
        }

        // (2) Check if product with same name, userID, HS code already exists
        if (products.existsByNameAndUserIdAndHsCode_Code(pName, userID, hsCodeValue)){
            throw new IllegalArgumentException("Product with name '" + pName + "', User ID '" + userID + "', and HS Code '" + hsCodeValue + "' already exists.");
        }

        // (3) Create and save product 
        Product product = new Product();
        product.setName(pName);
        product.setUserId(userID);
        product.setHsCode(hsCode);
        product.setPrivate(isPrivate);
        return products.save(product);
    }

    // TODO: agreed(?) that update product only change product name or is private
    // TODO: if value is null - is it removed or unchange - maybe to know it is unchanged, set value as "UNCHANGED" or smth
    
    // Update product; Find product using hs code, product name, user id
    public Product updateProduct(String hsCode, String name, Integer userID, ProductRequest request) {
        // (1) Retrieve queried tariff
        Product existingProduct = products.findByNameAndUserIdAndHsCode_Code(name,userID,hsCode)
        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // (2) Valid product request
        String pName = request.getName();
        Boolean isPrivate = request.getIsPrivate();

        if (pName == null || pName.trim().isEmpty()) {                                  // (!) Product name left empty
            throw new IllegalArgumentException("Product name cannot be left empty.");
        } 
        if (isPrivate == null) {    //TODO: sus logic
            throw new IllegalArgumentException("Explicitly state whether to product is private or not.");
        }

        // (3) Update queried product 
        existingProduct.setName(pName);
        existingProduct.setPrivate(isPrivate);
        return products.save(existingProduct);
    }

    // Update product; Find product using product id
    public Product updateProductById(Long id, ProductRequest request) {
        Product eP = getProductById(id);
        return updateProduct(eP.getHsCode().getCode(), eP.getName(), eP.getUserId(), request);
    }

    // Delete product; Find product using hs code, product name, user id
    @Transactional
    public void deleteProduct(String hsCode, String name, Integer userID) {
        if (!products.existsByNameAndUserIdAndHsCode_Code(name, userID, hsCode)){
            throw new IllegalArgumentException(String.format("Product not found"));
        }

        products.deleteByNameAndUserIdAndHsCode_Code(name, userID, hsCode);
    }

    // Delete product; Find product using product id
    @Transactional
    public void deleteProductById(Long id) {
        if (!products.existsById(id)) {
            throw new RuntimeException("Product not found");
        }

        products.deleteById(id);
    }
}