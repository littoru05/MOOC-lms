-- =============================================================================
-- V19__backfill_enrollment_progress_percent.sql
-- Tính lại chính xác progress_percent của tất cả enrollment từ lesson_progress
-- Phép chia số thực làm tròn 2 chữ số (VD: 2/7 bài = 28.57%)
-- =============================================================================

UPDATE enrollments e
JOIN (
    SELECT e_inner.id AS enrollment_id,
           (SELECT COUNT(DISTINCT l.id)
            FROM lessons l
            JOIN sections s ON l.section_id = s.id
            WHERE s.course_id = e_inner.course_id) AS total_lessons,
           (SELECT COUNT(DISTINCT lp.lesson_id)
            FROM lesson_progress lp
            WHERE lp.enrollment_id = e_inner.id AND lp.is_completed = 1) AS completed_lessons
    FROM enrollments e_inner
) stats ON e.id = stats.enrollment_id
SET e.progress_percent = CASE
    WHEN stats.total_lessons > 0 THEN ROUND((stats.completed_lessons * 100.0) / stats.total_lessons, 2)
    ELSE 0.00
END,
e.is_completed = CASE
    WHEN stats.total_lessons > 0 AND stats.completed_lessons >= stats.total_lessons THEN 1
    ELSE e.is_completed
END;
