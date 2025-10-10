package com.example.CSD.product;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Product Controller", description = "Operations related to managing products")
@RestController
@RequestMapping("/api/v1/products")        // url starts with /products
public class ProductV1Controller {
    private ProductService productService;

    public ProductV1Controller(ProductService ps) {
        this.productService = ps;
    }

    @Operation(summary = "Health check", description = "Returns a simple message to confirm the product microservice is running")
    @GetMapping("/test")
    public String index() {
        return "Product microservice is running.";
    }

    @Operation(summary = "Get all products", description = "Returns a list of all products in the database")
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.listProducts();
    }
    
    @Operation(summary = "Search products", description = "Search products by optional hsCode, name, and userID")
    @GetMapping()       // optional request parameters
    public List<Product> getProduct(@Parameter(description = "HS code of the product")
    @RequestParam(required=false) String hsCode, @Parameter(description = "Name of the product")
    @RequestParam(required=false) String name, @Parameter(description = "User ID associated with the product")
    @RequestParam(required = false) String userID) {
        return productService.getProduct(userID, name, hsCode);
    }
        
    @Operation(summary = "Get product by ID", description = "Retrieve a product using its unique ID")
    @GetMapping("/{id}")
    public Product getProductById(@Parameter(description = "Product ID")
    @PathVariable Long id) {
        return productService.getProductById(id);
    }


    @Operation(summary = "Create a new product", description = "Adds a new product to the database")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Product created successfully")
    })
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Product createProduct(@Valid @RequestBody ProductCreateRequest productRequest) {
        return productService.createProduct(productRequest);
    }

    @Operation(summary = "Update product by composite key", description = "Updates a product using hsCode, name, and userID")
    @PutMapping()      // compulsory request parameters
    public Product updateProduct(@Parameter(description = "HS code of the product")
    @RequestParam String hsCode, @Parameter(description = "Name of the product")
    @RequestParam String name, @Parameter(description = "User ID associated with the product")
    @RequestParam String userID, @RequestBody ProductUpdateRequest productRequest) {
        return productService.updateProduct(hsCode, name, userID, productRequest);
    }

    @Operation(summary = "Update product by ID", description = "Updates a product using its unique ID")
    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")
    public Product updateProduct(@Parameter(description = "Product ID")
    @PathVariable Long id, @RequestBody ProductUpdateRequest productRequest) {
        return productService.updateProductById(id, productRequest);
    }

    @Operation(summary = "Delete product by composite key", description = "Deletes a product using hsCode, name, and userID")
    @DeleteMapping()      // compulsory request parameters
    public void deleteProduct(@Parameter(description = "HS code of the product")
    @RequestParam String hsCode, @Parameter(description = "Name of the product")
    @RequestParam String name, @Parameter(description = "User ID associated with the product")
    @RequestParam String userID) {
        productService.deleteProduct(hsCode, name, userID);
    }

    @Operation(summary = "Delete product by ID", description = "Deletes a product using its unique ID")
    @DeleteMapping("/{id}")
    public void deleteProduct(@Parameter(description = "Product ID")
    @PathVariable Long id) {
        productService.deleteProductById(id);
    }   
}