-- =============================================================================
-- V15__create_audit_logs.sql
-- Create audit_logs table, indexes, and backfill initial creation logs.
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_label VARCHAR(255) NULL,
    details VARCHAR(1000) NULL,
    course_owner_id BIGINT NULL,
    created_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_logs_course_owner FOREIGN KEY (course_owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_owner_created ON audit_logs (course_owner_id, created_at);
CREATE INDEX idx_audit_logs_actor_created ON audit_logs (actor_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- Backfill: Mỗi khóa học hiện có 1 dòng "Tạo khóa học" theo created_at
INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, entity_label, details, course_owner_id, created_at)
SELECT 
    instructor_id AS actor_id,
    'COURSE_CREATED' AS action,
    'COURSE' AS entity_type,
    id AS entity_id,
    title AS entity_label,
    'Khởi tạo khóa học ban đầu' AS details,
    instructor_id AS course_owner_id,
    COALESCE(created_at, CURRENT_TIMESTAMP(6)) AS created_at
FROM courses
WHERE instructor_id IS NOT NULL;

