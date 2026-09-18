package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.payment.PaymentSessionResponse;
import com.lms.lms_backend.dto.payment.PaymentSessionStatusResponse;
import com.lms.lms_backend.entity.PaymentSession;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.PaymentSessionRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSessionService {

    private final PaymentSessionRepository paymentSessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentSessionResponse createSession(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        String sessionToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(5);

        PaymentSession session = PaymentSession.builder()
                .sessionToken(sessionToken)
                .user(user)
                .status("PENDING")
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        PaymentSession saved = paymentSessionRepository.save(session);
        log.info("Created payment session token: {} for user: {}", sessionToken, userEmail);

        return PaymentSessionResponse.builder()
                .sessionToken(saved.getSessionToken())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .expiresAt(saved.getExpiresAt())
                .build();
    }

    @Transactional
    public PaymentSessionStatusResponse getSessionStatus(String sessionToken) {
        PaymentSession session = paymentSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Phiên thanh toán không tồn tại!"));

        // Tự động chuyển EXPIRED nếu quá 5 phút
        if ("PENDING".equals(session.getStatus()) && LocalDateTime.now().isAfter(session.getExpiresAt())) {
            session.setStatus("EXPIRED");
            session = paymentSessionRepository.save(session);
            log.info("Payment session token {} expired", sessionToken);
        }

        return PaymentSessionStatusResponse.builder()
                .sessionToken(session.getSessionToken())
                .status(session.getStatus())
                .expiresAt(session.getExpiresAt())
                .build();
    }

    @Transactional
    public PaymentSessionStatusResponse confirmSession(String sessionToken) {
        PaymentSession session = paymentSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Phiên thanh toán không tồn tại!"));

        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            session.setStatus("EXPIRED");
            paymentSessionRepository.save(session);
            throw new RuntimeException("Phiên thanh toán đã hết hạn, vui lòng tạo mã mới!");
        }

        if (!"PENDING".equals(session.getStatus())) {
            throw new RuntimeException("Phiên thanh toán không ở trạng thái hợp lệ để xác nhận (Hiện tại: " + session.getStatus() + ")!");
        }

        session.setStatus("CONFIRMED");
        PaymentSession saved = paymentSessionRepository.save(session);
        log.info("Payment session token {} confirmed successfully", sessionToken);

        return PaymentSessionStatusResponse.builder()
                .sessionToken(saved.getSessionToken())
                .status(saved.getStatus())
                .expiresAt(saved.getExpiresAt())
                .build();
    }
}
