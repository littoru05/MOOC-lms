-- =============================================================================
-- V14__create_notifications.sql
-- Create notifications table, index, add rejection_reason to courses,
-- and backfill notifications for active admins for pending courses.
-- =============================================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255) NULL,
    course_id BIGINT NULL,
    actor_id BIGINT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_recipient_read_created ON notifications (recipient_id, is_read, created_at);

-- 2. Add optional rejection_reason column to courses
ALTER TABLE courses ADD COLUMN rejection_reason VARCHAR(500) NULL;

-- 3. Backfill: generate notifications for all active admins for existing PENDING and PENDING_DELETE courses
INSERT INTO notifications (recipient_id, type, title, message, link, course_id, actor_id, is_read, created_at)
SELECT 
    u.id AS recipient_id,
    CASE 
        WHEN c.status = 'PENDING_DELETE' THEN 'COURSE_DELETE_REQUESTED'
        ELSE 'COURSE_SUBMITTED'
    END AS type,
    CASE 
        WHEN c.status = 'PENDING_DELETE' THEN 'Yêu cầu xóa khóa học'
        ELSE 'Khóa học mới chờ duyệt'
    END AS title,
    CASE 
        WHEN c.status = 'PENDING_DELETE' THEN CONCAT(COALESCE(inst.full_name, 'Giảng viên'), ' đã yêu cầu xóa khóa học "', c.title, '"')
        ELSE CONCAT(COALESCE(inst.full_name, 'Giảng viên'), ' đã gửi duyệt khóa học "', c.title, '"')
    END AS message,
    CONCAT('/admin/courses/approval?courseId=', c.id) AS link,
    c.id AS course_id,
    c.instructor_id AS actor_id,
    FALSE AS is_read,
    COALESCE(c.created_at, CURRENT_TIMESTAMP(6)) AS created_at
FROM courses c
JOIN users inst ON c.instructor_id = inst.id
CROSS JOIN users u
WHERE u.role = 'ROLE_ADMIN' AND u.is_active = TRUE
  AND c.status IN ('PENDING', 'PENDING_DELETE')
  AND (c.is_deleted IS NULL OR c.is_deleted = FALSE);

