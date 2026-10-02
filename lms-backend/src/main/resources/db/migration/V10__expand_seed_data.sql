-- =============================================================================
-- V10__expand_seed_data.sql
-- 1. Sửa lại category_id cho các khóa học bị gán sai lệch trong V2
-- 2. Bổ sung dữ liệu đa dạng đạt 5-12 bản ghi cho mỗi bảng (15 bảng)
-- Mật khẩu tài khoản mới (instructor123, student123) được sinh bằng BCryptPasswordEncoder thật
-- =============================================================================

-- =============================================================================
-- 1. BỔ SUNG CATEGORIES MỚI (4 -> 7)
-- =============================================================================
INSERT IGNORE INTO categories (id, name, slug, description)
VALUES
(4, 'DevOps & Cloud Computing', 'devops-cloud', 'Containerization, Kubernetes, CI/CD và kiến trúc điện toán đám mây'),
(5, 'Thiết kế UI/UX & Sản phẩm số', 'thiet-ke-ui-ux', 'Nghiên cứu người dùng, thiết kế wireframe, prototype và design systems'),
(6, 'An ninh mạng & Bảo mật Web', 'an-ninh-mang', 'Phân tích lỗ hổng OWASP, bảo mật ứng dụng web và an toàn thông tin'),
(7, 'Cơ sở dữ liệu & Data Engineering', 'co-so-du-lieu-data-engineering', 'Quản trị CSDL lớn, Apache Kafka, Spark, tối ưu truy vấn SQL và ETL Pipeline');

-- =============================================================================
-- 2. SỬA CATEGORY CHO CÁC KHÓA HỌC BỊ GÁN SAI LỆCH TRONG V2
-- =============================================================================
-- Khóa 4 (Microservices, Docker, K8s, AWS): Đúng chuyên môn DevOps & Cloud
UPDATE courses SET category_id = 4, price = 650000 WHERE id = 4;

-- Khóa 5 (Thiết kế UI/UX với Figma): Đúng chuyên môn Thiết kế UI/UX & Sản phẩm số
UPDATE courses SET category_id = 5, price = 350000 WHERE id = 5;

-- Khóa 6 (An toàn thông tin & OWASP Top 10): Đúng chuyên môn An ninh mạng & Bảo mật Web
UPDATE courses SET category_id = 6, price = 450000 WHERE id = 6;

-- Cập nhật giá chuẩn cho khóa 1, 2, 3
UPDATE courses SET price = 499000 WHERE id = 1;
UPDATE courses SET price = 599000 WHERE id = 2;
UPDATE courses SET price = 499000 WHERE id = 3;

