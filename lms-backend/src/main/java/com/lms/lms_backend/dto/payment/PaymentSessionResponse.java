package com.lms.lms_backend.dto.payment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSessionResponse {
    private String sessionToken;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
