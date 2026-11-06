package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.lms_backend.controller.AdminController;
import com.lms.lms_backend.dto.admin.AdminPasswordResetResponse;
import com.lms.lms_backend.dto.admin.AdminPasswordVerificationRequest;
import com.lms.lms_backend.dto.admin.AdminUserDetailResponse;
import com.lms.lms_backend.dto.admin.UserSensitiveInfoResponse;
import com.lms.lms_backend.dto.auth.LoginRequest;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Order;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.RefreshToken;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AuditLogRepository;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.OrderRepository;
import com.lms.lms_backend.repository.RefreshTokenRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AdminAuthRateLimiter;
import com.lms.lms_backend.service.AuthService;

@SpringBootTest
@ActiveProfiles("test")
public class AdminUserDetailIntegrationTest {

    @Autowired
    private AdminController adminController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminAuthRateLimiter adminAuthRateLimiter;

    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper = createTestMapper();

    private static ObjectMapper createTestMapper() {
        ObjectMapper mapper = new ObjectMapper();
        com.fasterxml.jackson.databind.module.SimpleModule module =
                new com.fasterxml.jackson.databind.module.SimpleModule();
        module.addSerializer(java.time.LocalDateTime.class, com.fasterxml.jackson.databind.ser.std.ToStringSerializer.instance);
        module.addSerializer(java.time.LocalDate.class, com.fasterxml.jackson.databind.ser.std.ToStringSerializer.instance);
        mapper.registerModule(module);
        return mapper;
    }

    private User adminUser;
    private User otherAdmin;
    private User studentUser;
    private User instructorUser;
    private Authentication adminAuth;

