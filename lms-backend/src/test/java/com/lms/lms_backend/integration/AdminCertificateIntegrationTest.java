package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.lms.lms_backend.dto.certificate.CertificateAdminResponse;
import com.lms.lms_backend.dto.certificate.CertificatePageResponse;
import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.dto.certificate.CertificateSummaryResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.AuditLog;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.CertificateStatus;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Notification;
import com.lms.lms_backend.entity.NotificationType;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AuditLogRepository;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.NotificationRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.CertificateService;

@SpringBootTest
@ActiveProfiles("test")
public class AdminCertificateIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CertificateService certificateService;

    private User admin;
    private User instructor;
    private User student;
    private Course course;
    private Enrollment enrollment;

    @BeforeEach
    public void setUp() {
        tearDown();

        admin = userRepository.save(User.builder()
                .email("admin_cert_test@example.com")
                .password("encoded_pass")
                .fullName("Quản Trị Viên Cert")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build());

        instructor = userRepository.save(User.builder()
                .email("instructor_cert_test@example.com")
                .password("encoded_pass")
                .fullName("Giảng Viên Cert")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build());

        student = userRepository.save(User.builder()
                .email("student_cert_test@example.com")
                .password("encoded_pass")
                .fullName("Học Viên Cert")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("CNTT Cert Test")
                .slug("cntt-cert-test-" + System.currentTimeMillis())
                .build());

        course = courseRepository.save(Course.builder()
                .title("Lập trình Java Spring Boot Chuyên Sâu")
                .slug("java-cert-test-" + System.currentTimeMillis())
                .description("Mô tả khóa học")
                .price(BigDecimal.valueOf(199000))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .category(category)
                .build());

        enrollment = enrollmentRepository.save(Enrollment.builder()
                .user(student)
                .course(course)
                .isCompleted(false)
                .progressPercent(BigDecimal.valueOf(100))
                .build());
    }

    @AfterEach
    public void tearDown() {
        notificationRepository.deleteAll();
        auditLogRepository.deleteAll();
        certificateRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Cấp chứng chỉ gửi thông báo CERTIFICATE_ISSUED cho admin và tra cứu được mã")
    public void testIssueCertificateAndNotification() {
        Certificate cert = certificateService.issueCertificate(enrollment, 95);
        assertNotNull(cert.getId());
        assertNotNull(cert.getCertificateCode());
        assertEquals(CertificateStatus.VALID, cert.getStatus());

        // Kiểm tra thông báo admin
        List<Notification> adminNotifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(admin.getId(), PageRequest.of(0, 10)).getContent();
        assertEquals(1, adminNotifs.size());
        Notification n = adminNotifs.get(0);
        assertEquals(NotificationType.CERTIFICATE_ISSUED, n.getType());
        assertTrue(n.getTitle().contains("chứng chỉ"));
        assertTrue(n.getLink().contains(cert.getCertificateCode()));

        // Tra cứu công khai
        CertificateResponse resp = certificateService.getCertificateByCode(cert.getCertificateCode());
        assertNotNull(resp);
        assertEquals(cert.getCertificateCode(), resp.getCertificateCode());
        assertEquals("Học Viên Cert", resp.getStudentName());
        assertTrue(resp.isValid());
    }

    @Test
    @DisplayName("Thu hồi chứng chỉ ghi audit_logs, chặn tra cứu và chặn tải PDF")
    public void testRevokeCertificate() {
        Certificate cert = certificateService.issueCertificate(enrollment, 85);

        // Thu hồi
        String reason = "Phát hiện gian lận trong bài thi trắc nghiệm";
        CertificateAdminResponse revokedResp = certificateService.revokeCertificate(cert.getId(), reason, admin.getEmail());

        assertEquals(CertificateStatus.REVOKED, revokedResp.getStatus());
        assertEquals(reason, revokedResp.getRevokeReason());
        assertNotNull(revokedResp.getRevokedAt());
        assertEquals(admin.getFullName(), revokedResp.getRevokedByName());

        // Kiểm tra audit log
        List<AuditLog> logs = auditLogRepository.findByCourseOwnerIdOrderByCreatedAtDesc(instructor.getId());
        assertEquals(1, logs.size());
        AuditLog log = logs.get(0);
        assertEquals(AuditAction.CERTIFICATE_REVOKED, log.getAction());
        assertEquals(admin.getId(), log.getActor().getId());
        assertTrue(log.getDetails().contains(reason));

        // Kiểm tra thông báo gửi cho học viên khi chứng chỉ bị thu hồi
        List<Notification> studentNotifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(student.getId(), PageRequest.of(0, 10)).getContent();
        assertEquals(1, studentNotifs.size());
        assertEquals(NotificationType.CERTIFICATE_REVOKED, studentNotifs.get(0).getType());
        assertTrue(studentNotifs.get(0).getMessage().contains(reason));
        assertEquals("/my-certificates", studentNotifs.get(0).getLink());

        // Tra cứu công khai phải ném ngoại lệ
        IllegalArgumentException verifyEx = assertThrows(IllegalArgumentException.class, () -> {
            certificateService.getCertificateByCode(cert.getCertificateCode());
        });
        assertTrue(verifyEx.getMessage().contains("không còn hiệu lực"));

        // Tải PDF phải ném ngoại lệ
        IllegalArgumentException pdfEx = assertThrows(IllegalArgumentException.class, () -> {
            certificateService.generateCertificatePdf(cert.getCertificateCode());
        });
        assertTrue(pdfEx.getMessage().contains("không còn hiệu lực"));
    }

    @Test
    @DisplayName("Khôi phục hiệu lực chứng chỉ ghi audit_logs và cho phép tra cứu lại")
    public void testReinstateCertificate() {
        Certificate cert = certificateService.issueCertificate(enrollment, 88);
        certificateService.revokeCertificate(cert.getId(), "Nhầm lẫn", admin.getEmail());

        // Khôi phục
        CertificateAdminResponse restoredResp = certificateService.reinstateCertificate(cert.getId(), admin.getEmail());
        assertEquals(CertificateStatus.VALID, restoredResp.getStatus());
        assertNull(restoredResp.getRevokedAt());
        assertNull(restoredResp.getRevokeReason());
        assertNull(restoredResp.getRevokedByName());

        // Kiểm tra audit log khôi phục
        List<AuditLog> logs = auditLogRepository.findByCourseOwnerIdOrderByCreatedAtDesc(instructor.getId());
        assertEquals(2, logs.size()); // 1 revoke + 1 reinstate
        assertEquals(AuditAction.CERTIFICATE_REINSTATED, logs.get(0).getAction());

        // Tra cứu công khai hoạt động lại
        CertificateResponse resp = certificateService.getCertificateByCode(cert.getCertificateCode());
        assertNotNull(resp);
        assertTrue(resp.isValid());
    }

    @Test
    @DisplayName("Quản trị viên lọc danh sách chứng chỉ theo q, status và summary")
    public void testAdminFilterAndSummary() {
        Certificate cert = certificateService.issueCertificate(enrollment, 92);

        // Summary ban đầu: 1 total, 1 valid, 0 revoked
        CertificateSummaryResponse summary1 = certificateService.getCertificateSummary();
        assertEquals(1, summary1.getTotal());
        assertEquals(1, summary1.getValid());
        assertEquals(0, summary1.getRevoked());

        // Lọc theo q (tên học viên hoặc mã)
        CertificatePageResponse pageResp1 = certificateService.getAdminCertificates(0, 10, "Học Viên Cert", null, null, null);
        assertEquals(1, pageResp1.getTotalElements());

        CertificatePageResponse pageResp2 = certificateService.getAdminCertificates(0, 10, "Java Spring Boot", null, null, null);
        assertEquals(1, pageResp2.getTotalElements());

        CertificatePageResponse emptyResp = certificateService.getAdminCertificates(0, 10, "Từ khóa không tồn tại", null, null, null);
        assertEquals(0, emptyResp.getTotalElements());

        // Thu hồi cert
        certificateService.revokeCertificate(cert.getId(), "Thu hồi kiểm thử", admin.getEmail());

        CertificateSummaryResponse summary2 = certificateService.getCertificateSummary();
        assertEquals(1, summary2.getTotal());
        assertEquals(0, summary2.getValid());
        assertEquals(1, summary2.getRevoked());

        // Lọc theo status
        CertificatePageResponse validPage = certificateService.getAdminCertificates(0, 10, null, CertificateStatus.VALID, null, null);
        assertEquals(0, validPage.getTotalElements());

        CertificatePageResponse revokedPage = certificateService.getAdminCertificates(0, 10, null, CertificateStatus.REVOKED, null, null);
        assertEquals(1, revokedPage.getTotalElements());
    }
}
