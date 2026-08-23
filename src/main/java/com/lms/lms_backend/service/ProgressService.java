package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.progress.LessonCompleteRequest;
import com.lms.lms_backend.dto.progress.LessonProgressResponse;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.LessonProgress;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public LessonProgressResponse completeLesson(String userEmail, LessonCompleteRequest req) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Enrollment enrollment = enrollmentRepository.findById(req.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Thông tin ghi danh không tồn tại!"));

        if (!enrollment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không sở hữu lượt ghi danh này!");
        }

        Lesson lesson = lessonRepository.findById(req.getLessonId())
                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại!"));

        // 1. Upsert LessonProgress
        LessonProgress progress = lessonProgressRepository
                .findByEnrollmentIdAndLessonId(enrollment.getId(), lesson.getId())
                .orElse(LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .build());

        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);

        // 2. Tính lại % tiến độ của cả khóa học: (completed / total) * 100
        Long courseId = enrollment.getCourse().getId();
        long totalLessons = lessonRepository.countByCourseId(courseId);
        long completedLessons = lessonProgressRepository.countCompletedLessonsByEnrollmentId(enrollment.getId());

        BigDecimal percentage = BigDecimal.ZERO;
        if (totalLessons > 0) {
            percentage = BigDecimal.valueOf((double) completedLessons / totalLessons * 100)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        enrollment.setProgressPercent(percentage);
        if (percentage.compareTo(BigDecimal.valueOf(100.00)) >= 0) {
            enrollment.setIsCompleted(true);
        }
        enrollmentRepository.save(enrollment);

        return LessonProgressResponse.builder()
                .enrollmentId(enrollment.getId())
                .lessonId(lesson.getId())
                .isCompleted(true)
                .completedAt(progress.getCompletedAt())
                .progressPercent(percentage)
                .isCourseCompleted(enrollment.getIsCompleted())
                .build();
    }

    public List<LessonProgressResponse> getProgressByEnrollment(String userEmail, Long enrollmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Thông tin ghi danh không tồn tại!"));

        if (!enrollment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xem tiến độ của lượt ghi danh này!");
        }

        return lessonProgressRepository.findByEnrollmentId(enrollmentId).stream()
                .map(lp -> LessonProgressResponse.builder()
                        .enrollmentId(lp.getEnrollment().getId())
                        .lessonId(lp.getLesson().getId())
                        .isCompleted(lp.getIsCompleted())
                        .completedAt(lp.getCompletedAt())
                        .progressPercent(enrollment.getProgressPercent())
                        .isCourseCompleted(enrollment.getIsCompleted())
                        .build())
                .collect(Collectors.toList());
    }
}
