package com.lms.lms_backend.dto.certificate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CertificateRevokeRequest {

    @NotBlank(message = "Lý do thu hồi không được để trống")
    private String reason;
}

