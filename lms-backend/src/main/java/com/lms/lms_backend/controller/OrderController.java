package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.order.CheckoutRequest;
import com.lms.lms_backend.dto.order.OrderResponse;
import com.lms.lms_backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/orders", "/api/orders"})
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @RequestBody(required = false) CheckoutRequest request,
            Authentication authentication
    ) {
        String paymentMethod = (request != null && request.getPaymentMethod() != null)
                ? request.getPaymentMethod()
                : "QR_CODE";
        return ResponseEntity.ok(orderService.checkout(authentication.getName(), paymentMethod));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(orderService.getOrderById(id, authentication.getName()));
    }
}
