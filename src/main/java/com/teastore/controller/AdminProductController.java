package com.teastore.controller;

import com.teastore.dto.ProductRequest;
import com.teastore.dto.ProductResponse;
import com.teastore.service.ProductService;
import com.teastore.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    public AdminProductController(ProductService productService, CategoryRepository categoryRepository) {
        this.productService = productService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request, categoryRepository);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request, categoryRepository);
        return ResponseEntity.ok(response);
    }
}
