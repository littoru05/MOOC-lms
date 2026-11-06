package com.lms.lms_backend.dto.certificate;

import java.time.LocalDateTime;

import com.lms.lms_backend.entity.CertificateStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CertificateResponse {
    private Long id;
    private Long enrollmentId;
    private String certificateCode;
    private String studentName;
    private String studentEmail;
    private String courseTitle;
    private String instructorName;
    private LocalDateTime issuedAt;
    private String pdfUrl;
    private Integer finalScore;
    private Integer totalDurationMinutes;

    @Builder.Default
    private CertificateStatus status = CertificateStatus.VALID;
    private LocalDateTime revokedAt;
    private String revokedByName;
    private String revokeReason;
    private boolean isValid;
}
