package com.lms.lms_backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.lesson.LessonResponse;
import com.lms.lms_backend.dto.section.SectionRequest;
import com.lms.lms_backend.dto.section.SectionResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.SectionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public List<SectionResponse> getSectionsByCourse(Long courseId) {
        List<Section> sections = sectionRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        if (sections.isEmpty()) {
            return Collections.emptyList();
        }

        // Tối ưu N+1: Lấy toàn bộ Lesson của các Section trong 1 query IN duy nhất
        List<Long> sectionIds = sections.stream().map(Section::getId).collect(Collectors.toList());
        List<Lesson> lessons = lessonRepository.findBySectionIdInOrderByOrderIndexAsc(sectionIds);

        Map<Long, List<LessonResponse>> lessonsBySectionId = lessons.stream()
                .map(this::mapLessonToResponse)
                .collect(Collectors.groupingBy(LessonResponse::getSectionId));

        return sections.stream()
                .map(s -> SectionResponse.builder()
                        .id(s.getId())
                        .courseId(s.getCourse().getId())
                        .title(s.getTitle())
                        .orderIndex(s.getOrderIndex())
                        .lessons(lessonsBySectionId.getOrDefault(s.getId(), new ArrayList<>()))
                        .build())
                .collect(Collectors.toList());
    }

    public Section getSectionEntityById(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chương học không tồn tại với ID: " + id));
    }

    @Transactional
    public SectionResponse createSection(SectionRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        Section section = Section.builder()
                .title(req.getTitle())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 1)
                .course(course)
                .build();

        Section saved = sectionRepository.save(section);
        return mapToResponse(saved);
    }

    @Transactional
    public SectionResponse updateSection(Long id, SectionRequest req) {
        Section section = getSectionEntityById(id);
        section.setTitle(req.getTitle());
        if (req.getOrderIndex() != null) {
            section.setOrderIndex(req.getOrderIndex());
        }
        Section saved = sectionRepository.save(section);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteSection(Long id) {
        Section section = getSectionEntityById(id);
        sectionRepository.delete(section);
    }

    private SectionResponse mapToResponse(Section s) {
        List<LessonResponse> lessonResponses = lessonRepository.findBySectionIdOrderByOrderIndexAsc(s.getId()).stream()
                .map(this::mapLessonToResponse)
                .collect(Collectors.toList());

        return SectionResponse.builder()
                .id(s.getId())
                .courseId(s.getCourse().getId())
                .title(s.getTitle())
                .orderIndex(s.getOrderIndex())
                .lessons(lessonResponses)
                .build();
    }

    private LessonResponse mapLessonToResponse(Lesson l) {
        return LessonResponse.builder()
                .id(l.getId())
                .sectionId(l.getSection() != null ? l.getSection().getId() : null)
                .title(l.getTitle())
                .contentType(l.getContentType())
                .contentUrl(l.getContentUrl())
                .durationMinutes(l.getDurationMinutes())
                .orderIndex(l.getOrderIndex())
                .build();
    }
}
