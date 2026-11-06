# BÁO CÁO KIỂM TRA SỨC KHỎE VÀ KIỂM TOÁN DỰ ÁN (PROJECT AUDIT)
**Hệ thống Quản lý Học tập Trực tuyến - MOOC-lms**  
*Thời điểm thực hiện kiểm toán: 06/11/2026*  
*Người kiểm toán: Hệ thống Đánh giá Tự động Antigravity*  
*Môi trường xác thực: Container Docker chuẩn (`lms-mysql:8.0` + `lms-backend:latest`)*

---

## 1. Khởi động Sạch & Trạng thái Flyway Migration trên Docker

### 1.1. Kết quả chạy trên môi trường Docker sạch: **[ĐÃ CHẠY]**
- **Lệnh thực thi:** `docker compose down -v && docker compose up --build -d mysql backend`
- **Tình trạng dịch vụ container:**
  - `lms-mysql` (`mysql:8.0`): Chạy cổng host `3307 -> 3306` nội bộ. Đã vượt qua `healthcheck` (`mysqladmin ping`) sau 18 giây, chuyển sang trạng thái `healthy`.
  - `lms-backend` (`mooc-lms-backend:latest`): Đóng gói từ `eclipse-temurin:21-jre-alpine`, khởi động hoàn tất sau 15.281 giây (`Started LmsBackendApplication in 15.281 seconds`).
- **Ghi chú khởi động ban đầu:** Trong 1-2 giây đầu khi `lms-mysql` vừa mở port nhưng chưa sẵn sàng nhận kết nối, Spring Boot ghi nhận 1 lỗi `ConnectException (Connection refused)`. Sau khi MySQL chuyển trạng thái `healthy`, cơ chế `restart: unless-stopped` và tự kết nối lại của HikariCP đã kết nối thành công, toàn bộ ứng dụng chạy bình thường, không có lỗi runtime phát sinh.

### 1.2. Nhật ký Flyway Migration trên Docker DB (`lms-mysql`): **[ĐÃ CHẠY]**
Flyway đã quét toàn bộ 16 file migration trong thư mục `src/main/resources/db/migration/` và áp dụng thành công toàn bộ:
- **Phiên bản Flyway cuối cùng đạt được:** **v16** (`V16__add_certificate_revocation_fields.sql`).
- **Thời gian thực thi Flyway:** `00:04.602s` (16 migrations applied successfully).
- **Chi tiết các phiên bản đã nạp:**
  1. `V1__init_schema.sql` (119 dòng) -> SUCCESS
  2. `V2__seed_data.sql` (93 dòng) -> SUCCESS
  3. `V3__add_user_profile_fields.sql` (17 dòng) -> SUCCESS
  4. `V4__add_course_price.sql` (5 dòng) -> SUCCESS
  5. `V5__create_cart_items.sql` (18 dòng) -> SUCCESS
  6. `V6__create_orders.sql` (38 dòng) -> SUCCESS
  7. `V7__create_payment_sessions.sql` (15 dòng) -> SUCCESS
  8. `V8__add_certificate_fields.sql` (8 dòng) -> SUCCESS
  9. `V9__add_course_status_and_soft_delete.sql` (16 dòng) -> SUCCESS
  10. `V10__expand_seed_data.sql` (288 dòng) -> SUCCESS
  11. `V11__create_refresh_tokens.sql` (20 dòng) -> SUCCESS
  12. `V12__expand_courses_per_category.sql` (749 dòng) -> SUCCESS
  13. `V13__expand_revenue_seed_data.sql` (887 dòng) -> SUCCESS
  14. `V14__create_notifications.sql` (28 dòng) -> SUCCESS
  15. `V15__create_audit_logs.sql` (26 dòng) -> SUCCESS
  16. `V16__add_certificate_revocation_fields.sql` (10 dòng) -> SUCCESS

---

## 2. Kết quả Kiểm thử Tự động, Build và Linter

| Thành phần | Lệnh thực thi | Kết quả thực tế [ĐÃ CHẠY] | Thời gian / Ghi chú |
| :--- | :--- | :--- | :--- |
| **Backend Unit & Integration Test** | `mvn test -f lms-backend/pom.xml` | **PASS (155/155 tests)**, 0 Failures, 0 Errors | Thời gian chạy: 29.921s |
| **Frontend Unit & Component Test** | `npm test --prefix lms-frontend -- --run` | **PASS (35/35 test suites, 150/150 tests)** | 100% pass |
| **Frontend Production Build** | `npm run build --prefix lms-frontend` | **SUCCESS (0 errors)** | Thời gian build: 622ms (Vite 5.4.19) |
| **Frontend Linter (Oxlint)** | `npm run lint --prefix lms-frontend` | **0 Errors, 151 Warnings** | Cảnh báo: Biến/icon import chưa dùng (`lucide-react`) |

