package com.lms.lms_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Section;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseIdOrderByOrderIndexAsc(Long courseId);
}
