package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.admin.AdminPasswordResetResponse;
import com.lms.lms_backend.dto.admin.AdminPasswordVerificationRequest;
import com.lms.lms_backend.dto.admin.AdminUserDetailResponse;
import com.lms.lms_backend.dto.admin.AdminUserResponse;
import com.lms.lms_backend.dto.admin.DashboardStatsResponse;
import com.lms.lms_backend.dto.admin.UserSensitiveInfoResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.course.RejectCourseRequest;
import com.lms.lms_backend.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // 1. Lấy danh sách khóa học chờ phê duyệt (SD06)
    @GetMapping("/courses/pending")
    public ResponseEntity<List<CourseResponse>> getPendingCourses() {
        return ResponseEntity.ok(adminService.getPendingCourses());
    }

    // 2. Phê duyệt khóa học (Pending -> Published)
    @PatchMapping("/courses/{id}/approve")
    public ResponseEntity<CourseResponse> approveCourse(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String actorEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.approveCourse(id, actorEmail));
    }

    // 3. Từ chối khóa học (Pending -> Rejected)
    @PatchMapping("/courses/{id}/reject")
    public ResponseEntity<CourseResponse> rejectCourse(
            @PathVariable Long id,
            @RequestBody(required = false) RejectCourseRequest request,
            Authentication authentication
    ) {
        String reason = request != null ? request.getReason() : null;
        String actorEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.rejectCourse(id, reason, actorEmail));
    }

    // 4. Lấy danh sách tất cả tài khoản người dùng
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // 5. Khóa / Mở khóa tài khoản (toggle is_active)
    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<AdminUserResponse> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    // 6. Chi tiết tài khoản người dùng (Cache-Control: no-store, thông tin nhạy cảm đã che)
    @GetMapping("/users/{id}/detail")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable Long id) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(adminService.getUserDetail(id));
    }

    // 7. Xác thực mật khẩu Admin để hiển thị thông tin nhạy cảm đầy đủ
    @PostMapping("/users/{id}/reveal")
    public ResponseEntity<UserSensitiveInfoResponse> revealSensitiveInfo(
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordVerificationRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.revealSensitiveInfo(id, request, adminEmail));
    }

    // 8. Đặt lại mật khẩu tạm thời cho người dùng (Chặn tài khoản Admin)
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<AdminPasswordResetResponse> resetUserPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordVerificationRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.resetUserPassword(id, request, adminEmail));
    }

    // 9. Thống kê Dashboard hệ thống
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
