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
public class CertificateAdminResponse {
    private Long id;
    private String certificateCode;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private String instructorName;
    private Integer finalScore;
    private Integer totalDurationMinutes;
    private LocalDateTime issuedAt;
    private CertificateStatus status;
    private LocalDateTime revokedAt;
    private String revokedByName;
    private String revokeReason;
    private String pdfUrl;
}

