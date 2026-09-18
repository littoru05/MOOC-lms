package com.lms.lms_backend.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.cart.AddToCartRequest;
import com.lms.lms_backend.dto.cart.CartResponse;
import com.lms.lms_backend.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/cart", "/api/cart"})
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Xem giỏ hàng của học viên hiện tại
    @GetMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CartResponse> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    // Thêm khóa học vào giỏ hàng
    @PostMapping("/items")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(cartService.addToCart(request, principal.getName()));
    }

    // Xóa khóa học khỏi giỏ hàng
    @DeleteMapping("/items/{courseId}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long courseId,
            Principal principal
    ) {
        return ResponseEntity.ok(cartService.removeFromCart(courseId, principal.getName()));
    }
}
