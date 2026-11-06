-- =============================================================================
-- V17__backfill_missing_enrollments.sql
-- Bù bản ghi ghi danh (enrollments) cho tất cả order_item thuộc đơn hàng COMPLETED
-- =============================================================================

INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed)
SELECT o.user_id, oi.course_id, COALESCE(o.created_at, NOW(6)), 0.00, 0
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'COMPLETED'
  AND NOT EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = o.user_id AND e.course_id = oi.course_id
  );
