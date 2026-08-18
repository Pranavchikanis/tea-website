package com.teastore.service;

import com.teastore.dto.CartItemRequest;
import com.teastore.dto.CartItemResponse;
import com.teastore.dto.CartResponse;
import com.teastore.entity.Cart;
import com.teastore.entity.CartItem;
import com.teastore.entity.Product;
import com.teastore.entity.User;
import com.teastore.repository.CartItemRepository;
import com.teastore.repository.CartRepository;
import com.teastore.repository.ProductRepository;
import com.teastore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, 
                       ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCartForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(String email, CartItemRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getIsActive() || product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Product not available in requested quantity");
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(String email, Long itemId, Integer quantity) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("CartItem does not belong to user cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Not enough stock");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItemFromCart(String email, Long itemId) {
        return updateItemQuantity(email, itemId, 0);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        
        List<CartItemResponse> items = cart.getItems().stream().map(item -> {
            CartItemResponse itemRes = new CartItemResponse();
            itemRes.setId(item.getId());
            itemRes.setProductId(item.getProduct().getId());
            itemRes.setProductName(item.getProduct().getName());
            itemRes.setProductImageUrl(item.getProduct().getImageUrl());
            itemRes.setProductPrice(item.getProduct().getPrice());
            itemRes.setQuantity(item.getQuantity());
            return itemRes;
        }).collect(Collectors.toList());
        
        response.setItems(items);
        
        BigDecimal total = items.stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalAmount(total);
        
        return response;
    }
}
