package com.lms.lms_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.certificate.CertificateAdminResponse;
import com.lms.lms_backend.dto.certificate.CertificatePageResponse;
import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.dto.certificate.CertificateSummaryResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.CertificateStatus;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.NotificationType;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.UserRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final CertificateHtmlToPdfRenderer certificateHtmlToPdfRenderer;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

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
                            .status(CertificateStatus.VALID)
                            .build();

                    enrollment.setIsCompleted(true);
                    enrollmentRepository.save(enrollment);

                    Certificate saved = certificateRepository.save(certificate);

                    // Gửi thông báo cho toàn bộ Admin
                    try {
                        String studentName = enrollment.getUser() != null ? enrollment.getUser().getFullName() : "Học viên";
                        String courseTitle = enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "Khóa học";
                        notificationService.notifyAdmins(
                                NotificationType.CERTIFICATE_ISSUED,
                                "Học viên đạt chứng chỉ mới",
                                studentName + " đã đạt chứng chỉ khóa '" + courseTitle + "'",
                                "/admin/certificates?q=" + code,
                                enrollment.getCourse() != null ? enrollment.getCourse().getId() : null,
                                enrollment.getUser() != null ? enrollment.getUser().getId() : null
                        );
                    } catch (Exception ex) {
                        log.warn("Lỗi khi gửi thông báo cấp chứng chỉ cho admin: {}", ex.getMessage());
                    }

                    return saved;
                });
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByCode(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Chứng chỉ không tồn tại hoặc mã xác thực không hợp lệ!"));

        if (cert.getStatus() == CertificateStatus.REVOKED) {
            throw new IllegalArgumentException("Chứng chỉ này không còn hiệu lực do đã bị thu hồi!");
        }

        return mapToResponse(cert);
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByEnrollment(Long enrollmentId) {
        Certificate cert = certificateRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có chứng chỉ cho khóa học này!"));

        return mapToResponse(cert);
    }

    /**
     * Xuất chứng chỉ dạng file PDF chuẩn quốc tế (Coursera/Udemy/edX)
     * Kèm mã QR code xác thực ZXing trỏ đến trang tra cứu công khai.
     */
    @Transactional(readOnly = true)
    public byte[] generateCertificatePdf(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Chứng chỉ không tồn tại hoặc mã xác thực không hợp lệ!"));

        if (cert.getStatus() == CertificateStatus.REVOKED) {
            throw new IllegalArgumentException("Chứng chỉ này không còn hiệu lực do đã bị thu hồi!");
        }

        Enrollment e = cert.getEnrollment();
        User student = e.getUser();
        Course course = e.getCourse();
        User instructor = course != null ? course.getInstructor() : null;

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

    @Transactional(readOnly = true)
    public CertificatePageResponse getAdminCertificates(int page, int size, String q, CertificateStatus status, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issuedAt"));

        Specification<Certificate> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issuedAt"), from.atStartOfDay()));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issuedAt"), to.atTime(23, 59, 59)));
            }

            if (q != null && !q.trim().isEmpty()) {
                String searchPattern = "%" + q.trim().toLowerCase() + "%";
                Join<Certificate, Enrollment> enrollmentJoin = root.join("enrollment", JoinType.INNER);
                Join<Enrollment, User> studentJoin = enrollmentJoin.join("user", JoinType.INNER);
                Join<Enrollment, Course> courseJoin = enrollmentJoin.join("course", JoinType.INNER);

                Predicate codeMatch = cb.like(cb.lower(root.get("certificateCode")), searchPattern);
                Predicate studentNameMatch = cb.like(cb.lower(studentJoin.get("fullName")), searchPattern);
                Predicate studentEmailMatch = cb.like(cb.lower(studentJoin.get("email")), searchPattern);
                Predicate courseTitleMatch = cb.like(cb.lower(courseJoin.get("title")), searchPattern);

                predicates.add(cb.or(codeMatch, studentNameMatch, studentEmailMatch, courseTitleMatch));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Certificate> certPage = certificateRepository.findAll(spec, pageable);

        List<CertificateAdminResponse> content = certPage.getContent().stream()
                .map(this::mapToAdminResponse)
                .toList();

        return CertificatePageResponse.builder()
                .content(content)
                .page(certPage.getNumber())
                .size(certPage.getSize())
                .totalElements(certPage.getTotalElements())
                .totalPages(certPage.getTotalPages())
                .last(certPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CertificateSummaryResponse getCertificateSummary() {
        long total = certificateRepository.count();
        long valid = certificateRepository.countByStatus(CertificateStatus.VALID);
        long revoked = certificateRepository.countByStatus(CertificateStatus.REVOKED);
        return new CertificateSummaryResponse(total, valid, revoked);
    }

    @Transactional
    public CertificateAdminResponse revokeCertificate(Long id, String reason, String adminEmail) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chứng chỉ không tồn tại với ID: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin quản trị viên: " + adminEmail));

        cert.setStatus(CertificateStatus.REVOKED);
        cert.setRevokedAt(LocalDateTime.now());
        cert.setRevokedBy(admin);
        cert.setRevokeReason(reason);

        Certificate saved = certificateRepository.save(cert);

        User courseOwner = cert.getEnrollment() != null && cert.getEnrollment().getCourse() != null
                ? cert.getEnrollment().getCourse().getInstructor()
                : null;
        String studentName = cert.getEnrollment() != null && cert.getEnrollment().getUser() != null
                ? cert.getEnrollment().getUser().getFullName()
                : "Học viên";

        auditLogService.log(
                admin,
                AuditAction.CERTIFICATE_REVOKED,
                "CERTIFICATE",
                saved.getId(),
                saved.getCertificateCode(),
                "Thu hồi chứng chỉ của " + studentName + ". Lý do: " + reason,
                courseOwner
        );

        // Gửi thông báo đến học viên sở hữu chứng chỉ bị thu hồi
        try {
            User student = cert.getEnrollment() != null ? cert.getEnrollment().getUser() : null;
            if (student != null && notificationService != null) {
                String courseTitle = cert.getEnrollment().getCourse() != null
                        ? cert.getEnrollment().getCourse().getTitle()
                        : "Khóa học";
                notificationService.notifyUser(
                        student,
                        NotificationType.CERTIFICATE_REVOKED,
                        "Chứng chỉ đã bị thu hồi",
                        "Chứng chỉ khóa '" + courseTitle + "' của bạn đã bị thu hồi. Lý do: " + reason,
                        "/my-certificates",
                        cert.getEnrollment().getCourse() != null ? cert.getEnrollment().getCourse().getId() : null,
                        admin.getId()
                );
            }
        } catch (Exception ex) {
            log.warn("Lỗi khi gửi thông báo thu hồi chứng chỉ cho học viên: {}", ex.getMessage());
        }

        return mapToAdminResponse(saved);
    }

    @Transactional
    public CertificateAdminResponse reinstateCertificate(Long id, String adminEmail) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chứng chỉ không tồn tại với ID: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin quản trị viên: " + adminEmail));

        cert.setStatus(CertificateStatus.VALID);
        cert.setRevokedAt(null);
        cert.setRevokedBy(null);
        cert.setRevokeReason(null);

        Certificate saved = certificateRepository.save(cert);

        User courseOwner = cert.getEnrollment() != null && cert.getEnrollment().getCourse() != null
                ? cert.getEnrollment().getCourse().getInstructor()
                : null;

        auditLogService.log(
                admin,
                AuditAction.CERTIFICATE_REINSTATED,
                "CERTIFICATE",
                saved.getId(),
                saved.getCertificateCode(),
                "Khôi phục hiệu lực chứng chỉ " + saved.getCertificateCode(),
                courseOwner
        );

        return mapToAdminResponse(saved);
    }

    public CertificateResponse mapToResponse(Certificate c) {
        Enrollment e = c.getEnrollment();
        int duration = c.getTotalDurationMinutes() != null && c.getTotalDurationMinutes() > 0
                ? c.getTotalDurationMinutes()
                : computeCourseDurationMinutes(e != null ? e.getCourse() : null);

        return CertificateResponse.builder()
                .id(c.getId())
                .enrollmentId(e != null ? e.getId() : null)
                .certificateCode(c.getCertificateCode())
                .studentName(e != null && e.getUser() != null ? e.getUser().getFullName() : null)
                .studentEmail(e != null && e.getUser() != null ? e.getUser().getEmail() : null)
                .courseTitle(e != null && e.getCourse() != null ? e.getCourse().getTitle() : null)
                .instructorName(e != null && e.getCourse() != null && e.getCourse().getInstructor() != null
                        ? e.getCourse().getInstructor().getFullName()
                        : null)
                .issuedAt(c.getIssuedAt())
                .pdfUrl(c.getPdfUrl())
                .finalScore(c.getFinalScore())
                .totalDurationMinutes(duration)
                .status(c.getStatus() != null ? c.getStatus() : CertificateStatus.VALID)
                .revokedAt(c.getRevokedAt())
                .revokedByName(c.getRevokedBy() != null ? c.getRevokedBy().getFullName() : null)
                .revokeReason(c.getRevokeReason())
                .isValid(c.getStatus() == null || c.getStatus() == CertificateStatus.VALID)
                .build();
    }

    public CertificateAdminResponse mapToAdminResponse(Certificate c) {
        Enrollment e = c.getEnrollment();
        int duration = c.getTotalDurationMinutes() != null && c.getTotalDurationMinutes() > 0
                ? c.getTotalDurationMinutes()
                : computeCourseDurationMinutes(e != null ? e.getCourse() : null);

        return CertificateAdminResponse.builder()
                .id(c.getId())
                .certificateCode(c.getCertificateCode())
                .studentId(e != null && e.getUser() != null ? e.getUser().getId() : null)
                .studentName(e != null && e.getUser() != null ? e.getUser().getFullName() : null)
                .studentEmail(e != null && e.getUser() != null ? e.getUser().getEmail() : null)
                .courseId(e != null && e.getCourse() != null ? e.getCourse().getId() : null)
                .courseTitle(e != null && e.getCourse() != null ? e.getCourse().getTitle() : null)
                .instructorName(e != null && e.getCourse() != null && e.getCourse().getInstructor() != null
                        ? e.getCourse().getInstructor().getFullName()
                        : null)
                .finalScore(c.getFinalScore())
                .totalDurationMinutes(duration)
                .issuedAt(c.getIssuedAt())
                .status(c.getStatus() != null ? c.getStatus() : CertificateStatus.VALID)
                .revokedAt(c.getRevokedAt())
                .revokedByName(c.getRevokedBy() != null ? c.getRevokedBy().getFullName() : null)
                .revokeReason(c.getRevokeReason())
                .pdfUrl(c.getPdfUrl())
                .build();
    }

    private int computeCourseDurationMinutes(Course course) {
        if (course == null || course.getId() == null || lessonRepository == null) return 0;
        Integer duration = lessonRepository.sumDurationMinutesByCourseId(course.getId());
        return duration != null ? duration : 0;
    }
}
