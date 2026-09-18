package com.lms.lms_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.lesson.LessonRequest;
import com.lms.lms_backend.dto.lesson.LessonResponse;
import com.lms.lms_backend.entity.ContentType;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;

    public List<LessonResponse> getLessonsBySection(Long sectionId) {
        return lessonRepository.findBySectionIdOrderByOrderIndexAsc(sectionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LessonResponse getLessonById(Long id, String userEmail) {
        Lesson lesson = getLessonEntityById(id);
        Course course = lesson.getSection() != null ? lesson.getSection().getCourse() : null;

        if (course != null && course.getStatus() == CourseStatus.PUBLISHED) {
            return mapToResponse(lesson);
        }

        if (userEmail == null) {
            throw new RuntimeException("Bạn không có quyền truy cập bài học chưa xuất bản!");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (course != null && !course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền xem bài học của giảng viên khác!");
        }

        return mapToResponse(lesson);
    }

    public Lesson getLessonEntityById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại với ID: " + id));
    }

    @Transactional
    public LessonResponse createLesson(LessonRequest req) {
        Section section = sectionRepository.findById(req.getSectionId())
                .orElseThrow(() -> new RuntimeException("Chương học không tồn tại!"));

        Lesson lesson = Lesson.builder()
                .title(req.getTitle())
                .contentType(req.getContentType() != null ? req.getContentType() : ContentType.VIDEO)
                .contentUrl(req.getContentUrl())
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 0)
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 1)
                .section(section)
                .build();

        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest req) {
        Lesson lesson = getLessonEntityById(id);
        lesson.setTitle(req.getTitle());
        if (req.getContentType() != null) {
            lesson.setContentType(req.getContentType());
        }
        lesson.setContentUrl(req.getContentUrl());
        if (req.getDurationMinutes() != null) {
            lesson.setDurationMinutes(req.getDurationMinutes());
        }
        if (req.getOrderIndex() != null) {
            lesson.setOrderIndex(req.getOrderIndex());
        }
        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = getLessonEntityById(id);
        lessonRepository.delete(lesson);
    }

    private LessonResponse mapToResponse(Lesson l) {
        return LessonResponse.builder()
                .id(l.getId())
                .sectionId(l.getSection().getId())
                .title(l.getTitle())
                .contentType(l.getContentType())
                .contentUrl(l.getContentUrl())
                .durationMinutes(l.getDurationMinutes())
                .orderIndex(l.getOrderIndex())
                .build();
    }
}
