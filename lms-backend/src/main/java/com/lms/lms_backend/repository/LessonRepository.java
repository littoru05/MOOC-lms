package com.lms.lms_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySectionIdOrderByOrderIndexAsc(Long sectionId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.section.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
}
