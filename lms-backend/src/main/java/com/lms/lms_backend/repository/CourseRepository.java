package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByStatus(CourseStatus status);
    List<Course> findByInstructorId(Long instructorId);
    boolean existsBySlug(String slug);
    long countByStatus(CourseStatus status);
}
