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
public class PaymentSessionStatusResponse {
    private String sessionToken;
    private String status;
    private LocalDateTime expiresAt;
}
