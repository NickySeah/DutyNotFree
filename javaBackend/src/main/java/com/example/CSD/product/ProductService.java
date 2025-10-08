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
    public Product createProduct(ProductCreateRequest request) {
        // (1) Validate Tariff Request                      // TODO: note null/trim().length() checks removed because of @NotBlank
        String userID = request.getUserId();
        String pName = request.getName();
        String hsCodeValue = request.getHsCode();
        Boolean isPrivate = request.getIsPrivate()==null ? true : request.getIsPrivate();   // Default to true if not provided

        HSCode hsCode = hsCodes.findByCode(hsCodeValue)                                     // (?) Check if HS code exists
        .orElseThrow(() -> new RuntimeException("HS Code '" + hsCodeValue + "' not found. Please provide a valid HS Code."));

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
     
    // Update product; Find product using hs code, product name, user id
    public Product updateProduct(String hsCode, String name, String userID, ProductUpdateRequest request) {
        // (1) Retrieve queried tariff
        Product existingProduct = products.findByNameAndUserIdAndHsCode_Code(name,userID,hsCode)
        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // (2) Valid product request
        if (request.isNameProvided()) {
            String newName = request.getName();
            if (newName == null || newName.isBlank()) {
                throw new RuntimeException("Cannot delete product name.");
            }
            existingProduct.setName(newName);
        }
        if (request.isPrivateProvided()) {
            System.out.println("PRIVATE PROVIDE");
            Boolean newPrivate = request.getIsPrivate();
            if (newPrivate == null) {
                throw new RuntimeException("isPrivate cannot have null. Explicitly state true/false");
            }
            existingProduct.setPrivate(newPrivate);
        }

        return products.save(existingProduct);
    }

    // Update product; Find product using product id
    public Product updateProductById(Long id, ProductUpdateRequest request) {
        Product eP = getProductById(id);
        return updateProduct(eP.getHsCode().getCode(), eP.getName(), eP.getUserId(), request);
    }

    // Delete product; Find product using hs code, product name, user id
    @Transactional
    public void deleteProduct(String hsCode, String name, String userID) {
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