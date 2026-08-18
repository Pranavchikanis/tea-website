package com.teastore.service;

import com.teastore.dto.OrderItemResponse;
import com.teastore.dto.OrderRequest;
import com.teastore.dto.OrderResponse;
import com.teastore.entity.*;
import com.teastore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate total and prepare order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            // Check stock
            if (!product.getIsActive() || product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItems.add(orderItem);
        }

        // Create Order
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setTotalAmount(totalAmount);
        
        Order savedOrder = orderRepository.save(order);

        // Save Order Items
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
        }
        
        savedOrder.setItems(orderItems);

        // Clear Cart
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Order> orders = orderRepository.findByUserId(user.getId());
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        response.setShippingAddress(order.getShippingAddress());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            List<OrderItemResponse> items = order.getItems().stream().map(item -> {
                OrderItemResponse itemRes = new OrderItemResponse();
                itemRes.setId(item.getId());
                itemRes.setProductId(item.getProduct().getId());
                itemRes.setProductName(item.getProduct().getName());
                itemRes.setPriceAtPurchase(item.getPriceAtPurchase());
                itemRes.setQuantity(item.getQuantity());
                return itemRes;
            }).collect(Collectors.toList());
            response.setItems(items);
        }

        return response;
    }
}
