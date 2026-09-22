package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByStatus(CourseStatus status);
    List<Course> findByStatusAndIsDeletedFalse(CourseStatus status);
    List<Course> findByStatusIn(List<CourseStatus> statuses);
    List<Course> findByStatusInAndIsDeletedFalse(List<CourseStatus> statuses);
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByInstructorIdAndIsDeletedFalse(Long instructorId);
    boolean existsBySlug(String slug);
    long countByStatus(CourseStatus status);
    long countByStatusAndIsDeletedFalse(CourseStatus status);
    long countByStatusIn(List<CourseStatus> statuses);
    long countByStatusInAndIsDeletedFalse(List<CourseStatus> statuses);
    long countByIsDeletedFalse();
}
