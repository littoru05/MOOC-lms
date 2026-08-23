package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.quiz.QuizCreateRequest;
import com.lms.lms_backend.dto.quiz.QuizResponse;
import com.lms.lms_backend.dto.quiz.QuizResultResponse;
import com.lms.lms_backend.dto.quiz.QuizSubmissionRequest;
import com.lms.lms_backend.service.QuizService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/quizzes", "/api/quizzes"})
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // Giảng viên tạo đề thi Quiz trọn gói (SD04)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizCreateRequest request) {
        return ResponseEntity.ok(quizService.createFullQuiz(request));
    }

    // Lấy đề thi Quiz theo ID khóa học (cho học viên làm bài -> ẩn is_correct)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourseId(courseId, true));
    }

    // Lấy chi tiết bài Quiz theo ID
    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id, true));
    }

    // Học viên nộp bài thi Quiz -> Tự động chấm điểm & Cấp chứng chỉ nếu đủ điều kiện (SD05)
    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizSubmissionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(quizService.submitQuiz(id, request, authentication.getName()));
    }
}
