package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    List<Enrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);
    List<Enrollment> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    long countByIsCompleted(Boolean isCompleted);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.user u " +
           "JOIN FETCH e.course c " +
           "WHERE c.id = :courseId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByCourseIdWithUserAndCourse(@org.springframework.data.repository.query.Param("courseId") Long courseId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.user u " +
           "JOIN FETCH e.course c " +
           "WHERE c.instructor.id = :instructorId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByInstructorIdWithUserAndCourse(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);
}
