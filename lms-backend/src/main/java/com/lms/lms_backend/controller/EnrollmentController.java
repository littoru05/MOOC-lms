package com.lms.lms_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.enrollment.EnrollmentRequest;
import com.lms.lms_backend.dto.enrollment.EnrollmentResponse;
import com.lms.lms_backend.service.EnrollmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/enrollments", "/api/enrollments"})
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // Đăng ký khóa học
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            @Valid @RequestBody EnrollmentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(enrollmentService.enrollCourse(authentication.getName(), request.getCourseId()));
    }

    // Lấy danh sách khóa học tôi đã đăng ký (My Learning)
    @GetMapping("/my-learning")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(authentication.getName()));
    }

    // Kiểm tra xem đã đăng ký khóa học này chưa
    @GetMapping("/check/{courseId}")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        boolean enrolled = enrollmentService.isEnrolled(authentication.getName(), courseId);
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }
}
