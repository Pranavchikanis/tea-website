package com.teastore.service;

import com.teastore.dto.ProductResponse;
import com.teastore.entity.Product;
import com.teastore.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getActiveProducts(Long categoryId) {
        List<Product> products;
        if (categoryId != null) {
            products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        } else {
            products = productRepository.findByIsActiveTrue();
        }
        
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new com.teastore.exception.ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(com.teastore.dto.ProductRequest request, com.teastore.repository.CategoryRepository categoryRepository) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            com.teastore.entity.Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, com.teastore.dto.ProductRequest request, com.teastore.repository.CategoryRepository categoryRepository) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new com.teastore.exception.ResourceNotFoundException("Product not found with id: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            com.teastore.entity.Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getIsActive()
        );
    }
}
