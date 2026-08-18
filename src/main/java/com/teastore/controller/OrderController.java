package com.teastore.controller;

import com.teastore.dto.OrderRequest;
import com.teastore.dto.OrderResponse;
import com.teastore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequest request) {
        OrderResponse order = orderService.placeOrder(authentication.getName(), request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(Authentication authentication) {
        List<OrderResponse> orders = orderService.getUserOrders(authentication.getName());
        return ResponseEntity.ok(orders);
    }
}
