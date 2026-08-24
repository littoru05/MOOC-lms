-- =============================================================================
-- V2__seed_data.sql
-- Initial Seed Data for MOOC LMS
-- Password Hashes generated via BCryptPasswordEncoder
-- (admin123, instructor123, student123)
-- =============================================================================

-- 1. Seed Users (passwords: admin123, instructor123, student123)
INSERT IGNORE INTO users (id, username, email, password_hash, full_name, avatar_url, role, is_active, created_at)
VALUES
(1, 'admin', 'admin@lms.com', '$2a$10$WhfpruvsLLkC1QpUC7NrP.Pmx.0Fo54PoKOkkN46Tsj.379arbZn.', 'Quản trị viên Hệ thống', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ROLE_ADMIN', TRUE, NOW(6)),
(2, 'instructor', 'instructor@lms.com', '$2a$10$JMi5rl8JZyXKjs6lbjCq7ubW43dfa5MoQCI.NrjhH4MwiWQ/3Ayr.', 'TS. Nguyễn Văn A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ROLE_INSTRUCTOR', TRUE, NOW(6)),
(3, 'student', 'student@lms.com', '$2a$10$G818nbQhpb30jQqzXacI7.aJ3mUeYzcrXd/ft7LnJaXu5j2eXDMJ2', 'Trần Văn Học Viên', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ROLE_STUDENT', TRUE, NOW(6));

-- 2. Seed Categories
INSERT IGNORE INTO categories (id, name, slug, description)
VALUES
(1, 'Lập trình Web', 'lap-trinh-web', 'Các khóa học phát triển ứng dụng Web Frontend và Backend hiện đại'),
(2, 'Trí tuệ nhân tạo & Data Science', 'ai-data-science', 'Học máy, xử lý ngôn ngữ tự nhiên và phân tích dữ liệu lớn'),
(3, 'Lập trình Di động', 'lap-trinh-di-dong', 'Xây dựng ứng dụng di động đa nền tảng React Native, Flutter');

-- 3. Seed Courses
INSERT IGNORE INTO courses (id, instructor_id, category_id, title, slug, description, thumbnail_url, status, created_at)
VALUES
(1, 2, 1, 'Lập trình Web Fullstack với Spring Boot 3 & ReactJS 19', 'fullstack-spring-boot-reactjs', 'Làm chủ kiến trúc Monolithic 3-Layer, Spring Security JWT, JPA Hibernate và xây dựng Single Page Application hiện đại với React 19 & Tailwind CSS.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', 'PUBLISHED', NOW(6)),
(2, 2, 2, 'Trí tuệ nhân tạo & Machine Learning thực chiến với Python', 'python-machine-learning-co-ban', 'Nắm vững toán học học máy, tiền xử lý dữ liệu với Pandas/NumPy và xây dựng các mô hình phân loại, hồi quy, Deep Learning với Scikit-learn & PyTorch.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', 'PUBLISHED', NOW(6)),
(3, 2, 3, 'Phát triển Ứng dụng Di động Đa nền tảng với React Native & Expo', 'react-native-cross-platform', 'Xây dựng ứng dụng di động iOS và Android từ một codebase duy nhất với React Native, Expo, Redux Toolkit và tích hợp REST API chuyên nghiệp.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 'PUBLISHED', NOW(6)),
(4, 2, 1, 'Chuyên sâu Microservices & Cloud Native với Docker, Kubernetes & AWS', 'microservices-cloud-native-devops', 'Xây dựng kiến trúc hệ thống phân tán chịu tải cao, triển khai CI/CD tự động và giám sát hệ thống với Prometheus, Grafana trên nền tảng AWS Cloud.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'PUBLISHED', NOW(6)),
(5, 2, 1, 'Thiết kế UI/UX Sản phẩm Chuyên nghiệp với Figma & Design Systems', 'thiet-ke-ui-ux-figma-design-system', 'Làm chủ quy trình nghiên cứu người dùng, thiết kế wireframe, prototype tương tác cao và xây dựng Design System quy chuẩn cho Web & Mobile.', 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800', 'PUBLISHED', NOW(6)),
(6, 2, 2, 'An toàn Thông tin & Bảo mật Ứng dụng Web (OWASP Top 10)', 'an-toan-thong-tin-web-security-owasp', 'Phân tích và phòng chống các lỗ hổng bảo mật nghiêm trọng (SQL Injection, XSS, CSRF, SSRF, JWT Attacks) và bảo vệ hệ thống trước các cuộc tấn công mạng.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', 'PUBLISHED', NOW(6));

-- 4. Seed Sections
INSERT IGNORE INTO sections (id, course_id, title, order_index)
VALUES
(1, 1, 'Tổng quan Kiến trúc & Thiết lập Môi trường', 1),
(2, 1, 'Phát triển Backend 3-Layer với Spring Boot 3', 2),
(3, 1, 'Nghiệp vụ Nâng cao (Tiến độ, Khảo thí & Chứng chỉ)', 3),
(4, 1, 'Phát triển Frontend React 19 & Tích hợp', 4),
(5, 2, 'Nền tảng Python & Khoa học Dữ liệu', 1),
(6, 2, 'Các thuật toán Machine Learning Cốt lõi', 2),
(7, 3, 'Thiết lập Expo & React Native Core', 1),
(8, 4, 'Kiến trúc Microservices & Phân rã Dịch vụ', 1),
(9, 5, 'Nguyên lý Thiết kế Giao diện & Làm chủ Figma', 1),
(10, 6, 'Tổng quan An ninh Mạng & OWASP Top 10', 1);

-- 5. Seed Lessons
INSERT IGNORE INTO lessons (id, section_id, title, content_type, content_url, duration_minutes, order_index)
VALUES
(1, 1, '1.1 Giới thiệu kiến trúc hệ thống E-Learning MOOC', 'VIDEO', 'https://www.youtube.com/embed/9SGDpanrc8U', 18, 1),
(2, 1, '1.2 Hướng dẫn cài đặt Java 21, MySQL 8.0 & Spring Boot', 'DOCUMENT', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 20, 2),
(3, 1, '1.3 Phân tích nghiệp vụ 6 phân hệ và 11 Bảng CSDL', 'VIDEO', 'https://www.youtube.com/embed/7S_tz1z_5bA', 25, 3),
(4, 2, '2.1 Định nghĩa 11 JPA Entities và thiết lập mối quan hệ', 'VIDEO', 'https://www.youtube.com/embed/31KTdfRH6nY', 30, 1),
(5, 2, '2.2 Cấu hình Spring Security 6 & Bộ lọc xác thực JWT', 'VIDEO', 'https://www.youtube.com/embed/KxqlJblhzfI', 40, 2),
(6, 3, '3.1 Thuật toán tính % tiến độ học tập thời gian thực', 'VIDEO', 'https://www.youtube.com/embed/31KTdfRH6nY', 25, 1),
(7, 4, '4.1 Khởi tạo dự án Vite, Tailwind CSS & Cấu hình Theme', 'VIDEO', 'https://www.youtube.com/embed/bMknfKXIFA8', 25, 1),
(8, 5, '1.1 Giới thiệu hệ sinh thái AI và Python cho Data Science', 'VIDEO', 'https://www.youtube.com/embed/rfscVS0vtbw', 20, 1),
(9, 5, '1.2 Thao tác mảng đa chiều hiệu năng cao với NumPy', 'VIDEO', 'https://www.youtube.com/embed/rfscVS0vtbw', 25, 2),
(10, 6, '2.1 Thuật toán Hồi quy tuyến tính (Linear Regression)', 'VIDEO', 'https://www.youtube.com/embed/7eh4d6sabA0', 30, 1),
(11, 6, '2.2 Deep Learning với PyTorch & Neural Networks', 'VIDEO', 'https://www.youtube.com/embed/V_xro1bcAuA', 35, 2),
(12, 7, '1.1 Cài đặt Expo CLI và chạy app trên thiết bị thật', 'VIDEO', 'https://www.youtube.com/embed/0-S5a0eXPoc', 20, 1),
(13, 7, '1.2 Sử dụng View, Text, FlatList & Flexbox Layout', 'VIDEO', 'https://www.youtube.com/embed/0-S5a0eXPoc', 25, 2),
(14, 8, '1.1 So sánh Monolithic vs Microservices & Spring Cloud', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 30, 1),
(15, 9, '1.1 Bố cục thị giác, 8pt Grid & Auto Layout 5.0 trong Figma', 'VIDEO', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 25, 1),
(16, 10, '1.1 Giới thiệu mô hình phòng thủ & Phân tích lỗ hổng SQL Injection', 'VIDEO', 'https://www.youtube.com/embed/2_lswM1S264', 25, 1);

-- 6. Seed Quizzes
INSERT IGNORE INTO quizzes (id, course_id, title, passing_score, duration_minutes)
VALUES
(1, 1, 'Bài kiểm tra Đánh giá Năng lực Cuối khóa (Final Assessment)', 80, 15);

-- 7. Seed Questions
INSERT IGNORE INTO questions (id, quiz_id, question_text, point)
VALUES
(1, 1, 'Kiến trúc Monolithic 3-Layer trong hệ thống bao gồm 3 tầng chính nào?', 1),
(2, 1, 'Điều kiện để học viên được hệ thống tự động cấp Chứng chỉ số tốt nghiệp (Certificate) là gì?', 1),
(3, 1, 'Định dạng xác thực chuẩn của token JWT truyền trong HTTP Header là gì?', 1);

-- 8. Seed Answers
INSERT IGNORE INTO answers (id, question_id, answer_text, is_correct)
VALUES
(1, 1, 'Presentation (Controller), Business Logic (Service), Data Access (Repository)', TRUE),
(2, 1, 'HTML, CSS, JavaScript', FALSE),
(3, 1, 'Docker, Kubernetes, Nginx', FALSE),
(4, 1, 'Model, View, Template', FALSE),
(5, 2, 'Chỉ cần bấm ghi danh vào khóa học', FALSE),
(6, 2, 'Hoàn thành 100% các bài học và đạt điểm bài Quiz >= Passing Score', TRUE),
(7, 2, 'Chỉ cần xem xong 1 video bài giảng', FALSE),
(8, 2, 'Chờ quản trị viên duyệt thủ công', FALSE),
(9, 3, 'Authorization: Bearer <token>', TRUE),
(10, 3, 'Token: Basic <token>', FALSE),
(11, 3, 'Cookie: SessionID=<token>', FALSE),
(12, 3, 'Auth: API_KEY=<token>', FALSE);

-- 9. Seed Enrollment for Student in Course 1
INSERT IGNORE INTO enrollments (id, user_id, course_id, enrolled_at, progress_percent, is_completed)
VALUES
(1, 3, 1, NOW(6), 28.00, FALSE);

-- 10. Seed Lesson Progress
INSERT IGNORE INTO lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at)
VALUES
(1, 1, 1, TRUE, NOW(6)),
(2, 1, 2, TRUE, NOW(6));
