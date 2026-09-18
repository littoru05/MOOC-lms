package com.lms.lms_backend.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.payment.PaymentSessionResponse;
import com.lms.lms_backend.dto.payment.PaymentSessionStatusResponse;
import com.lms.lms_backend.service.PaymentSessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payment-sessions")
@RequiredArgsConstructor
public class PaymentSessionController {

    private final PaymentSessionService paymentSessionService;

    /**
     * Tạo phiên thanh toán QR mới (yêu cầu đăng nhập)
     */
    @PostMapping
    public ResponseEntity<PaymentSessionResponse> createSession(Principal principal) {
        PaymentSessionResponse response = paymentSessionService.createSession(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy trạng thái phiên thanh toán (Công khai cho polling & mobile)
     */
    @GetMapping("/{token}/status")
    public ResponseEntity<PaymentSessionStatusResponse> getSessionStatus(@PathVariable String token) {
        PaymentSessionStatusResponse response = paymentSessionService.getSessionStatus(token);
        return ResponseEntity.ok(response);
    }

    /**
     * Xác nhận thanh toán từ điện thoại quét QR (Công khai, không cần login trên điện thoại)
     */
    @PostMapping("/{token}/confirm")
    public ResponseEntity<PaymentSessionStatusResponse> confirmSession(@PathVariable String token) {
        PaymentSessionStatusResponse response = paymentSessionService.confirmSession(token);
        return ResponseEntity.ok(response);
    }
}
