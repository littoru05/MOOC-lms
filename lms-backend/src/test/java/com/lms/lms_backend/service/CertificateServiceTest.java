package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;

@ExtendWith(MockitoExtension.class)
class CertificateServiceTest {

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private CertificateService certificateService;

    private User student;
    private User instructor;
    private Course course;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .fullName("Trần Văn Học Viên")
                .email("student@lms.com")
                .role(Role.ROLE_STUDENT)
                .build();

        instructor = User.builder()
                .id(2L)
                .fullName("TS. Nguyễn Văn A")
                .email("instructor@lms.com")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        course = Course.builder()
                .id(10L)
                .title("Fullstack Web Development")
                .instructor(instructor)
                .build();

        enrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(course)
                .isCompleted(false)
                .build();
    }

    @Test
    @DisplayName("Cấp chứng chỉ lần đầu: sinh mã định danh CERT-*, cập nhật isCompleted=true cho enrollment")
    void issueCertificate_FirstTime_Success() {
        when(certificateRepository.findByEnrollmentId(100L)).thenReturn(Optional.empty());
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(invocation -> {
            Certificate cert = invocation.getArgument(0);
            cert.setId(500L);
            return cert;
        });

        Certificate result = certificateService.issueCertificate(enrollment);

        assertNotNull(result);
        assertNotNull(result.getCertificateCode());
        assertTrue(result.getCertificateCode().startsWith("CERT-"));
        assertTrue(result.getPdfUrl().contains(result.getCertificateCode()));
        assertTrue(enrollment.getIsCompleted());

        verify(enrollmentRepository, times(1)).save(enrollment);
        verify(certificateRepository, times(1)).save(any(Certificate.class));
    }

    @Test
    @DisplayName("Đảm bảo Idempotency: Không cấp chứng chỉ trùng nếu đã cấp trước đó")
    void issueCertificate_AlreadyIssued_ReturnsExisting() {
        Certificate existingCert = Certificate.builder()
                .id(500L)
                .enrollment(enrollment)
                .certificateCode("CERT-EXISTING-123")
                .pdfUrl("/api/v1/certificates/download/CERT-EXISTING-123")
                .issuedAt(LocalDateTime.now())
                .build();

        when(certificateRepository.findByEnrollmentId(100L)).thenReturn(Optional.of(existingCert));

        Certificate result = certificateService.issueCertificate(enrollment);

        assertNotNull(result);
        assertEquals("CERT-EXISTING-123", result.getCertificateCode());
        verify(certificateRepository, never()).save(any());
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Lấy thông tin chứng chỉ bằng mã code xác thực")
    void getCertificateByCode_Success() {
        Certificate cert = Certificate.builder()
                .id(500L)
                .enrollment(enrollment)
                .certificateCode("CERT-ABCD-999")
                .pdfUrl("/api/v1/certificates/download/CERT-ABCD-999")
                .issuedAt(LocalDateTime.now())
                .build();

        when(certificateRepository.findByCertificateCode("CERT-ABCD-999")).thenReturn(Optional.of(cert));

        CertificateResponse res = certificateService.getCertificateByCode("CERT-ABCD-999");

        assertNotNull(res);
        assertEquals("CERT-ABCD-999", res.getCertificateCode());
        assertEquals("Trần Văn Học Viên", res.getStudentName());
        assertEquals("Fullstack Web Development", res.getCourseTitle());
        assertEquals("TS. Nguyễn Văn A", res.getInstructorName());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi tìm chứng chỉ bằng mã code không tồn tại")
    void getCertificateByCode_NotFound_ThrowsException() {
        when(certificateRepository.findByCertificateCode("CERT-INVALID")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                certificateService.getCertificateByCode("CERT-INVALID")
        );

        assertTrue(ex.getMessage().contains("Chứng chỉ không tồn tại"));
    }
}