---

## 3. Kiểm tra Tính Toàn vẹn Dữ liệu bằng SQL trên Docker Database (`lms-mysql`)

> [!IMPORTANT]
> Toàn bộ dữ liệu dưới đây được truy vấn trực tiếp từ container Docker `lms-mysql` (cơ sở dữ liệu `lms_db` cổng `3307`). Đây là nguồn dữ liệu chuẩn hóa của dự án sau khi chạy sạch toàn bộ 16 migration Flyway.

### 3.1. Số lượng bản ghi mỗi bảng trên Docker DB [ĐÃ CHẠY]
```sql
SELECT 'users' as tbl, count(*) as cnt FROM users
UNION ALL SELECT 'categories', count(*) FROM categories
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'sections', count(*) FROM sections
UNION ALL SELECT 'lessons', count(*) FROM lessons
UNION ALL SELECT 'quizzes', count(*) FROM quizzes
UNION ALL SELECT 'questions', count(*) FROM questions
UNION ALL SELECT 'answers', count(*) FROM answers
UNION ALL SELECT 'enrollments', count(*) FROM enrollments
UNION ALL SELECT 'lesson_progress', count(*) FROM lesson_progress
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'order_items', count(*) FROM order_items
UNION ALL SELECT 'cart_items', count(*) FROM cart_items
UNION ALL SELECT 'certificates', count(*) FROM certificates
UNION ALL SELECT 'payment_sessions', count(*) FROM payment_sessions
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'audit_logs', count(*) FROM audit_logs
UNION ALL SELECT 'refresh_tokens', count(*) FROM refresh_tokens;
```
*Kết quả thực tế trên container `lms-mysql`:*
- `users`: **52** người dùng (gồm 1 Quản trị viên, 10 Giảng viên, 41 Học viên).
- `categories`: **7** danh mục chuyên ngành CNTT.
- `courses`: **42** khóa học (40 PUBLISHED, 1 PENDING, 1 DRAFT).
- `sections`: **84** chương học.
- `lessons`: **162** bài học.
- `quizzes`: **39** đề thi trắc nghiệm.
- `questions`: **112** câu hỏi trắc nghiệm.
- `answers`: **448** phương án trả lời.
- `enrollments`: **299** lượt ghi danh.
- `lesson_progress`: **16** bản ghi tiến độ học tập chi tiết.
- `orders`: **230** đơn hàng hoàn tất.
- `order_items`: **310** chi tiết món hàng.
- `cart_items`: **3** món trong giỏ hàng mẫu.
- `certificates`: **2** chứng chỉ đào tạo đã cấp.
- `payment_sessions`: **3** phiên thanh toán mẫu.
- `notifications`: **3** thông báo mẫu.
- `audit_logs`: **42** bản ghi nhật ký kiểm toán.
- `refresh_tokens`: **0** (chưa có phiên nào xoay vòng ngoài môi trường runtime).

---

