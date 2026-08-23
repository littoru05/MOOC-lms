package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.LessonProgress;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);

    List<LessonProgress> findByEnrollmentId(Long enrollmentId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp " +
           "WHERE lp.enrollment.id = :enrollmentId " +
           "AND lp.isCompleted = true")
    long countCompletedLessonsByEnrollmentId(@Param("enrollmentId") Long enrollmentId);
}
