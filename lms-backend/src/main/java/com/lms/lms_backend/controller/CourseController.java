package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.course.CourseUpdateRequest;
import com.lms.lms_backend.service.CourseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/courses", "/api/courses"})
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // Xem danh sách khóa học public (đã xuất bản)
    @GetMapping("/public")
    public ResponseEntity<List<CourseResponse>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getAllPublishedCourses());
    }

    // Xem chi tiết khóa học bằng slug
    @GetMapping("/public/{slug}")
    public ResponseEntity<CourseResponse> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    // Tạo mới khóa học (mặc định DRAFT)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.createCourse(request, authentication.getName()));
    }

    // Cập nhật thông tin khóa học
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.updateCourse(id, request, authentication.getName()));
    }

    // Giảng viên gửi duyệt khóa học (DRAFT -> PENDING)
    @PostMapping("/{id}/submit-review")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> submitForReview(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.submitForReview(id, authentication.getName()));
    }

    // Danh sách khóa học do Giảng viên hiện tại tạo
    @GetMapping("/my-teaching")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<CourseResponse>> getMyTeachingCourses(Authentication authentication) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(authentication.getName()));
    }
}
