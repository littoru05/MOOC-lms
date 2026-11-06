-- =============================================================================
-- V18__create_quiz_for_published_courses.sql
-- Tự động tạo Quiz (3 câu hỏi x 4 đáp án) cho mọi khóa PUBLISHED chưa có Quiz
-- Không dùng ID cứng, tìm bằng SELECT
-- =============================================================================

-- 1. Thêm Quiz cho các khóa học PUBLISHED chưa có Quiz
INSERT INTO quizzes (course_id, title, passing_score, duration_minutes)
SELECT c.id, CONCAT('Khảo thí Năng lực & Kiến thức: ', c.title), 80, 20
FROM courses c
WHERE c.status = 'PUBLISHED'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.course_id = c.id);

-- 2. Thêm 3 câu hỏi cho mỗi Quiz vừa được tạo (hoặc Quiz của khóa PUBLISHED chưa có câu hỏi)
-- Câu 1:
INSERT INTO questions (quiz_id, question_text, point)
SELECT q.id, CONCAT('Mục tiêu kiến trúc và nguyên lý cốt lõi của khóa học "', c.title, '" tập trung vào yếu tố nào?'), 1
FROM quizzes q
JOIN courses c ON q.course_id = c.id
WHERE c.status = 'PUBLISHED'
  AND NOT EXISTS (SELECT 1 FROM questions qs WHERE qs.quiz_id = q.id);

-- Câu 2:
INSERT INTO questions (quiz_id, question_text, point)
SELECT q.id, CONCAT('Trong quá trình triển khai thực tế khóa học "', c.title, '", phương pháp tối ưu hóa hiệu năng và mở rộng hệ thống hiệu quả nhất là gì?'), 1
FROM quizzes q
JOIN courses c ON q.course_id = c.id
WHERE c.status = 'PUBLISHED'
  AND (SELECT COUNT(*) FROM questions qs WHERE qs.quiz_id = q.id) = 1;

-- Câu 3:
INSERT INTO questions (quiz_id, question_text, point)
SELECT q.id, CONCAT('Nguyên tắc kiểm thử tự động, chuẩn an toàn thông tin và quy trình phát hành nào cần áp dụng cho "', c.title, '"?'), 1
FROM quizzes q
JOIN courses c ON q.course_id = c.id
WHERE c.status = 'PUBLISHED'
  AND (SELECT COUNT(*) FROM questions qs WHERE qs.quiz_id = q.id) = 2;

-- 3. Thêm 4 đáp án (1 đúng, 3 sai) cho mỗi câu hỏi chưa có đáp án
-- Đáp án 1 (ĐÚNG):
INSERT INTO answers (question_id, answer_text, is_correct)
SELECT qs.id, 'Nắm vững kiến thức nền tảng, thực hành theo chuẩn dự án thực tế và tuân thủ best practices ngành', TRUE
FROM questions qs
WHERE NOT EXISTS (SELECT 1 FROM answers a WHERE a.question_id = qs.id);

-- Đáp án 2 (SAI):
INSERT INTO answers (question_id, answer_text, is_correct)
SELECT qs.id, 'Chỉ ghi nhớ lý thuyết giáo điều mà không cần thực hành triển khai mã nguồn', FALSE
FROM questions qs
WHERE (SELECT COUNT(*) FROM answers a WHERE a.question_id = qs.id) = 1;

-- Đáp án 3 (SAI):
INSERT INTO answers (question_id, answer_text, is_correct)
SELECT qs.id, 'Bỏ qua hoàn toàn các bước kiểm thử và đưa trực tiếp vào vận hành mà không giám sát', FALSE
FROM questions qs
WHERE (SELECT COUNT(*) FROM answers a WHERE a.question_id = qs.id) = 2;

-- Đáp án 4 (SAI):
INSERT INTO answers (question_id, answer_text, is_correct)
SELECT qs.id, 'Sử dụng cấu hình mặc định không an toàn và vô hiệu hóa các lớp kiểm soát bảo mật', FALSE
FROM questions qs
WHERE (SELECT COUNT(*) FROM answers a WHERE a.question_id = qs.id) = 3;
