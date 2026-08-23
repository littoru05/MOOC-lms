package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.progress.LessonCompleteRequest;
import com.lms.lms_backend.dto.progress.LessonProgressResponse;
import com.lms.lms_backend.service.ProgressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/learning", "/api/learning", "/api/v1/progress", "/api/progress"})
@RequiredArgsConstructor
public class LearningController {

    private final ProgressService progressService;

    // Đánh dấu hoàn thành bài học và tự động tính lại % tiến độ (SD03)
    @PostMapping("/complete")
    public ResponseEntity<LessonProgressResponse> completeLesson(
            @Valid @RequestBody LessonCompleteRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(progressService.completeLesson(authentication.getName(), request));
    }

    // Lấy tiến độ các bài học trong lượt ghi danh
    @GetMapping("/progress/{enrollmentId}")
    public ResponseEntity<List<LessonProgressResponse>> getProgress(
            @PathVariable Long enrollmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(progressService.getProgressByEnrollment(authentication.getName(), enrollmentId));
    }
}
