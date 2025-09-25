package com.example.CSD.product;

import java.util.*;
// import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")        // url starts with /products
public class ProductController {
    private ProductService productService;

    public ProductController(ProductService ps) {
        this.productService = ps;
    }

    @GetMapping("/test")
    public String index() {
        return "Product microservice is running.";
    }

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.listProducts();
    }
        
    @GetMapping()       // optional request parameters
    public List<Product> getProduct(@RequestParam(required=false) String hsCode, @RequestParam(required=false) String name, @RequestParam(required = false) Integer userID) {
        return productService.getProduct(userID, name, hsCode);
    }
        
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public Product createProduct(@Valid @RequestBody ProductCreateRequest productRequest) {
        return productService.createProduct(productRequest);
    }

    @PutMapping()      // compulsory request parameters
    public Product updateProduct(@RequestParam String hsCode, @RequestParam String name, @RequestParam String userID, @RequestBody ProductUpdateRequest productRequest) {
        return productService.updateProduct(hsCode, name, userID, productRequest);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductUpdateRequest productRequest) {
        return productService.updateProductById(id, productRequest);
    }

    @DeleteMapping()      // compulsory request parameters
    public void deleteProduct(@RequestParam String hsCode, @RequestParam String name, @RequestParam String userID) {
        productService.deleteProduct(hsCode, name, userID);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProductById(id);
    }   
}