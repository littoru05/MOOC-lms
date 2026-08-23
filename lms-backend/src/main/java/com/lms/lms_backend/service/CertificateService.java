package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public Certificate issueCertificate(Enrollment enrollment) {
        // Kiểm tra xem đã có chứng chỉ cho enrollment này chưa
        return certificateRepository.findByEnrollmentId(enrollment.getId())
                .orElseGet(() -> {
                    String code = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis() % 100000;
                    String pdfUrl = "/api/v1/certificates/download/" + code;

                    Certificate certificate = Certificate.builder()
                            .enrollment(enrollment)
                            .certificateCode(code)
                            .pdfUrl(pdfUrl)
                            .issuedAt(LocalDateTime.now())
                            .build();

                    enrollment.setIsCompleted(true);
                    enrollmentRepository.save(enrollment);

                    return certificateRepository.save(certificate);
                });
    }

    public CertificateResponse getCertificateByCode(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new RuntimeException("Chứng chỉ không tồn tại hoặc mã xác thực không hợp lệ!"));

        return mapToResponse(cert);
    }

    public CertificateResponse getCertificateByEnrollment(Long enrollmentId) {
        Certificate cert = certificateRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Chưa có chứng chỉ cho khóa học này!"));

        return mapToResponse(cert);
    }

    public CertificateResponse mapToResponse(Certificate c) {
        Enrollment e = c.getEnrollment();
        return CertificateResponse.builder()
                .id(c.getId())
                .enrollmentId(e.getId())
                .certificateCode(c.getCertificateCode())
                .studentName(e.getUser().getFullName())
                .studentEmail(e.getUser().getEmail())
                .courseTitle(e.getCourse().getTitle())
                .instructorName(e.getCourse().getInstructor().getFullName())
                .issuedAt(c.getIssuedAt())
                .pdfUrl(c.getPdfUrl())
                .build();
    }
}
