package com.teastore.controller;

import com.teastore.dto.ProductResponse;
import com.teastore.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getActiveProducts(
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        List<ProductResponse> products = productService.getActiveProducts(categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
}
