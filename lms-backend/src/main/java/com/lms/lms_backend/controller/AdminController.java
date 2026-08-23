package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.admin.AdminUserResponse;
import com.lms.lms_backend.dto.admin.DashboardStatsResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.service.AdminService;

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
    public ResponseEntity<CourseResponse> approveCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveCourse(id));
    }

    // 3. Từ chối khóa học (Pending -> Rejected)
    @PatchMapping("/courses/{id}/reject")
    public ResponseEntity<CourseResponse> rejectCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectCourse(id));
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

    // 6. Thống kê Dashboard hệ thống
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
