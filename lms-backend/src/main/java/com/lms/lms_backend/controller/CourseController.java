package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseDeleteResponse;
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

    // Xem danh sách khóa học public (đã xuất bản) có hỗ trợ lọc giá, danh mục, tìm kiếm
    @GetMapping("/public")
    public ResponseEntity<List<CourseResponse>> getPublishedCourses(
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "all") String priceType,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal minPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal maxPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long categoryId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(courseService.getAllPublishedCourses(priceType, minPrice, maxPrice, categoryId, search));
    }

    // Xem chi tiết khóa học bằng slug
    @GetMapping("/public/{slug}")
    public ResponseEntity<CourseResponse> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    // Xem chi tiết khóa học bằng ID (cho Giảng viên soạn bài / Admin / Học viên)
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(courseService.getCourseById(id, email));
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

    // Giảng viên gửi yêu cầu xóa khóa học -> Chờ Admin duyệt (-> PENDING_DELETE)
    @PostMapping("/{id}/request-delete")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> requestDeleteCourse(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.requestDeleteCourse(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseDeleteResponse> deleteCourse(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.deleteCourse(id, authentication.getName()));
    }

    // Khôi phục khóa học từ Lưu trữ hoặc Đã xóa
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<CourseResponse> restoreCourse(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(courseService.restoreCourse(id, authentication.getName()));
    }

    // Danh sách khóa học do Giảng viên hiện tại tạo
    @GetMapping("/my-teaching")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<CourseResponse>> getMyTeachingCourses(Authentication authentication) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(authentication.getName()));
    }
}
