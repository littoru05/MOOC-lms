package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    List<Enrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
    List<Enrollment> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    long countByIsCompleted(Boolean isCompleted);

    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course c " +
           "WHERE e.user.id = :userId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByUserIdWithCourseOrderByEnrolledAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT e.user.id) FROM Enrollment e " +
           "WHERE e.course.instructor.id = :instructorId")
    long countDistinctStudentsByInstructorId(@Param("instructorId") Long instructorId);

    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.user u " +
           "JOIN FETCH e.course c " +
           "WHERE c.id = :courseId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByCourseIdWithUserAndCourse(@Param("courseId") Long courseId);

    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.user u " +
           "JOIN FETCH e.course c " +
           "WHERE c.instructor.id = :instructorId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByInstructorIdWithUserAndCourse(@Param("instructorId") Long instructorId);
}
