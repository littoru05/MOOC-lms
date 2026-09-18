package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final CertificateHtmlToPdfRenderer certificateHtmlToPdfRenderer;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional
    public Certificate issueCertificate(Enrollment enrollment) {
        return issueCertificate(enrollment, null);
    }

    @Transactional
    public Certificate issueCertificate(Enrollment enrollment, Integer score) {
        // Kiểm tra xem đã có chứng chỉ cho enrollment này chưa
        return certificateRepository.findByEnrollmentId(enrollment.getId())
                .map(existing -> {
                    if (score != null && existing.getFinalScore() == null) {
                        existing.setFinalScore(score);
                        return certificateRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    String code = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis() % 100000;
                    String pdfUrl = "/api/v1/certificates/download/" + code;

                    int totalDuration = computeCourseDurationMinutes(enrollment.getCourse());

                    Certificate certificate = Certificate.builder()
                            .enrollment(enrollment)
                            .certificateCode(code)
                            .pdfUrl(pdfUrl)
                            .finalScore(score)
                            .totalDurationMinutes(totalDuration)
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

    /**
     * Xuất chứng chỉ dạng file PDF chuẩn quốc tế (Coursera/Udemy/edX)
     * Kèm mã QR code xác thực ZXing trỏ đến trang tra cứu công khai.
     */
    public byte[] generateCertificatePdf(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new RuntimeException("Chứng chỉ không tồn tại hoặc mã xác thực không hợp lệ!"));

        Enrollment e = cert.getEnrollment();
        User student = e.getUser();
        Course course = e.getCourse();
        User instructor = course.getInstructor();

        int durationMinutes = cert.getTotalDurationMinutes() != null && cert.getTotalDurationMinutes() > 0
                ? cert.getTotalDurationMinutes()
                : computeCourseDurationMinutes(course);

        Integer score = cert.getFinalScore();
        String baseUrl = (frontendBaseUrl != null ? frontendBaseUrl : "http://localhost:5173").replaceAll("/+$", "");
        String verificationUrl = baseUrl + "/certificates?code=" + cert.getCertificateCode();

        return certificateHtmlToPdfRenderer.renderCertificate(
                student != null ? student.getFullName() : "Học Viên",
                course != null ? course.getTitle() : "Khóa học trực tuyến",
                instructor != null ? instructor.getFullName() : "Giảng viên EduMOOC",
                cert.getCertificateCode(),
                cert.getIssuedAt(),
                durationMinutes,
                score,
                verificationUrl
        );
    }

    public CertificateResponse mapToResponse(Certificate c) {
        Enrollment e = c.getEnrollment();
        int duration = c.getTotalDurationMinutes() != null && c.getTotalDurationMinutes() > 0
                ? c.getTotalDurationMinutes()
                : computeCourseDurationMinutes(e.getCourse());

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
                .finalScore(c.getFinalScore())
                .totalDurationMinutes(duration)
                .build();
    }

    private int computeCourseDurationMinutes(Course course) {
        if (course == null || course.getId() == null || lessonRepository == null) return 0;
        Integer duration = lessonRepository.sumDurationMinutesByCourseId(course.getId());
        return duration != null ? duration : 0;
    }
}