### 3.2. Kiểm tra Order Item của đơn COMPLETED thiếu Enrollment (Xác minh lại `ERR-01`)
```sql
SELECT oi.id as order_item_id, oi.order_id, o.user_id, oi.course_id, o.status
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN enrollments e ON e.user_id = o.user_id AND e.course_id = oi.course_id
WHERE o.status = 'COMPLETED' AND e.id IS NULL;
```
*Kết quả thực tế trên Docker DB:* **0 bản ghi** (`Empty set`).
> [!NOTE]
> **Đính chính quan trọng về `ERR-01`:** Kết quả trước đây báo thiếu 2 bản ghi ghi danh (`order_item 3 và 4` của user 6) **CHỈ XẢY RA TRÊN CƠ SỞ DỮ LIỆU CỤC BỘ WINDOWS CŨ** (`test_clean_lms_db`), do cơ sở dữ liệu đó chưa chạy migration `V13`.
> Trên Docker DB chuẩn, migration [`V13__expand_revenue_seed_data.sql:867-885`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V13__expand_revenue_seed_data.sql#L867-L885) đã chứa các câu lệnh bù `enrollments` đầy đủ bằng cú pháp `INSERT INTO enrollments ... SELECT ... WHERE NOT EXISTS`. Vì vậy, **trên Docker DB chuẩn KHÔNG CÒN lỗi ERR-01**.

---

### 3.3. So lệch giá trị đơn hàng `orders.total_amount != SUM(order_items.price)`
```sql
SELECT o.id, o.order_code, o.total_amount, SUM(oi.price) as items_sum
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_code, o.total_amount
HAVING o.total_amount != items_sum;
```
*Kết quả thực tế:* **0 bản ghi** (Toàn bộ 230 đơn hàng khớp 100% với tổng chi tiết món hàng).

---

### 3.4. Khóa học PUBLISHED không có bài kiểm tra (Xác minh lại `ERR-02`)
```sql
SELECT c.id, c.title, c.status,
       COUNT(DISTINCT s.id) as section_count,
       COUNT(DISTINCT l.id) as lesson_count,
       COUNT(DISTINCT q.id) as quiz_count
FROM courses c
LEFT JOIN sections s ON c.id = s.course_id
LEFT JOIN lessons l ON s.id = l.section_id
LEFT JOIN quizzes q ON c.id = q.course_id
WHERE c.status = 'PUBLISHED'
GROUP BY c.id, c.title, c.status
HAVING section_count = 0 OR lesson_count = 0 OR quiz_count = 0;
```
*Kết quả thực tế:* **XÁC MINH CÒN TỒN TẠI (1 khóa học):**
- **Khóa học ID 9:** *"Lập trình Web Căn bản cho Người mới bắt đầu (HTML5, CSS3, JavaScript)"* có 2 chương, 4 bài học, nhưng `quiz_count = 0`.
- **Minh chứng mã nguồn:**
  - Tại [`V10__expand_seed_data.sql:60`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V10__expand_seed_data.sql#L60), Khóa học 9 được tạo với `status = 'PUBLISHED'`.
  - Tại [`V10__expand_seed_data.sql:110-120`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V10__expand_seed_data.sql#L110-L120), lệnh `INSERT INTO quizzes` chỉ gán quiz cho các khóa học ID từ 2 đến 8.
  - Tại [`V12__expand_courses_per_category.sql:246`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V12__expand_courses_per_category.sql#L246), lệnh `INSERT INTO quizzes` bắt đầu gán từ Khóa học ID 12 trở đi.
  - Khóa học 9 bị bỏ sót hoàn toàn phần thi trắc nghiệm. Học viên học xong 100% video bài học của khóa 9 sẽ không có đề thi để được cấp chứng chỉ.

---

### 3.5. Kiểm tra danh mục khóa học (Category Integrity)
- Khóa học có `category_id` không tồn tại: **0 bản ghi**.
- Danh mục không có khóa học PUBLISHED: **0 bản ghi**.

---

### 3.6. Độ lệch tỷ lệ tiến độ `progress_percent` (Xác minh lại `ERR-03`)
```sql
SELECT e.id as enrollment_id, e.user_id, e.course_id, e.progress_percent,
       (SELECT COUNT(*) FROM lessons l JOIN sections s ON l.section_id = s.id WHERE s.course_id = e.course_id) as total_lessons,
       (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.is_completed = 1) as completed_lessons,
       ROUND((SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.is_completed = 1) * 100.0 / 
             NULLIF((SELECT COUNT(*) FROM lessons l JOIN sections s ON l.section_id = s.id WHERE s.course_id = e.course_id), 0), 2) as calculated_percent
FROM enrollments e
WHERE (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.is_completed = 1) > 0;
```
*Kết quả thực tế:*
- `enrollment_id: 1` (user 3, khóa 1): CSDL lưu `progress_percent = 28.00`, trong khi phép chia thực tế `2 / 7 = 28.57%` (lệch 0.57%).
- **Nguyên nhân chính xác từ mã nguồn:**
  - Trong [`V2__seed_data.sql:87`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V2__seed_data.sql#L87) và [`DataInitializer.java:286`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/DataInitializer.java#L286), bản ghi seed mẫu được gán cứng `.progressPercent(BigDecimal.valueOf(28))`.
  - Trong khi đó, thuật toán tính động ở môi trường chạy thật tại [`ProgressService.java:69-70`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/ProgressService.java#L69-L70) sử dụng công thức chính xác:
    ```java
    percentage = BigDecimal.valueOf((double) completedLessons / totalLessons * 100).setScale(2, RoundingMode.HALF_UP);
    ```
  - Do đó, độ lệch 0.57% chỉ là do giá trị seed ban đầu bị gán cứng số nguyên, không phải do lỗi thuật toán runtime của hệ thống.

---

### 3.7. Chứng chỉ cấp cho người chưa học đủ 100%
*Kết quả:* **0 bản ghi** (100% chứng chỉ đã cấp gắn liền với enrollment đã đạt 100% tiến độ và đạt điểm đỗ).

### 3.8. Bản ghi mồ côi (Orphan Foreign Keys)
*Kết quả:* **0 bản ghi mồ côi** trên toàn bộ 13 mối quan hệ liên kết bảng trong Docker DB.

---

## 4. Rà soát An toàn Thông tin & Vệ sinh Code

- **Bảo vệ mật khẩu:** Tuyệt đối không trả về `password` hay `password_hash` ở bất kỳ API nào, mật khẩu băm một chiều BCrypt.
- **Che dữ liệu nhạy cảm (Data Masking):** API [`AdminController.java:185-275`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/controller/AdminController.java#L185-L275) che email (`a***@g***.com`), số điện thoại, ngày sinh; giải mã bằng mật khẩu admin có giới hạn tần suất 5 lần/10 phút (HTTP 429).
- **Phát hiện tái sử dụng Refresh Token:** [`RefreshTokenService.java:60-95`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/RefreshTokenService.java#L60-L95) thu hồi toàn bộ token family khi token cũ bị dùng lại.
- **Rủi ro triển khai Vercel + Render:**
  - Render Free không có ổ đĩa vĩnh viễn: File tải lên trong `/app/uploads` sẽ mất khi redeploy container.
  - Cấu hình `SameSite=Lax` trong [`AuthService.java:193`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L193) cần đổi thành `SameSite=None; Secure=true` khi Frontend và Backend khác domain.

---

## 5. Bảng Tổng Hợp Lỗi và Trạng Thái Xác Minh Thực Tế

| Mã | Mức độ | Hiện tượng & Vị trí code | Trạng thái xác minh lại | Khuyến nghị xử lý |
| :---: | :---: | :--- | :--- | :--- |
| **ERR-01** | *Nghiêm trọng (cũ)* | Đơn hàng COMPLETED thiếu enrollment | **[KHÔNG CÒN TRÊN DOCKER DB]**<br/>Chỉ xảy ra ở CSDL cục bộ cũ. Trên Docker DB `lms-mysql`, `V13:867-885` đã bù đủ enrollment. | Không cần sửa code migration. |
| **ERR-02** | **Trung bình** | Khóa học ID 9 thiếu Quiz<br/>[`V10:60`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V10__expand_seed_data.sql#L60), [`V12:246`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V12__expand_courses_per_category.sql#L246) | **[XÁC MINH CÒN TỒN TẠI]**<br/>Khóa 9 PUBLISHED nhưng không có đề thi nào trong bảng `quizzes`. | Thêm 1 quiz mẫu gồm 2-3 câu hỏi cho khóa học 9. |
| **ERR-03** | **Nhẹ** | Lệch 0.57% tiến độ ở enrollment 1<br/>[`V2:87`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/resources/db/migration/V2__seed_data.sql#L87), [`DataInitializer:286`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/config/DataInitializer.java#L286) | **[XÁC MINH DO DỮ LIỆU SEED CŨ]**<br/>Seed gán cứng 28.00%, code runtime [`ProgressService:69-70`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/ProgressService.java#L69-L70) tính đúng 28.57%. | Không ảnh hưởng người dùng thật học bài. |
| **RISK-01**| **Nghiêm trọng** | Mất file tải lên trên Render Free Tier<br/>[`LocalFileStorageService.java:30`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/LocalFileStorageService.java#L30) | **[XÁC MINH RỦI RO KIẾN TRÚC]**<br/>Container stateless không có persistent storage. | Chuyển sang AWS S3 hoặc Cloudinary khi deploy production. |
| **RISK-02**| **Nghiêm trọng** | Trình duyệt chặn Refresh Token khác domain<br/>[`AuthService.java:193`](file:///d:/University/E-Learning/MOOC-lms/lms-backend/src/main/java/com/lms/lms_backend/service/AuthService.java#L193) | **[XÁC MINH RỦI RO CẤU HÌNH]**<br/>Cookie `SameSite=Lax` không gửi kèm request cross-site. | Đổi sang `SameSite=None; Secure=true` khi deploy độc lập. |
