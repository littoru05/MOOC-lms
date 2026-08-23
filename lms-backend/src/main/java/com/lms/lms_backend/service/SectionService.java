package com.lms.lms_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.section.SectionRequest;
import com.lms.lms_backend.dto.section.SectionResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.SectionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;

    public List<SectionResponse> getSectionsByCourse(Long courseId) {
        return sectionRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::mapToResponse)
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

        return mapToResponse(sectionRepository.save(section));
    }

    @Transactional
    public SectionResponse updateSection(Long id, SectionRequest req) {
        Section section = getSectionEntityById(id);
        section.setTitle(req.getTitle());
        if (req.getOrderIndex() != null) {
            section.setOrderIndex(req.getOrderIndex());
        }
        return mapToResponse(sectionRepository.save(section));
    }

    @Transactional
    public void deleteSection(Long id) {
        Section section = getSectionEntityById(id);
        sectionRepository.delete(section);
    }

    private SectionResponse mapToResponse(Section s) {
        return SectionResponse.builder()
                .id(s.getId())
                .courseId(s.getCourse().getId())
                .title(s.getTitle())
                .orderIndex(s.getOrderIndex())
                .build();
    }
}
