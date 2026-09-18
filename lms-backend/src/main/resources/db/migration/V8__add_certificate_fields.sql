-- V8: Add final_score and total_duration_minutes to certificates table
ALTER TABLE certificates
    ADD COLUMN final_score INT NULL DEFAULT NULL,
    ADD COLUMN total_duration_minutes INT NULL DEFAULT NULL;