-- =============================================================================
-- 3. BỔ SUNG USERS MỚI (Giảng viên & Học viên bổ sung)
-- Passwords sinh bằng BCryptPasswordEncoder:
-- instructor123: $2a$10$NmvgbCrVu2TcU//ZBtvmfOacoaIUMsm97SLFL8YQhHDgNJeugWbJK
-- student123:    $2a$10$4oVicJ3eUeVa68DUaihxauoJ6n41HrFdRbGIWQMnKJTwMNBf3PSmu
-- =============================================================================
INSERT IGNORE INTO users (id, username, email, password_hash, full_name, avatar_url, role, is_active, title, bio, teaching_field, created_at)
VALUES
(4, 'instructor2', 'instructor2@lms.com', '$2a$10$NmvgbCrVu2TcU//ZBtvmfOacoaIUMsm97SLFL8YQhHDgNJeugWbJK', 'PGS.TS. Lê Hoàng Nam', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'ROLE_INSTRUCTOR', TRUE, 'AI Research Lead & Data Specialist', 'Hơn 15 năm nghiên cứu Machine Learning và Data Streaming thời gian thực.', 'Trí tuệ nhân tạo & Data Engineering', NOW(6)),
(5, 'instructor3', 'instructor3@lms.com', '$2a$10$NmvgbCrVu2TcU//ZBtvmfOacoaIUMsm97SLFL8YQhHDgNJeugWbJK', 'ThS. Vũ Hoàng Yến', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ROLE_INSTRUCTOR', TRUE, 'Head of Product Design', '10 năm kiến tạo ngôn ngữ thiết kế sản phẩm số cho thị trường Đông Nam Á và Mỹ.', 'Thiết kế UI/UX & Design Systems', NOW(6)),
(6, 'student2', 'student2@lms.com', '$2a$10$4oVicJ3eUeVa68DUaihxauoJ6n41HrFdRbGIWQMnKJTwMNBf3PSmu', 'Nguyễn Thị Bích Ngọc', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'ROLE_STUDENT', TRUE, NULL, 'Học viên đam mê công nghệ phần mềm', NULL, NOW(6)),
(7, 'student3', 'student3@lms.com', '$2a$10$4oVicJ3eUeVa68DUaihxauoJ6n41HrFdRbGIWQMnKJTwMNBf3PSmu', 'Lê Hoàng Long', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'ROLE_STUDENT', TRUE, NULL, 'Sinh viên năm cuối ngành CNTT', NULL, NOW(6));

-- Phân bổ giảng viên cho các khóa 4, 5, 6
UPDATE courses SET instructor_id = 4 WHERE id = 4;
UPDATE courses SET instructor_id = 5 WHERE id = 5;
UPDATE courses SET instructor_id = 4 WHERE id = 6;

-- =============================================================================
-- 4. BỔ SUNG COURSES MỚI (7 -> 11)
-- =============================================================================
INSERT IGNORE INTO courses (id, instructor_id, category_id, title, slug, description, thumbnail_url, status, price, created_at)
VALUES
(7, 2, 1, 'Next.js 15 & React 19 Fullstack với TypeScript, GraphQL và Server Actions', 'nextjs-15-typescript-graphql-performance', 'Xây dựng ứng dụng web hiện đại chuẩn SEO với Next.js 15 App Router, React Server Components, GraphQL Apollo Client và Server Actions.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'PUBLISHED', 399000, NOW(6)),
(8, 4, 7, 'Xử lý Dữ liệu Lớn Thời gian Thực với Apache Kafka, Spark & Flink', 'apache-kafka-spark-big-data-streaming', 'Thiết kế hệ thống Data Streaming thông lượng cao với Apache Kafka, Spark Streaming và xây dựng đường ống phân tích dữ liệu theo thời gian thực.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'PUBLISHED', 699000, NOW(6)),
(9, 2, 1, 'Lập trình Web Căn bản cho Người mới bắt đầu (HTML5, CSS3, JavaScript)', 'lap-trinh-web-co-ban-html-css-js', 'Nắm vững kiến thức nền tảng về Web: Cấu trúc HTML5 ngữ nghĩa, bố cục CSS Flexbox/Grid hiện đại và tư duy lập trình JavaScript DOM tương tác.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', 'PUBLISHED', 0, NOW(6)),
(10, 2, 3, 'Lập trình Flutter & Dart Xây dựng App Mobile Thương mại Điện tử', 'lap-trinh-flutter-dart-ecommerce-app', 'Làm chủ Flutter Framework, Provider State Management và xây dựng ứng dụng mua sắm trực tuyến mượt mà trên iOS và Android.', 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800', 'PENDING', 299000, NOW(6)),
(11, 4, 2, 'Thiết kế Kiến trúc Trí tuệ Nhân tạo Đa tác tử với LangChain & LLM', 'tri-tue-nhan-tao-da-tac-tu-langchain-llm', 'Xây dựng Multi-Agent AI System tự động hóa quy trình doanh nghiệp, tích hợp OpenAI API, Vector Database Milvus và triển khai Agentic Workflow.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', 'DRAFT', 750000, NOW(6));

-- =============================================================================
-- 5. BỔ SUNG SECTIONS & LESSONS CHO CÁC KHÓA HỌC
-- =============================================================================
INSERT IGNORE INTO sections (id, course_id, title, order_index)
VALUES
(11, 3, 'Kiến trúc Ứng dụng & Redux Toolkit', 2),
(12, 4, 'Triển khai Kubernetes & Giám sát Hệ thống', 2),
(13, 5, 'Xây dựng Quy chuẩn Hệ thống Thiết kế (Design System)', 2),
(14, 6, 'Kỹ thuật Kiểm thử Xâm nhập & Phòng vệ Web', 2),
(15, 7, 'Next.js 15 App Router & React Server Components', 1),
(16, 7, 'Server Actions, GraphQL & Tối ưu SEO', 2),
(17, 8, 'Hạ tầng Apache Kafka & Kiến trúc Event-Driven', 1),
(18, 8, 'Xử lý Luồng Dữ liệu với Apache Spark Streaming', 2),
(19, 9, 'Nền tảng HTML5 Ngữ nghĩa & CSS3 Layout', 1),
(20, 9, 'Tư duy Lập trình JavaScript DOM & Event', 2),
(21, 10, 'Nền tảng Ngôn ngữ Dart & Cấu trúc Widget Flutter', 1),
(22, 11, 'Nguyên lý Hoạt động của LLM & LangChain Core', 1);

INSERT IGNORE INTO lessons (id, section_id, title, content_type, content_url, duration_minutes, order_index)
VALUES
(17, 11, '2.1 Cài đặt và cấu hình Redux Toolkit & RTK Query', 'VIDEO', 'https://www.youtube.com/embed/0-S5a0eXPoc', 25, 1),
(18, 11, '2.2 Tích hợp Offline Storage và Push Notifications', 'VIDEO', 'https://www.youtube.com/embed/0-S5a0eXPoc', 30, 2),
(19, 12, '2.1 Đóng gói Container Docker và xuất bản lên Docker Hub', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 35, 1),
(20, 12, '2.2 Viết Helm Chart và Deploy ứng dụng lên cụm K8s', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 40, 2),
(21, 13, '2.1 Thiết kế Token màu sắc, Typography và Spacing', 'VIDEO', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 25, 1),
(22, 13, '2.2 Xây dựng Component Library tương tác cao trong Figma', 'VIDEO', 'https://www.youtube.com/embed/FTFaQWZBqQ8', 35, 2),
(23, 14, '2.1 Khai thác và vá lỗi Cross-Site Scripting (XSS)', 'VIDEO', 'https://www.youtube.com/embed/2_lswM1S264', 30, 1),
(24, 14, '2.2 Thiết lập Content Security Policy (CSP) và CORS chuẩn', 'VIDEO', 'https://www.youtube.com/embed/2_lswM1S264', 30, 2),
(25, 15, '1.1 Khởi tạo dự án Next.js 15 và cấu hình Tailwind CSS', 'VIDEO', 'https://www.youtube.com/embed/bMknfKXIFA8', 20, 1),
(26, 15, '1.2 Phân biệt Client Components và Server Components', 'VIDEO', 'https://www.youtube.com/embed/bMknfKXIFA8', 25, 2),
(27, 16, '2.1 Xử lý đột biến dữ liệu với Server Actions an toàn', 'VIDEO', 'https://www.youtube.com/embed/bMknfKXIFA8', 30, 1),
(28, 16, '2.2 Truy vấn dữ liệu hiệu năng cao với Apollo GraphQL', 'VIDEO', 'https://www.youtube.com/embed/bMknfKXIFA8', 35, 2),
(29, 17, '1.1 Cài đặt Kafka Broker, Zookeeper và tạo Topic đầu tiên', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 25, 1),
(30, 17, '1.2 Viết Kafka Producer và Consumer tối ưu Throughput', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 30, 2),
(31, 18, '2.1 Kết nối Spark Streaming với luồng thông điệp Kafka', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 35, 1),
(32, 18, '2.2 Xử lý phân tích dữ liệu dạng Windowing thời gian thực', 'VIDEO', 'https://www.youtube.com/embed/mSZCN4wVw0I', 40, 2),
(33, 19, '1.1 Thẻ HTML5 ngữ nghĩa và chuẩn cấu trúc tài liệu Web', 'VIDEO', 'https://www.youtube.com/embed/9SGDpanrc8U', 15, 1),
(34, 19, '1.2 CSS Flexbox và Grid: Bố cục giao diện đáp ứng (Responsive)', 'VIDEO', 'https://www.youtube.com/embed/9SGDpanrc8U', 25, 2),
(35, 20, '2.1 Biến, kiểu dữ liệu, hàm và vòng lặp trong JavaScript', 'VIDEO', 'https://www.youtube.com/embed/9SGDpanrc8U', 20, 1),
(36, 20, '2.2 Bắt sự kiện người dùng và thao tác DOM động', 'VIDEO', 'https://www.youtube.com/embed/9SGDpanrc8U', 30, 2),
(37, 21, '1.1 Cài đặt Flutter SDK và tạo ứng dụng First App', 'VIDEO', 'https://www.youtube.com/embed/0-S5a0eXPoc', 20, 1),
(38, 22, '1.1 Khái niệm Prompt Engineering, Chains và Memory', 'VIDEO', 'https://www.youtube.com/embed/rfscVS0vtbw', 30, 1);

-- =============================================================================
-- 6. BỔ SUNG QUIZZES, QUESTIONS, ANSWERS
-- =============================================================================
INSERT IGNORE INTO quizzes (id, course_id, title, passing_score, duration_minutes)
VALUES
(2, 2, 'Khảo thí Kiến thức Machine Learning & Data Science', 80, 20),
(3, 3, 'Đề kiểm tra Kỹ năng Lập trình React Native & Expo', 75, 15),
(4, 4, 'Đánh giá Năng lực DevOps, Docker & Kubernetes', 80, 20),
(5, 5, 'Kiểm tra Kỹ năng Thiết kế Giao diện Figma & UI/UX', 80, 15),
(6, 6, 'Khảo sát An toàn Thông tin & Phòng vệ Web OWASP', 85, 20),
(7, 7, 'Kiểm tra Kiến trúc Next.js 15 & React Server Components', 80, 20),
(8, 8, 'Khảo thí Xử lý Dữ liệu Lớn Thời gian Thực Kafka & Spark', 80, 25);

INSERT IGNORE INTO questions (id, quiz_id, question_text, point)
VALUES
-- Quiz 2
(4, 2, 'Thư viện nào trong Python được tối ưu hóa cho các phép toán đại số tuyến tính trên mảng đa chiều?', 1),
(5, 2, 'Thuật toán Hồi quy tuyến tính (Linear Regression) tối ưu hóa hàm mất mát nào?', 1),
(6, 2, 'Trong học máy có giám sát (Supervised Learning), tập dữ liệu huấn luyện bắt buộc phải có gì?', 1),
-- Quiz 3
(7, 3, 'Expo Go cho phép lập trình viên chạy thử ứng dụng di động bằng cách nào?', 1),
(8, 3, 'Component nào trong React Native được khuyến nghị sử dụng để hiển thị danh sách lớn nhằm tiết kiệm bộ nhớ?', 1),
(9, 3, 'Trong React Native, hệ thống bố cục mặc định được xây dựng dựa trên công nghệ nào?', 1),
-- Quiz 4
(10, 4, 'Lệnh Docker nào dùng để khởi chạy container ở chế độ nền (detached mode)?', 1),
(11, 4, 'Đơn vị triển khai nhỏ nhất có thể quản lý được trong cụm Kubernetes là gì?', 1),
-- Quiz 5
(12, 5, 'Tính năng nào trong Figma cho phép các thành phần tự động co giãn theo nội dung bên trong?', 1),
(13, 5, 'Hệ thống lưới (Grid System) tiêu chuẩn phổ biến nhất trong thiết kế UI số là gì?', 1),
-- Quiz 6
(14, 6, 'Lỗ hổng SQL Injection xảy ra chủ yếu do nguyên nhân nào?', 1),
(15, 6, 'Cơ chế nào giúp ngăn chặn các cuộc tấn công CSRF (Cross-Site Request Forgery)?', 1),
-- Quiz 7
(16, 7, 'Trong Next.js 15 App Router, React Server Component mặc định có quyền làm gì?', 1),
(17, 7, 'Chỉ thị nào dùng để đánh dấu một file là Client Component trong Next.js?', 1),
-- Quiz 8
(18, 8, 'Trong kiến trúc Apache Kafka, thành phần nào chịu trách nhiệm lưu trữ các message theo partition?', 1),
(19, 8, 'Cơ chế Windowing trong Spark Streaming cho phép xử lý dữ liệu theo tiêu chí nào?', 1);

INSERT IGNORE INTO answers (id, question_id, answer_text, is_correct)
VALUES
-- Q4 (Quiz 2)
(13, 4, 'NumPy', TRUE),
(14, 4, 'Requests', FALSE),
(15, 4, 'Flask', FALSE),
(16, 4, 'BeautifulSoup', FALSE),
-- Q5 (Quiz 2)
(17, 5, 'Mean Squared Error (MSE)', TRUE),
(18, 5, 'Cross-Entropy Loss', FALSE),
(19, 5, 'Hinge Loss', FALSE),
(20, 5, 'Kullback-Leibler Divergence', FALSE),
-- Q6 (Quiz 2)
(21, 6, 'Nhãn kết quả mục tiêu (Labels)', TRUE),
(22, 6, 'Địa chỉ MAC của máy tính', FALSE),
(23, 6, 'Khóa bí mật API', FALSE),
(24, 6, 'File cấu hình YAML', FALSE),
-- Q7 (Quiz 3)
(25, 7, 'Quét mã QR từ Metro Bundler trực tiếp trên thiết bị iOS / Android thật', TRUE),
(26, 7, 'Phải nạp file IPA qua App Store TestFlight', FALSE),
(27, 7, 'Bắt buộc cắm cáp USB và mở Android Studio', FALSE),
(28, 7, 'Chỉ chạy được trên trình duyệt web', FALSE),
-- Q8 (Quiz 3)
(29, 8, 'FlatList (với cơ chế Virtualized List)', TRUE),
(30, 8, 'ScrollView với hàm map thông thường', FALSE),
(31, 8, 'View bọc ngoài nhiều thẻ Text', FALSE),
(32, 8, 'Thẻ HTML table', FALSE),
-- Q9 (Quiz 3)
(33, 9, 'Flexbox (với flexDirection mặc định là column)', TRUE),
(34, 9, 'CSS Grid Layout 12 cột', FALSE),
(35, 9, 'Float left/right', FALSE),
(36, 9, 'Absolute positioning cứng', FALSE),
-- Q10 (Quiz 4)
(37, 10, 'docker run -d <image_name>', TRUE),
(38, 10, 'docker exec -it <image_name>', FALSE),
(39, 10, 'docker stop <image_name>', FALSE),
(40, 10, 'docker push <image_name>', FALSE),
-- Q11 (Quiz 4)
(41, 11, 'Pod', TRUE),
(42, 11, 'Node', FALSE),
(43, 11, 'Cluster', FALSE),
(44, 11, 'Ingress', FALSE),
-- Q12 (Quiz 5)
(45, 12, 'Auto Layout', TRUE),
(46, 12, 'Smart Animate', FALSE),
(47, 12, 'Boolean Group', FALSE),
(48, 12, 'Masking', FALSE),
-- Q13 (Quiz 5)
(49, 13, '8pt Grid System', TRUE),
(50, 13, '3pt Grid System', FALSE),
(51, 13, '15pt Grid System', FALSE),
(52, 13, '7pt Grid System', FALSE),
-- Q14 (Quiz 6)
(53, 14, 'Ghép trực tiếp chuỗi dữ liệu đầu vào người dùng vào câu lệnh SQL mà không Parameterized', TRUE),
(54, 14, 'Sử dụng quá nhiều câu lệnh SELECT', FALSE),
(55, 14, 'Cơ sở dữ liệu đặt mật khẩu quá dài', FALSE),
(56, 14, 'Không cài đặt chứng chỉ SSL', FALSE),
-- Q15 (Quiz 6)
(57, 15, 'Sử dụng Anti-CSRF Token ngẫu nhiên và cờ SameSite cho Cookie', TRUE),
(58, 15, 'Tắt toàn bộ JavaScript trên trình duyệt', FALSE),
(59, 15, 'Chỉ dùng phương thức HTTP GET', FALSE),
(60, 15, 'Đặt tên bảng CSDL bằng chữ in hoa', FALSE),
-- Q16 (Quiz 7)
(61, 16, 'Truy cập trực tiếp Database hoặc file hệ thống trên Server mà không gửi code tới Client', TRUE),
(62, 16, 'Sử dụng hook useState và useEffect', FALSE),
(63, 16, 'Bắt buộc render trên trình duyệt', FALSE),
(64, 16, 'Chỉ chạy được khi có kết nối WebSocket', FALSE),
-- Q17 (Quiz 7)
(65, 17, '\'use client\'', TRUE),
(66, 17, '\'use server\'', FALSE),
(67, 17, '\'use strict\'', FALSE),
(68, 17, '\'use react\'', FALSE),
-- Q18 (Quiz 8)
(69, 18, 'Kafka Broker', TRUE),
(70, 18, 'ZooKeeper Client', FALSE),
(71, 18, 'Schema Registry', FALSE),
(72, 18, 'Kafka UI', FALSE),
-- Q19 (Quiz 8)
(73, 19, 'Khung thời gian cửa sổ trượt (Sliding/Tumbling Time Window)', TRUE),
(74, 19, 'Dung lượng RAM tối đa của máy tính', FALSE),
(75, 19, 'Thứ tự bảng chữ cái của tên topic', FALSE),
(76, 19, 'Số lượng CPU core trên máy chủ', FALSE);

-- =============================================================================
-- 7. BỔ SUNG ENROLLMENTS & LESSON PROGRESS
-- =============================================================================
INSERT IGNORE INTO enrollments (id, user_id, course_id, enrolled_at, progress_percent, is_completed)
VALUES
(2, 3, 2, NOW(6), 100.00, TRUE),
(3, 6, 1, NOW(6), 100.00, TRUE),
(4, 6, 3, NOW(6), 50.00, FALSE),
(5, 7, 7, NOW(6), 0.00, FALSE),
(6, 7, 9, NOW(6), 25.00, FALSE);

INSERT IGNORE INTO lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at)
VALUES
-- Enrollment 2 (Student 3 - Course 2: 100% hoàn thành)
(3, 2, 8, TRUE, NOW(6)),
(4, 2, 9, TRUE, NOW(6)),
(5, 2, 10, TRUE, NOW(6)),
(6, 2, 11, TRUE, NOW(6)),
-- Enrollment 3 (Student 6 - Course 1: 100% hoàn thành)
(7, 3, 1, TRUE, NOW(6)),
(8, 3, 2, TRUE, NOW(6)),
(9, 3, 3, TRUE, NOW(6)),
(10, 3, 4, TRUE, NOW(6)),
(11, 3, 5, TRUE, NOW(6)),
(12, 3, 6, TRUE, NOW(6)),
(13, 3, 7, TRUE, NOW(6)),
-- Enrollment 4 (Student 6 - Course 3: 50% hoàn thành)
(14, 4, 12, TRUE, NOW(6)),
(15, 4, 13, TRUE, NOW(6)),
-- Enrollment 6 (Student 7 - Course 9: 25% hoàn thành)
(16, 6, 33, TRUE, NOW(6));

-- =============================================================================
-- 8. BỔ SUNG CERTIFICATES (Cho các enrollment hoàn thành 100%)
-- =============================================================================
INSERT IGNORE INTO certificates (id, enrollment_id, certificate_code, issued_at, pdf_url, final_score, total_duration_minutes)
VALUES
(1, 2, 'CERT-2026-AI-8B7C9D', NOW(6), NULL, 90, 110),
(2, 3, 'CERT-2026-WEB-1E2F3A', NOW(6), NULL, 95, 198);

-- =============================================================================
-- 9. BỔ SUNG ORDERS & ORDER_ITEMS (Cho phân hệ Doanh thu Admin & Giảng viên)
-- =============================================================================
INSERT IGNORE INTO orders (id, order_code, user_id, total_amount, status, payment_method, created_at, paid_at)
VALUES
(1, 'ORD-20260815-001', 3, 1098000, 'COMPLETED', 'VNPAY', '2026-08-15 10:00:00', '2026-08-15 10:05:00'),
(2, 'ORD-20260820-002', 6, 1000000, 'COMPLETED', 'CARD', '2026-08-20 14:30:00', '2026-08-20 14:32:00'),
(3, 'ORD-20260825-003', 6, 499000, 'COMPLETED', 'MOMO', '2026-08-25 09:15:00', '2026-08-25 09:18:00'),
(4, 'ORD-20260901-004', 7, 399000, 'COMPLETED', 'VNPAY', '2026-09-01 16:45:00', '2026-09-01 16:50:00'),
(5, 'ORD-20260910-005', 7, 699000, 'PENDING', 'VNPAY', '2026-09-10 11:20:00', NULL);

INSERT IGNORE INTO order_items (id, order_id, course_id, price)
VALUES
-- Đơn 1 (User 3 mua Khóa 1 + Khóa 2)
(1, 1, 1, 499000),
(2, 1, 2, 599000),
-- Đơn 2 (User 6 mua Khóa 4 + Khóa 5)
(3, 2, 4, 650000),
(4, 2, 5, 350000),
-- Đơn 3 (User 6 mua Khóa 3)
(5, 3, 3, 499000),
-- Đơn 4 (User 7 mua Khóa 7)
(6, 4, 7, 399000),
-- Đơn 5 (User 7 mua Khóa 8 - Đơn PENDING không tính vào doanh thu)
(7, 5, 8, 699000);

-- =============================================================================
-- 10. BỔ SUNG CART_ITEMS & PAYMENT_SESSIONS
-- =============================================================================
INSERT IGNORE INTO cart_items (id, user_id, course_id, added_at)
VALUES
(1, 7, 6, NOW(6)),
(2, 7, 8, NOW(6)),
(3, 3, 4, NOW(6));

INSERT IGNORE INTO payment_sessions (id, session_token, user_id, status, created_at, expires_at)
VALUES
(1, 'sess_vnpay_sample_001_completed', 3, 'COMPLETED', '2026-08-15 10:00:00', '2026-08-15 10:15:00'),
(2, 'sess_card_sample_002_completed', 6, 'COMPLETED', '2026-08-20 14:30:00', '2026-08-20 14:45:00'),
(3, 'sess_vnpay_sample_003_pending', 7, 'PENDING', '2026-09-10 11:20:00', '2026-09-10 11:35:00');
