# 🎓 HỆ THỐNG QUẢN LÝ HỌC TẬP TRỰC TUYẾN (MOOC LMS PLATFORM)

> **Kiến trúc:** Monolithic 3-Layer Architecture  
> **Backend:** Spring Boot (Java 21), Spring Data JPA, Spring Security, JWT  
> **Frontend:** ReactJS 19, Vite, Tailwind CSS  
> **Database:** MySQL 8.0  
> **Containerization:** Docker & Docker Compose  

---

## 📌 1. Giới thiệu tổng quan

**MOOC LMS Platform** là nền tảng đào tạo trực tuyến quy mô lớn (Massive Open Online Courses) cung cấp giải pháp toàn diện cho:
- **Học viên (Student):** Tìm kiếm khóa học, ghi danh, xem bài giảng đa phương tiện (Video/PDF/Text), làm bài kiểm tra trắc nghiệm (Quiz) và nhận chứng chỉ số tốt nghiệp (Certificate) kèm mã băm UUID tra cứu công khai.
- **Giảng viên (Instructor):** Soạn thảo khóa học, quản lý chương/bài giảng, biên soạn ngân hàng câu hỏi & đề thi trắc nghiệm, theo dõi học viên.
- **Quản trị viên (Admin):** Kiểm duyệt xuất bản khóa học, quản trị tài khoản (Khóa/Mở) và theo dõi báo cáo thống kê Dashboard.

---

## 🏗️ 2. Kiến trúc hệ thống (3-Layer Monolithic)

```text
lms-platform/
├── lms-backend/               # Spring Boot Application (Port 8080)
│   └── src/main/java/com/lms/lms_backend/
│       ├── controller/        # Tầng Presentation (RESTful API Endpoints)
│       ├── service/           # Tầng Business Logic (Xử lý nghiệp vụ & Transactions)
│       ├── repository/        # Tầng Data Access (Spring Data JPA)
│       ├── entity/            # 11 JPA Entities & Enums ánh xạ CSDL
│       ├── dto/               # Data Transfer Objects phân nhóm theo domain
│       ├── config/            # Cấu hình Security, CORS & DataInitializer
│       ├── security/          # JWT Filter, JwtUtils & UserDetailsService
│       └── exception/         # Xử lý ngoại lệ tập trung (GlobalExceptionHandler)
├── lms-frontend/              # ReactJS Single Page Application (Port 3000 / 5173)
├── docker-compose.yml         # Triển khai toàn bộ hệ thống bằng Docker
└── README.md
```

---

## 📊 3. Thiết kế Cơ sở dữ liệu (11 Bảng & JPA Entities)

Hệ thống được thiết kế chuẩn hóa 11 thực thể dữ liệu trên MySQL 8.0:

1. **`users` (`User`)**: Quản lý tài khoản, mã hóa BCrypt, trạng thái `is_active` và phân quyền RBAC (`ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN`).
2. **`categories` (`Category`)**: Danh mục đào tạo phục vụ phân loại và định tuyến slug.
3. **`courses` (`Course`)**: Khóa học với vòng đời trạng thái (`DRAFT` $\rightarrow$ `PENDING` $\rightarrow$ `PUBLISHED` / `REJECTED`).
4. **`sections` (`Section`)**: Các chương học trong khóa học theo thứ tự hiển thị.
5. **`lessons` (`Lesson`)**: Bài giảng đa phương tiện định dạng `VIDEO`, `DOCUMENT` (PDF) hoặc `TEXT`.
6. **`enrollments` (`Enrollment`)**: Lượt ghi danh của học viên kèm `%` tiến độ và cờ hoàn thành khóa học.
7. **`lesson_progress` (`LessonProgress`)**: Ghi nhận trạng thái hoàn thành từng bài học của học viên.
8. **`quizzes` (`Quiz`)**: Đề thi trắc nghiệm cuối khóa, cấu hình điểm chuẩn `passing_score` và thời gian làm bài.
9. **`questions` (`Question`)**: Câu hỏi trắc nghiệm kèm trọng số điểm.
10. **`answers` (`Answer`)**: Các phương án lựa chọn kèm cờ đáp án đúng `is_correct`.
11. **`certificates` (`Certificate`)**: Chứng chỉ số tốt nghiệp có mã băm xác thực duy nhất (UUID) và link tải PDF.

---

## 🔑 4. Tài khoản mẫu khởi tạo sẵn (DataInitializer)

Khi hệ thống khởi động lần đầu, `DataInitializer` sẽ tự động tạo sẵn dữ liệu mẫu:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Họ và tên |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `admin123` | Quản trị viên Hệ thống |
| **Instructor** | `instructor@lms.com` | `instructor123` | TS. Nguyễn Văn A |
| **Student** | `student@lms.com` | `student123` | Trần Văn Học Viên |

*Hệ thống cũng tự tạo sẵn 3 danh mục, 3 khóa học, các chương/bài giảng và đề thi Quiz mẫu.*

