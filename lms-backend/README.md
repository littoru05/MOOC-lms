# 🛠️ LMS Backend - Spring Boot 3-Layer Monolithic

API Backend cho hệ thống Đào tạo trực tuyến (MOOC LMS Platform), được xây dựng theo kiến trúc **3-Layer Monolithic** với Spring Boot, Spring Security JWT và Spring Data JPA.

---

## 📌 1. Công nghệ & Thư viện

- **Java Development Kit:** Java 21 (LTS)
- **Framework:** Spring Boot 4.x
- **ORM / Persistence:** Spring Data JPA (Hibernate 6)
- **Security:** Spring Security 6 + JWT (jjwt 0.11.5) + BCrypt Password Encoder
- **Database:** MySQL 8.0 (InnoDB)
- **Build Tool:** Maven Wrapper (`mvnw`)
- **Utilities:** Lombok, Jakarta Validation

---

## 🏗️ 2. Cấu trúc Package (3-Layer Architecture)

```text
com.lms.lms_backend
├── LmsBackendApplication.java    # Application Entry Point
├── config/                       # Cấu hình SecurityFilterChain, CORS, DataInitializer
├── controller/                   # Tầng Presentation (REST Controllers)
├── service/                      # Tầng Business Logic & Transaction Management
├── repository/                   # Tầng Data Access (Spring Data JPA Repositories)
├── entity/                       # 11 JPA Entities & Domain Enums
├── dto/                          # Data Transfer Objects (auth, course, section, lesson, enrollment, quiz, certificate, admin)
├── security/                     # AuthTokenFilter, JwtUtils, UserDetailsServiceImpl
└── exception/                    # GlobalExceptionHandler (@RestControllerAdvice)
```

---

## 🗄️ 3. Danh sách 11 JPA Entities

1. `User`: Quản lý người dùng, mật khẩu băm, role, trạng thái `isActive`.
2. `Category`: Danh mục đào tạo (`name`, `slug`, `description`).
3. `Course`: Khóa học đào tạo (`instructor`, `category`, `status` DRAFT/PENDING/PUBLISHED/REJECTED).
4. `Section`: Chương học theo thứ tự `orderIndex`.
5. `Lesson`: Bài học đa phương tiện (`contentType`: VIDEO, DOCUMENT, TEXT; `contentUrl`, `durationMinutes`).
6. `Enrollment`: Lượt ghi danh học (`progressPercent`, `isCompleted`).
7. `LessonProgress`: Tiến độ hoàn thành từng bài học (`isCompleted`, `completedAt`).
8. `Quiz`: Đề thi trắc nghiệm (`passingScore`, `durationMinutes`).
9. `Question`: Câu hỏi trắc nghiệm (`point`, `questionText`).
10. `Answer`: Đáp án lựa chọn (`answerText`, `isCorrect`).
11. `Certificate`: Chứng chỉ số tốt nghiệp (`certificateCode` UUID, `pdfUrl`, `issuedAt`).

---

## 🔑 4. Tài khoản mặc định (Khởi tạo tự động)

- **Admin:** `admin@lms.com` / `admin123`
- **Instructor:** `instructor@lms.com` / `instructor123`
- **Student:** `student@lms.com` / `student123`

---

## 🚀 5. Hướng dẫn chạy Backend

### Chạy trực tiếp với Maven Wrapper:
```bash
cd lms-backend

# Kiểm tra biên dịch
./mvnw clean compile

# Chạy ứng dụng
./mvnw spring-boot:run
```

API Server lắng nghe tại: `http://localhost:8080`
