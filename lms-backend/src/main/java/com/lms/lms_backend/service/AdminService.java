package com.lms.lms_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.admin.AdminUserResponse;
import com.lms.lms_backend.dto.admin.DashboardStatsResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;

    // 1. Quản lý kiểm duyệt khóa học (SD06)
    public List<CourseResponse> getPendingCourses() {
        return courseRepository.findByStatus(CourseStatus.PENDING).stream()
                .map(courseService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId) {
        return courseService.approveCourse(courseId);
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId) {
        return courseService.rejectCourse(courseId);
    }

    // 2. Quản trị tài khoản người dùng (Khóa / Mở)
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
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại với ID: " + userId));

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

    // 3. Dashboard thống kê tổng quan hệ thống
    public DashboardStatsResponse getDashboardStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalStudents = users.stream().filter(u -> u.getRole() == Role.ROLE_STUDENT).count();
        long totalInstructors = users.stream().filter(u -> u.getRole() == Role.ROLE_INSTRUCTOR).count();

        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByStatus(CourseStatus.PUBLISHED);
        long pendingCourses = courseRepository.countByStatus(CourseStatus.PENDING);

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
