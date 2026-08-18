package com.teastore.controller;

import com.teastore.dto.CartItemRequest;
import com.teastore.dto.CartResponse;
import com.teastore.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        CartResponse cart = cartService.getCartForUser(authentication.getName());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            Authentication authentication,
            @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addItemToCart(authentication.getName(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.updateItemQuantity(authentication.getName(), itemId, request.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        CartResponse cart = cartService.removeItemFromCart(authentication.getName(), itemId);
        return ResponseEntity.ok(cart);
    }
}
