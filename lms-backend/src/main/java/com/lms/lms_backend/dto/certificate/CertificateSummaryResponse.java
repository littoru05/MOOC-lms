package com.lms.lms_backend.dto.certificate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CertificateSummaryResponse {
    private long total;
    private long valid;
    private long revoked;
}