---

## 🌐 5. Danh mục RESTful API Endpoints chính

| Phân hệ | Phương thức | Endpoint | Mô tả nghiệp vụ | Quyền truy cập |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Đăng nhập nhận Bearer JWT | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại | Authenticated |
| **Auth** | `PUT` | `/api/v1/auth/profile` | Cập nhật hồ sơ cá nhân | Authenticated |
| **Auth** | `PUT` | `/api/v1/auth/change-password` | Đổi mật khẩu | Authenticated |
| **Categories**| `GET` | `/api/v1/categories` | Lấy danh sách danh mục | Public |
| **Courses** | `GET` | `/api/v1/courses/public` | Danh sách khóa học đã xuất bản | Public |
| **Courses** | `GET` | `/api/v1/courses/public/{slug}` | Chi tiết khóa học theo Slug | Public |
| **Courses** | `POST` | `/api/v1/courses` | Tạo mới khóa học (DRAFT) | Instructor/Admin |
| **Courses** | `POST` | `/api/v1/courses/{id}/submit-review` | Gửi duyệt khóa học (PENDING) | Instructor/Admin |
| **Curriculum**| `GET` | `/api/v1/sections/course/{courseId}` | Danh sách chương học | Public |
| **Curriculum**| `GET` | `/api/v1/lessons/section/{sectionId}` | Danh sách bài giảng | Public |
| **Learning** | `POST` | `/api/v1/enrollments` | Đăng ký tham gia khóa học | Student/All |
| **Learning** | `GET` | `/api/v1/enrollments/my-learning` | Danh sách khóa học đã ghi danh | Student/All |
| **Learning** | `POST` | `/api/v1/learning/complete` | Đánh dấu hoàn thành bài & cập nhật % tiến độ | Student/All |
| **Quiz** | `POST` | `/api/v1/quizzes` | Soạn đề thi Quiz + Câu hỏi + Đáp án | Instructor/Admin |
| **Quiz** | `GET` | `/api/v1/quizzes/course/{courseId}` | Lấy đề thi Quiz (ẩn đáp án đúng) | Student/All |
| **Quiz** | `POST` | `/api/v1/quizzes/{id}/submit` | Nộp bài thi, tự động chấm điểm & cấp chứng chỉ | Student/All |
| **Certificates**| `GET` | `/api/v1/certificates/verify/{code}` | Tra cứu xác thực chứng chỉ số công khai | Public |
| **Certificates**| `GET` | `/api/v1/certificates/download/{code}` | Tải file chứng chỉ số | Public |
| **Admin** | `GET` | `/api/v1/admin/courses/pending` | Danh sách khóa học chờ duyệt | Admin |
| **Admin** | `PATCH`| `/api/v1/admin/courses/{id}/approve` | Phê duyệt xuất bản khóa học | Admin |
| **Admin** | `GET` | `/api/v1/admin/users` | Danh sách người dùng hệ thống | Admin |
| **Admin** | `PATCH`| `/api/v1/admin/users/{id}/toggle-active` | Khóa / Mở tài khoản người dùng | Admin |
| **Admin** | `GET` | `/api/v1/admin/stats` | Thống kê Dashboard hệ thống | Admin |

---

## 🚀 6. Hướng dẫn cài đặt & Khởi chạy

### ⚙️ Bước 1: Thiết lập Biến môi trường (Environment Setup)
Tại thư mục gốc của dự án, sao chép file `.env.example` thành `.env`:

```bash
# Windows PowerShell / CMD
copy .env.example .env

# Linux / MacOS
cp .env.example .env
```
*(Bạn có thể giữ nguyên các giá trị mặc định để chạy ở môi trường Local Development, hoặc tùy chỉnh các thông số DB_PASSWORD, JWT_SECRET khi triển khai)*

---

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên dùng)
Yêu cầu: Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# 1. Clone dự án và di chuyển vào thư mục gốc
cd lms-platform

# 2. Khởi chạy toàn bộ hệ thống (MySQL, Spring Boot Backend, React Frontend)
docker compose up -d --build

# 3. Xem log hoạt động
docker compose logs -f
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **MySQL DB:** `localhost:3307` (Database: `lms_db`, User: `root`)


---

### Cách 2: Khởi chạy thủ công từng dịch vụ (Local Development)

#### 1. Khởi động Backend (Spring Boot):
Yêu cầu: JDK 21+ và MySQL 8.0 đang chạy cổng 3306.

```bash
cd lms-backend

# Biên dịch dự án
./mvnw clean compile

# Chạy backend
./mvnw spring-boot:run
```

#### 2. Khởi động Frontend (ReactJS):
Yêu cầu: Node.js 18+.

```bash
cd lms-frontend

# Cài đặt dependencies
npm install

# Khởi chạy dev server
npm run dev
```
Frontend sẽ chạy tại [http://localhost:5173](http://localhost:5173).

---

## 📄 License
Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và bài tập lớn môn học.
