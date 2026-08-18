package com.teastore.service;

import com.teastore.dto.RegisterRequest;
import com.teastore.dto.UserResponse;
import com.teastore.entity.Cart;
import com.teastore.entity.User;
import com.teastore.exception.UserAlreadyExistsException;
import com.teastore.repository.CartRepository;
import com.teastore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, CartRepository cartRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        User savedUser = userRepository.save(user);

        // Create a cart for the new user
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        return mapToResponse(savedUser);
    }

    public UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