    @BeforeEach
    void setUp() {
        tearDown();

        adminUser = userRepository.save(User.builder()
                .username("superadmin")
                .email("admin_gov@lms.com")
                .password(passwordEncoder.encode("AdminSecret123!"))
                .fullName("Quản Trị Viên Trưởng")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .phone("0988776655")
                .build());

        otherAdmin = userRepository.save(User.builder()
                .username("otheradmin")
                .email("other_admin@lms.com")
                .password(passwordEncoder.encode("OtherAdmin123!"))
                .fullName("Quản Trị Viên Khác")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build());

        studentUser = userRepository.save(User.builder()
                .username("hocvien_test")
                .email("anhlinh2005tb@gmail.com")
                .password(passwordEncoder.encode("StudentOldPass123!"))
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .phone("0912345678")
                .dateOfBirth(LocalDate.of(2000, 5, 15))
                .gender("Nam")
                .build());

        instructorUser = userRepository.save(User.builder()
                .username("giangvien_test")
                .email("instructor_test@lms.com")
                .password(passwordEncoder.encode("Instructor123!"))
                .fullName("TS. Nguyễn Văn A")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .phone("0909090909")
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Công nghệ thông tin")
                .slug("cong-nghe-thong-tin-" + System.currentTimeMillis())
                .description("CNTT")
                .build());

        Course course = courseRepository.save(Course.builder()
                .title("Khóa học Python thực chiến")
                .slug("khoa-hoc-python-thuc-chien-" + System.currentTimeMillis())
                .description("Học Python")
                .price(new BigDecimal("500000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructorUser)
                .category(category)
                .isDeleted(false)
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .user(studentUser)
                .course(course)
                .progressPercent(new BigDecimal("75.00"))
                .isCompleted(false)
                .build());

        orderRepository.save(Order.builder()
                .orderCode("ORD-" + System.currentTimeMillis())
                .user(studentUser)
                .totalAmount(new BigDecimal("500000"))
                .status(OrderStatus.COMPLETED)
                .build());

        adminAuth = new UsernamePasswordAuthenticationToken(
                adminUser.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(adminAuth);

        adminAuthRateLimiter.clear(adminUser.getId());
    }

    @AfterEach
    void tearDown() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        if (adminUser != null) {
            adminAuthRateLimiter.clear(adminUser.getId());
        }
        orderRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        categoryRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. GET /api/v1/admin/users/{id}/detail trả thông tin cơ bản, dữ liệu nhạy cảm đã che, thống kê và không chứa password")
    void testGetUserDetail_Success_MaskedAndNoPassword() {
        ResponseEntity<AdminUserDetailResponse> response = adminController.getUserDetail(studentUser.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getHeaders().getCacheControl().contains("no-store"));

        AdminUserDetailResponse detail = response.getBody();
        assertNotNull(detail);
        assertEquals(studentUser.getId(), detail.getId());
        assertEquals("Trần Văn Học Viên", detail.getFullName());
        assertEquals(Role.ROLE_STUDENT, detail.getRole());

        // Kiểm tra masked sensitive info
        assertEquals("a***@g***.com", detail.getEmail());
        assertEquals("09******78", detail.getPhone());
        assertEquals("**/**/****", detail.getDateOfBirth());
        assertEquals("***", detail.getGender());

        // Kiểm tra thống kê
        assertNotNull(detail.getStats());
        assertEquals(1, detail.getStats().getEnrolledCoursesCount());
        assertEquals(1, detail.getStats().getOrdersCount());
        assertEquals(new BigDecimal("500000"), detail.getStats().getTotalSpent());

        // Kiểm tra danh sách 5 mục gần nhất
        assertNotNull(detail.getRecentEnrollments());
        assertEquals(1, detail.getRecentEnrollments().size());
        assertEquals("Khóa học Python thực chiến", detail.getRecentEnrollments().get(0).getCourseTitle());

        assertNotNull(detail.getRecentOrders());
        assertEquals(1, detail.getRecentOrders().size());

        // Duyệt đệ quy JSON để chứng minh KHÔNG bao giờ có trường password hoặc passwordHash
        JsonNode jsonNode = objectMapper.valueToTree(detail);
        assertNoPasswordInJson(jsonNode);
    }

    @Test
    @DisplayName("2. POST reveal: Sai mật khẩu admin trả về 403 (không phải 401), đúng mật khẩu trả thông tin đầy đủ, 5 lần sai trả 429")
    void testRevealSensitiveInfo_PasswordAuth_RateLimiting() {
        AdminPasswordVerificationRequest wrongReq = AdminPasswordVerificationRequest.builder()
                .adminPassword("WrongPassword123!")
                .build();

        // Lần 1: Sai mật khẩu -> Phải ném 403 Forbidden (TUYỆT ĐỐI không trả 401)
        ResponseStatusException ex1 = assertThrows(ResponseStatusException.class, () ->
                adminController.revealSensitiveInfo(studentUser.getId(), wrongReq, adminAuth));
        assertEquals(HttpStatus.FORBIDDEN, ex1.getStatusCode());
        assertEquals("Mật khẩu quản trị viên không chính xác", ex1.getReason());

        // Lần 2, 3, 4: Thử tiếp sai mật khẩu
        for (int i = 2; i <= 4; i++) {
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    adminController.revealSensitiveInfo(studentUser.getId(), wrongReq, adminAuth));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        // Lần 5: Vẫn sai -> 403
        ResponseStatusException ex5 = assertThrows(ResponseStatusException.class, () ->
                adminController.revealSensitiveInfo(studentUser.getId(), wrongReq, adminAuth));
        assertEquals(HttpStatus.FORBIDDEN, ex5.getStatusCode());

        // Lần 6: Đã đạt 5 lần sai -> Phải trả 429 Too Many Requests
        ResponseStatusException ex6 = assertThrows(ResponseStatusException.class, () ->
                adminController.revealSensitiveInfo(studentUser.getId(), wrongReq, adminAuth));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex6.getStatusCode());
        assertTrue(ex6.getReason().contains("quá 5 lần"));

        // Reset rate limiter để test nhập đúng mật khẩu
        adminAuthRateLimiter.clear(adminUser.getId());

        AdminPasswordVerificationRequest correctReq = AdminPasswordVerificationRequest.builder()
                .adminPassword("AdminSecret123!")
                .build();

        ResponseEntity<UserSensitiveInfoResponse> revealResponse =
                adminController.revealSensitiveInfo(studentUser.getId(), correctReq, adminAuth);

        assertEquals(HttpStatus.OK, revealResponse.getStatusCode());
        UserSensitiveInfoResponse sensitiveInfo = revealResponse.getBody();
        assertNotNull(sensitiveInfo);
        assertEquals("anhlinh2005tb@gmail.com", sensitiveInfo.getEmail());
        assertEquals("0912345678", sensitiveInfo.getPhone());
        assertEquals(LocalDate.of(2000, 5, 15), sensitiveInfo.getDateOfBirth());
        assertEquals("Nam", sensitiveInfo.getGender());

        assertNoPasswordInJson(objectMapper.valueToTree(sensitiveInfo));

        // Kiểm tra audit log đã được ghi
        assertTrue(auditLogRepository.findAll().stream()
                .anyMatch(log -> log.getAction() == AuditAction.USER_SENSITIVE_DATA_REVEALED));
    }

    @Test
    @DisplayName("3. POST reset-password: Chặn reset tài khoản Admin; Reset học viên sinh pass 12 ký tự, revoke token và đăng nhập được")
    void testResetPassword_SuccessAndProtection() {
        AdminPasswordVerificationRequest correctReq = AdminPasswordVerificationRequest.builder()
                .adminPassword("AdminSecret123!")
                .build();

        // Thử reset tài khoản Admin khác -> Chặn 400 Bad Request
        ResponseStatusException adminEx = assertThrows(ResponseStatusException.class, () ->
                adminController.resetUserPassword(otherAdmin.getId(), correctReq, adminAuth));
        assertEquals(HttpStatus.BAD_REQUEST, adminEx.getStatusCode());
        assertEquals("Không thể đặt lại mật khẩu cho tài khoản Quản trị viên", adminEx.getReason());

        // Tạo refresh token giả lập đang hoạt động cho studentUser
        RefreshToken oldToken = refreshTokenRepository.save(RefreshToken.builder()
                .token("old-refresh-token-" + System.currentTimeMillis())
                .user(studentUser)
                .expiryDate(java.time.LocalDateTime.now().plusHours(1))
                .revoked(false)
                .build());

        // Reset mật khẩu cho studentUser
        ResponseEntity<AdminPasswordResetResponse> resetResponse =
                adminController.resetUserPassword(studentUser.getId(), correctReq, adminAuth);

        assertEquals(HttpStatus.OK, resetResponse.getStatusCode());
        AdminPasswordResetResponse resetBody = resetResponse.getBody();
        assertNotNull(resetBody);

        assertNoPasswordInJson(objectMapper.valueToTree(resetBody));

        String tempPassword = resetBody.getTempPassword();
        assertNotNull(tempPassword);
        assertEquals(12, tempPassword.length());

        // Kiểm tra refresh token cũ đã bị thu hồi
        RefreshToken tokenAfter = refreshTokenRepository.findById(oldToken.getId()).orElseThrow();
        assertTrue(Boolean.TRUE.equals(tokenAfter.getRevoked()), "Refresh token cũ của người dùng phải bị thu hồi!");

        // Kiểm tra studentUser đăng nhập được bằng mật khẩu tạm thời
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(studentUser.getEmail());
        loginReq.setPassword(tempPassword);
        var loginResponse = authService.login(loginReq);

        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getToken());

        // Mật khẩu cũ không còn dùng được
        assertFalse(passwordEncoder.matches("StudentOldPass123!",
                userRepository.findById(studentUser.getId()).orElseThrow().getPassword()));

        // Kiểm tra audit log
        assertTrue(auditLogRepository.findAll().stream()
                .anyMatch(log -> log.getAction() == AuditAction.USER_PASSWORD_RESET));
    }

    @Test
    @DisplayName("4. Non-admin (ROLE_STUDENT) truy cập adminController bị AccessDeniedException (403)")
    void testNonAdminForbidden() {
        Authentication studentAuth = new UsernamePasswordAuthenticationToken(
                studentUser.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(studentAuth);

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                adminController.getUserDetail(studentUser.getId()));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                adminController.revealSensitiveInfo(studentUser.getId(), new AdminPasswordVerificationRequest("123"), studentAuth));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                adminController.resetUserPassword(studentUser.getId(), new AdminPasswordVerificationRequest("123"), studentAuth));
    }

    private void assertNoPasswordInJson(JsonNode node) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String key = entry.getKey();
                assertNotEquals("password", key, "JSON response tuyệt đối không được chứa trường 'password'");
                assertNotEquals("passwordHash", key, "JSON response tuyệt đối không được chứa trường 'passwordHash'");
                assertNotEquals("password_hash", key, "JSON response tuyệt đối không được chứa trường 'password_hash'");
                assertNoPasswordInJson(entry.getValue());
            }
        } else if (node.isArray()) {
            for (JsonNode child : node) {
                assertNoPasswordInJson(child);
            }
        }
    }
}
