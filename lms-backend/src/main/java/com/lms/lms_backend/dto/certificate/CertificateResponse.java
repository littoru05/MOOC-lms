package com.lms.lms_backend.dto.certificate;

import java.time.LocalDateTime;

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
}
