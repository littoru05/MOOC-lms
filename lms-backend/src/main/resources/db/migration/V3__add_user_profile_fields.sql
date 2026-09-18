-- =============================================================================
-- V3__add_user_profile_fields.sql
-- Add Profile Details & Instructor Fields to Users Table
-- =============================================================================

ALTER TABLE users 
    ADD COLUMN phone VARCHAR(20) NULL,
    ADD COLUMN date_of_birth DATE NULL,
    ADD COLUMN gender VARCHAR(10) NULL,
    ADD COLUMN title VARCHAR(150) NULL,
    ADD COLUMN bio TEXT NULL,
    ADD COLUMN teaching_field VARCHAR(100) NULL;
