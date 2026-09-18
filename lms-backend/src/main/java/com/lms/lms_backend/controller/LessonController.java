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

import com.lms.lms_backend.dto.lesson.LessonRequest;
import com.lms.lms_backend.dto.lesson.LessonResponse;
import com.lms.lms_backend.service.LessonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/lessons", "/api/lessons"})
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<LessonResponse>> getLessonsBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(lessonService.getLessonsBySection(sectionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLessonById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(lessonService.getLessonById(id, email));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<LessonResponse> createLesson(@Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.createLesson(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable Long id, @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<String> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok("Xóa bài học thành công!");
    }
}
