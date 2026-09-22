-- V9: Add soft delete columns to courses and update broken UI/UX course thumbnail
ALTER TABLE courses ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE courses ADD COLUMN deleted_at DATETIME NULL;

-- Update broken Unsplash thumbnail for Course 5 (UI/UX Design)
UPDATE courses 
SET thumbnail_url = 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800' 
WHERE id = 5 OR slug = 'thiet-ke-ui-ux-figma-design-system';
