package com.lms.lms_backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.instructor.CourseStudentProgressResponse;
import com.lms.lms_backend.service.EnrollmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/instructor/courses", "/api/instructor/courses"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'INSTRUCTOR', 'ROLE_ADMIN', 'ADMIN')")
public class InstructorCourseController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/{courseId}/progress")
    public ResponseEntity<List<CourseStudentProgressResponse>> getCourseStudentProgress(
            @PathVariable Long courseId,
            Principal principal
    ) {
        return ResponseEntity.ok(enrollmentService.getCourseStudentProgress(principal.getName(), courseId));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<CourseStudentProgressResponse>> getAllCoursesStudentProgress(
            Principal principal
    ) {
        return ResponseEntity.ok(enrollmentService.getAllCoursesStudentProgress(principal.getName()));
    }
}
