package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.lms.lms_backend.dto.admin.AdminPasswordResetResponse;
import com.lms.lms_backend.dto.admin.AdminPasswordVerificationRequest;
import com.lms.lms_backend.dto.admin.AdminUserDetailResponse;
import com.lms.lms_backend.dto.admin.AdminUserResponse;
import com.lms.lms_backend.dto.admin.DashboardStatsResponse;
import com.lms.lms_backend.dto.admin.UserSensitiveInfoResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.OrderRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.util.MaskingUtils;
import com.lms.lms_backend.util.PasswordGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrderRepository orderRepository;
    private final CertificateRepository certificateRepository;
    private final CourseService courseService;
    private final SectionService sectionService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;
    private final AdminAuthRateLimiter adminAuthRateLimiter;

    // 1. Quản lý kiểm duyệt khóa học (SD06 & Deletion Request)
    public List<CourseResponse> getPendingCourses() {
        return courseRepository.findByStatusInAndIsDeletedFalse(List.of(CourseStatus.PENDING, CourseStatus.PENDING_DELETE)).stream()
                .map(course -> {
                    CourseResponse res = courseService.mapToResponse(course);
                    if (sectionService != null && course.getId() != null) {
                        res.setSections(sectionService.getSectionsByCourse(course.getId()));
                    }
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId) {
        return approveCourse(courseId, null);
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId, String actorEmail) {
        return courseService.approveCourse(courseId, actorEmail);
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId) {
        return rejectCourse(courseId, null, null);
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId, String reason) {
        return rejectCourse(courseId, reason, null);
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId, String reason, String actorEmail) {
        return courseService.rejectCourse(courseId, reason, actorEmail);
    }

    // 2. Quản trị tài khoản người dùng (Danh sách & Khóa / Mở)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> AdminUserResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .avatarUrl(u.getAvatarUrl())
                        .role(u.getRole())
                        .isActive(u.getIsActive())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        User saved = userRepository.save(user);

        return AdminUserResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .avatarUrl(saved.getAvatarUrl())
                .role(saved.getRole())
                .isActive(saved.getIsActive())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // 3. Chi tiết tài khoản người dùng (Thông tin che giấu + thống kê + lịch sử gần đây)
    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        // 1. Thống kê
        AdminUserDetailResponse.UserStatsResponse stats = AdminUserDetailResponse.UserStatsResponse.builder().build();
        if (user.getRole() == Role.ROLE_STUDENT) {
            long enrolled = enrollmentRepository.countByUserId(userId);
            long completed = enrollmentRepository.countByUserIdAndIsCompleted(userId, true);
            long certs = certificateRepository.countByStudentUserId(userId);
            long orders = orderRepository.countByUserIdAndStatus(userId, OrderStatus.COMPLETED);
            BigDecimal totalSpent = orderRepository.sumTotalAmountByUserIdAndStatus(userId, OrderStatus.COMPLETED);

            stats = AdminUserDetailResponse.UserStatsResponse.builder()
                    .enrolledCoursesCount(enrolled)
                    .completedCoursesCount(completed)
                    .certificatesCount(certs)
                    .ordersCount(orders)
                    .totalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO)
                    .build();
        } else if (user.getRole() == Role.ROLE_INSTRUCTOR) {
            long totalCourses = courseRepository.countByInstructorIdAndIsDeletedFalse(userId);
            long published = courseRepository.countByInstructorIdAndStatusAndIsDeletedFalse(userId, CourseStatus.PUBLISHED);
            long pending = courseRepository.countByInstructorIdAndStatusAndIsDeletedFalse(userId, CourseStatus.PENDING)
                    + courseRepository.countByInstructorIdAndStatusAndIsDeletedFalse(userId, CourseStatus.PENDING_DELETE);
            long draft = courseRepository.countByInstructorIdAndStatusAndIsDeletedFalse(userId, CourseStatus.DRAFT);
            long archived = courseRepository.countByInstructorIdAndStatusAndIsDeletedFalse(userId, CourseStatus.ARCHIVED);
            long totalStudents = enrollmentRepository.countDistinctStudentsByInstructorId(userId);

            stats = AdminUserDetailResponse.UserStatsResponse.builder()
                    .totalCoursesCount(totalCourses)
                    .publishedCoursesCount(published)
                    .pendingCoursesCount(pending)
                    .draftCoursesCount(draft)
                    .archivedCoursesCount(archived)
                    .totalStudentsCount(totalStudents)
                    .build();
        }

        // 2. 5 dòng gần nhất cho Enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourseOrderByEnrolledAtDesc(userId);
        List<AdminUserDetailResponse.RecentEnrollmentItem> recentEnrollments = enrollments.stream()
                .limit(5)
                .map(e -> AdminUserDetailResponse.RecentEnrollmentItem.builder()
                        .enrollmentId(e.getId())
                        .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                        .courseTitle(e.getCourse() != null ? e.getCourse().getTitle() : "Khóa học không xác định")
                        .enrolledAt(e.getEnrolledAt())
                        .progressPercent(e.getProgressPercent())
                        .isCompleted(e.getIsCompleted())
                        .build())
                .collect(Collectors.toList());

        // 3. 5 dòng gần nhất cho Orders
        List<AdminUserDetailResponse.RecentOrderItem> recentOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .map(o -> AdminUserDetailResponse.RecentOrderItem.builder()
                        .orderId(o.getId())
                        .orderCode(o.getOrderCode())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus())
                        .createdAt(o.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // 4. 5 dòng gần nhất cho Certificates
        List<AdminUserDetailResponse.RecentCertificateItem> recentCertificates = certificateRepository.findByStudentUserIdOrderByIssuedAtDesc(userId).stream()
                .limit(5)
                .map(c -> AdminUserDetailResponse.RecentCertificateItem.builder()
                        .certificateId(c.getId())
                        .certificateCode(c.getCertificateCode())
                        .courseTitle(c.getEnrollment() != null && c.getEnrollment().getCourse() != null
                                ? c.getEnrollment().getCourse().getTitle() : "Khóa học")
                        .issuedAt(c.getIssuedAt())
                        .status(c.getStatus())
                        .finalScore(c.getFinalScore())
                        .build())
                .collect(Collectors.toList());

        // 5. 5 khóa học gần nhất nếu là giảng viên
        List<AdminUserDetailResponse.RecentCourseItem> recentCourses = Collections.emptyList();
        if (user.getRole() == Role.ROLE_INSTRUCTOR) {
            recentCourses = courseRepository.findByInstructorIdOrderByCreatedAtDesc(userId).stream()
                    .limit(5)
                    .map(c -> AdminUserDetailResponse.RecentCourseItem.builder()
                            .courseId(c.getId())
                            .title(c.getTitle())
                            .status(c.getStatus())
                            .price(c.getPrice())
                            .createdAt(c.getCreatedAt())
                            .enrolledCount(enrollmentRepository.countByCourseId(c.getId()))
                            .build())
                    .collect(Collectors.toList());
        }

        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .title(user.getTitle())
                .bio(user.getBio())
                .teachingField(user.getTeachingField())
                // Thông tin nhạy cảm đã che
                .email(MaskingUtils.maskEmail(user.getEmail()))
                .phone(MaskingUtils.maskPhone(user.getPhone()))
                .dateOfBirth(MaskingUtils.maskDateOfBirth(user.getDateOfBirth()))
                .gender(MaskingUtils.maskGender(user.getGender()))
                .stats(stats)
                .recentEnrollments(recentEnrollments)
                .recentOrders(recentOrders)
                .recentCertificates(recentCertificates)
                .recentCourses(recentCourses)
                .build();
    }

    // 4. Mở khóa xem thông tin nhạy cảm (Email, SĐT, Ngày sinh, Giới tính)
    @Transactional
    public UserSensitiveInfoResponse revealSensitiveInfo(Long userId, AdminPasswordVerificationRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản Quản trị viên không tồn tại"));
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        // Kiểm tra Rate limit 5 lần trong 10 phút
        adminAuthRateLimiter.checkRateLimit(admin.getId());

        // Xác thực mật khẩu admin
        boolean passwordMatches = passwordEncoder.matches(request.getAdminPassword(), admin.getPassword());
        if (!passwordMatches) {
            adminAuthRateLimiter.recordFailedAttempt(admin.getId());
            auditLogService.log(
                    admin,
                    AuditAction.USER_SENSITIVE_DATA_REVEAL_FAILED,
                    "USER",
                    targetUser.getId(),
                    targetUser.getFullName(),
                    "Xác thực mật khẩu thất bại khi yêu cầu xem thông tin nhạy cảm",
                    null
            );
            // TUYỆT ĐỐI KHÔNG TRẢ 401: Trả về 403 Forbidden
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Mật khẩu quản trị viên không chính xác");
        }

        // Mật khẩu đúng -> Xóa lịch sử sai & Ghi nhật ký
        adminAuthRateLimiter.clear(admin.getId());
        auditLogService.log(
                admin,
                AuditAction.USER_SENSITIVE_DATA_REVEALED,
                "USER",
                targetUser.getId(),
                targetUser.getFullName(),
                "Xem thông tin nhạy cảm (Email, SĐT, Ngày sinh)",
                null
        );

        return UserSensitiveInfoResponse.builder()
                .email(targetUser.getEmail())
                .phone(targetUser.getPhone())
                .dateOfBirth(targetUser.getDateOfBirth())
                .gender(targetUser.getGender())
                .build();
    }

    // 5. Đặt lại mật khẩu tạm thời cho người dùng
    @Transactional
    public AdminPasswordResetResponse resetUserPassword(Long userId, AdminPasswordVerificationRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản Quản trị viên không tồn tại"));
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        // Không cho phép đặt lại mật khẩu của tài khoản Admin (kể cả chính mình)
        if (targetUser.getRole() == Role.ROLE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể đặt lại mật khẩu cho tài khoản Quản trị viên"
            );
        }

        // Kiểm tra Rate limit 5 lần trong 10 phút
        adminAuthRateLimiter.checkRateLimit(admin.getId());

        // Xác thực mật khẩu admin
        boolean passwordMatches = passwordEncoder.matches(request.getAdminPassword(), admin.getPassword());
        if (!passwordMatches) {
            adminAuthRateLimiter.recordFailedAttempt(admin.getId());
            auditLogService.log(
                    admin,
                    AuditAction.USER_SENSITIVE_DATA_REVEAL_FAILED,
                    "USER",
                    targetUser.getId(),
                    targetUser.getFullName(),
                    "Xác thực mật khẩu thất bại khi yêu cầu đặt lại mật khẩu người dùng",
                    null
            );
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Mật khẩu quản trị viên không chính xác");
        }

        // Mật khẩu đúng -> Sinh mật khẩu tạm 12 ký tự ngẫu nhiên
        adminAuthRateLimiter.clear(admin.getId());
        String tempPassword = PasswordGenerator.generateTemporaryPassword();

        // Mã hóa BCrypt và cập nhật
        targetUser.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(targetUser);

        // Thu hồi toàn bộ Refresh Token của người dùng này
        refreshTokenService.revokeAllTokensForUser(targetUser);

        // Ghi Audit log (KHÔNG ghi mật khẩu)
        auditLogService.log(
                admin,
                AuditAction.USER_PASSWORD_RESET,
                "USER",
                targetUser.getId(),
                targetUser.getFullName(),
                "Đặt lại mật khẩu tạm thời và thu hồi tất cả phiên đăng nhập",
                null
        );

        return AdminPasswordResetResponse.builder()
                .tempPassword(tempPassword)
                .message("Đã đặt lại mật khẩu tạm thời thành công.")
                .build();
    }

    // 6. Dashboard thống kê tổng quan hệ thống
    public DashboardStatsResponse getDashboardStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalStudents = users.stream().filter(u -> u.getRole() == Role.ROLE_STUDENT).count();
        long totalInstructors = users.stream().filter(u -> u.getRole() == Role.ROLE_INSTRUCTOR).count();

        long totalCourses = courseRepository.countByIsDeletedFalse();
        long publishedCourses = courseRepository.countByStatusAndIsDeletedFalse(CourseStatus.PUBLISHED);
        long pendingCourses = courseRepository.countByStatusInAndIsDeletedFalse(List.of(CourseStatus.PENDING, CourseStatus.PENDING_DELETE));

        long totalEnrollments = enrollmentRepository.count();
        long completedEnrollments = enrollmentRepository.countByIsCompleted(true);

        double completionRate = totalEnrollments > 0
                ? Math.round(((double) completedEnrollments / totalEnrollments * 100) * 100.0) / 100.0
                : 0.0;

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .pendingCourses(pendingCourses)
                .totalEnrollments(totalEnrollments)
                .completedEnrollments(completedEnrollments)
                .completionRate(completionRate)
                .build();
    }
}
