-- V4: Add price column to courses table
ALTER TABLE courses ADD COLUMN price DECIMAL(12,0) DEFAULT 0 NOT NULL;
