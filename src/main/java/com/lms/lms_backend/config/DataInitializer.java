package com.lms.lms_backend.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.entity.Answer;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.ContentType;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.LessonProgress;
import com.lms.lms_backend.entity.Question;
import com.lms.lms_backend.entity.Quiz;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.QuizRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Dữ liệu hệ thống đã tồn tại. Bỏ qua khởi tạo DataInitializer.");
            return;
        }

        log.info("Bắt đầu khởi tạo dữ liệu mẫu cho hệ thống MOOC LMS...");

        // 1. Tạo Users mẫu
        User admin = User.builder()
                .username("admin")
                .email("admin@lms.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Quản trị viên Hệ thống")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();

        User instructor = User.builder()
                .username("instructor")
                .email("instructor@lms.com")
                .password(passwordEncoder.encode("instructor123"))
                .fullName("TS. Nguyễn Văn A")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build();

        User student = User.builder()
                .username("student")
                .email("student@lms.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Trần Văn Học Viên")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        userRepository.saveAll(List.of(admin, instructor, student));
        log.info("Đã tạo 3 tài khoản mẫu: admin@lms.com, instructor@lms.com, student@lms.com");

        // 2. Tạo Categories mẫu
        Category catWeb = Category.builder()
                .name("Lập trình Web")
                .slug("lap-trinh-web")
                .description("Các khóa học phát triển ứng dụng Web Frontend và Backend hiện đại")
                .build();

        Category catAI = Category.builder()
                .name("Trí tuệ nhân tạo & Data Science")
                .slug("ai-data-science")
                .description("Học máy, xử lý ngôn ngữ tự nhiên và phân tích dữ liệu lớn")
                .build();

        Category catMobile = Category.builder()
                .name("Lập trình Di động")
                .slug("lap-trinh-di-dong")
                .description("Xây dựng ứng dụng di động đa nền tảng React Native, Flutter")
                .build();

        categoryRepository.saveAll(List.of(catWeb, catAI, catMobile));
        log.info("Đã tạo 3 danh mục đào tạo mẫu.");

        // 3. Tạo 6 Khóa học Mẫu
        Course course1 = Course.builder()
                .title("Lập trình Web Fullstack với Spring Boot 3 & ReactJS 19")
                .slug("fullstack-spring-boot-reactjs")
                .description("Làm chủ kiến trúc Monolithic 3-Layer, Spring Security JWT, JPA Hibernate và xây dựng Single Page Application hiện đại với React 19 & Tailwind CSS.")
                .thumbnailUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catWeb)
                .instructor(instructor)
                .build();

        Course course2 = Course.builder()
                .title("Trí tuệ nhân tạo & Machine Learning thực chiến với Python")
                .slug("python-machine-learning-co-ban")
                .description("Nắm vững toán học học máy, tiền xử lý dữ liệu với Pandas/NumPy và xây dựng các mô hình phân loại, hồi quy, Deep Learning với Scikit-learn & PyTorch.")
                .thumbnailUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catAI)
                .instructor(instructor)
                .build();

        Course course3 = Course.builder()
                .title("Phát triển Ứng dụng Di động Đa nền tảng với React Native & Expo")
                .slug("react-native-cross-platform")
                .description("Xây dựng ứng dụng di động iOS và Android từ một codebase duy nhất với React Native, Expo, Redux Toolkit và tích hợp REST API chuyên nghiệp.")
                .thumbnailUrl("https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catMobile)
                .instructor(instructor)
                .build();

        Course course4 = Course.builder()
                .title("Chuyên sâu Microservices & Cloud Native với Docker, Kubernetes & AWS")
                .slug("microservices-cloud-native-devops")
                .description("Xây dựng kiến trúc hệ thống phân tán chịu tải cao, triển khai CI/CD tự động và giám sát hệ thống với Prometheus, Grafana trên nền tảng AWS Cloud.")
                .thumbnailUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catWeb)
                .instructor(instructor)
                .build();

        Course course5 = Course.builder()
                .title("Thiết kế UI/UX Sản phẩm Chuyên nghiệp với Figma & Design Systems")
                .slug("thiet-ke-ui-ux-figma-design-system")
                .description("Làm chủ quy trình nghiên cứu người dùng, thiết kế wireframe, prototype tương tác cao và xây dựng Design System quy chuẩn cho Web & Mobile.")
                .thumbnailUrl("https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catWeb)
                .instructor(instructor)
                .build();

        Course course6 = Course.builder()
                .title("An toàn Thông tin & Bảo mật Ứng dụng Web (OWASP Top 10)")
                .slug("an-toan-thong-tin-web-security-owasp")
                .description("Phân tích và phòng chống các lỗ hổng bảo mật nghiêm trọng (SQL Injection, XSS, CSRF, SSRF, JWT Attacks) và bảo vệ hệ thống trước các cuộc tấn công mạng.")
                .thumbnailUrl("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800")
                .status(CourseStatus.PUBLISHED)
                .category(catAI)
                .instructor(instructor)
                .build();

        courseRepository.saveAll(List.of(course1, course2, course3, course4, course5, course6));
        log.info("Đã tạo 6 khóa học mẫu chuẩn hóa.");

        // 4. Tạo Sections & Lessons cho Course 1
        Section sec1_1 = Section.builder().title("Tổng quan Kiến trúc & Thiết lập Môi trường").orderIndex(1).course(course1).build();
        Section sec1_2 = Section.builder().title("Phát triển Backend 3-Layer với Spring Boot 3").orderIndex(2).course(course1).build();
        Section sec1_3 = Section.builder().title("Nghiệp vụ Nâng cao (Tiến độ, Khảo thí & Chứng chỉ)").orderIndex(3).course(course1).build();
        Section sec1_4 = Section.builder().title("Phát triển Frontend React 19 & Tích hợp").orderIndex(4).course(course1).build();
        sectionRepository.saveAll(List.of(sec1_1, sec1_2, sec1_3, sec1_4));

        Lesson les1_1 = Lesson.builder().title("1.1 Giới thiệu kiến trúc hệ thống E-Learning MOOC").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/9SGDpanrc8U").durationMinutes(18).orderIndex(1).section(sec1_1).build();
        Lesson les1_2 = Lesson.builder().title("1.2 Hướng dẫn cài đặt Java 21, MySQL 8.0 & Spring Boot").contentType(ContentType.DOCUMENT).contentUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf").durationMinutes(20).orderIndex(2).section(sec1_1).build();
        Lesson les1_3 = Lesson.builder().title("1.3 Phân tích nghiệp vụ 6 phân hệ và 11 Bảng CSDL").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/7S_tz1z_5bA").durationMinutes(25).orderIndex(3).section(sec1_1).build();
        Lesson les1_4 = Lesson.builder().title("2.1 Định nghĩa 11 JPA Entities và thiết lập mối quan hệ").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/31KTdfRH6nY").durationMinutes(30).orderIndex(1).section(sec1_2).build();
        Lesson les1_5 = Lesson.builder().title("2.2 Cấu hình Spring Security 6 & Bộ lọc xác thực JWT").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/KxqlJblhzfI").durationMinutes(40).orderIndex(2).section(sec1_2).build();
        Lesson les1_6 = Lesson.builder().title("3.1 Thuật toán tính % tiến độ học tập thời gian thực").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/31KTdfRH6nY").durationMinutes(25).orderIndex(1).section(sec1_3).build();
        Lesson les1_7 = Lesson.builder().title("4.1 Khởi tạo dự án Vite, Tailwind CSS & Cấu hình Theme").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/bMknfKXIFA8").durationMinutes(25).orderIndex(1).section(sec1_4).build();
        lessonRepository.saveAll(List.of(les1_1, les1_2, les1_3, les1_4, les1_5, les1_6, les1_7));

        // 5. Tạo Sections & Lessons cho Course 2
        Section sec2_1 = Section.builder().title("Nền tảng Python & Khoa học Dữ liệu").orderIndex(1).course(course2).build();
        Section sec2_2 = Section.builder().title("Các thuật toán Machine Learning Cốt lõi").orderIndex(2).course(course2).build();
        sectionRepository.saveAll(List.of(sec2_1, sec2_2));

        Lesson les2_1 = Lesson.builder().title("1.1 Giới thiệu hệ sinh thái AI và Python cho Data Science").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/rfscVS0vtbw").durationMinutes(20).orderIndex(1).section(sec2_1).build();
        Lesson les2_2 = Lesson.builder().title("1.2 Thao tác mảng đa chiều hiệu năng cao với NumPy").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/rfscVS0vtbw").durationMinutes(25).orderIndex(2).section(sec2_1).build();
        Lesson les2_3 = Lesson.builder().title("2.1 Thuật toán Hồi quy tuyến tính (Linear Regression)").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/7eh4d6sabA0").durationMinutes(30).orderIndex(1).section(sec2_2).build();
        Lesson les2_4 = Lesson.builder().title("2.2 Deep Learning với PyTorch & Neural Networks").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/V_xro1bcAuA").durationMinutes(35).orderIndex(2).section(sec2_2).build();
        lessonRepository.saveAll(List.of(les2_1, les2_2, les2_3, les2_4));

        // 6. Tạo Sections & Lessons cho Course 3
        Section sec3_1 = Section.builder().title("Thiết lập Expo & React Native Core").orderIndex(1).course(course3).build();
        sectionRepository.save(sec3_1);
        Lesson les3_1 = Lesson.builder().title("1.1 Cài đặt Expo CLI và chạy app trên thiết bị thật").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/0-S5a0eXPoc").durationMinutes(20).orderIndex(1).section(sec3_1).build();
        Lesson les3_2 = Lesson.builder().title("1.2 Sử dụng View, Text, FlatList & Flexbox Layout").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/0-S5a0eXPoc").durationMinutes(25).orderIndex(2).section(sec3_1).build();
        lessonRepository.saveAll(List.of(les3_1, les3_2));

        // 7. Tạo Sections & Lessons cho Course 4
        Section sec4_1 = Section.builder().title("Kiến trúc Microservices & Phân rã Dịch vụ").orderIndex(1).course(course4).build();
        sectionRepository.save(sec4_1);
        Lesson les4_1 = Lesson.builder().title("1.1 So sánh Monolithic vs Microservices & Spring Cloud").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/mSZCN4wVw0I").durationMinutes(30).orderIndex(1).section(sec4_1).build();
        lessonRepository.save(les4_1);

        // 8. Tạo Sections & Lessons cho Course 5
        Section sec5_1 = Section.builder().title("Nguyên lý Thiết kế Giao diện & Làm chủ Figma").orderIndex(1).course(course5).build();
        sectionRepository.save(sec5_1);
        Lesson les5_1 = Lesson.builder().title("1.1 Bố cục thị giác, 8pt Grid & Auto Layout 5.0 trong Figma").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/FTFaQWZBqQ8").durationMinutes(25).orderIndex(1).section(sec5_1).build();
        lessonRepository.save(les5_1);

        // 9. Tạo Sections & Lessons cho Course 6
        Section sec6_1 = Section.builder().title("Tổng quan An ninh Mạng & OWASP Top 10").orderIndex(1).course(course6).build();
        sectionRepository.save(sec6_1);
        Lesson les6_1 = Lesson.builder().title("1.1 Giới thiệu mô hình phòng thủ & Phân tích lỗ hổng SQL Injection").contentType(ContentType.VIDEO).contentUrl("https://www.youtube.com/embed/2_lswM1S264").durationMinutes(25).orderIndex(1).section(sec6_1).build();
        lessonRepository.save(les6_1);

        // 10. Tạo Quiz mẫu cho Course 1
        Quiz quiz = Quiz.builder()
                .course(course1)
                .title("Bài kiểm tra Đánh giá Năng lực Cuối khóa (Final Assessment)")
                .passingScore(80)
                .durationMinutes(15)
                .build();

        Question q1 = Question.builder()
                .quiz(quiz)
                .questionText("Kiến trúc Monolithic 3-Layer trong hệ thống bao gồm 3 tầng chính nào?")
                .point(1)
                .build();

        Answer a1_1 = Answer.builder().question(q1).answerText("Presentation (Controller), Business Logic (Service), Data Access (Repository)").isCorrect(true).build();
        Answer a1_2 = Answer.builder().question(q1).answerText("HTML, CSS, JavaScript").isCorrect(false).build();
        Answer a1_3 = Answer.builder().question(q1).answerText("Docker, Kubernetes, Nginx").isCorrect(false).build();
        Answer a1_4 = Answer.builder().question(q1).answerText("Model, View, Template").isCorrect(false).build();
        q1.setAnswers(List.of(a1_1, a1_2, a1_3, a1_4));

        Question q2 = Question.builder()
                .quiz(quiz)
                .questionText("Điều kiện để học viên được hệ thống tự động cấp Chứng chỉ số tốt nghiệp (Certificate) là gì?")
                .point(1)
                .build();

        Answer a2_1 = Answer.builder().question(q2).answerText("Chỉ cần bấm ghi danh vào khóa học").isCorrect(false).build();
        Answer a2_2 = Answer.builder().question(q2).answerText("Hoàn thành 100% các bài học và đạt điểm bài Quiz >= Passing Score").isCorrect(true).build();
        Answer a2_3 = Answer.builder().question(q2).answerText("Chỉ cần xem xong 1 video bài giảng").isCorrect(false).build();
        Answer a2_4 = Answer.builder().question(q2).answerText("Chờ quản trị viên duyệt thủ công").isCorrect(false).build();
        q2.setAnswers(List.of(a2_1, a2_2, a2_3, a2_4));

        Question q3 = Question.builder()
                .quiz(quiz)
                .questionText("Định dạng xác thực chuẩn của token JWT truyền trong HTTP Header là gì?")
                .point(1)
                .build();

        Answer a3_1 = Answer.builder().question(q3).answerText("Authorization: Bearer <token>").isCorrect(true).build();
        Answer a3_2 = Answer.builder().question(q3).answerText("Token: Basic <token>").isCorrect(false).build();
        Answer a3_3 = Answer.builder().question(q3).answerText("Cookie: SessionID=<token>").isCorrect(false).build();
        Answer a3_4 = Answer.builder().question(q3).answerText("Auth: API_KEY=<token>").isCorrect(false).build();
        q3.setAnswers(List.of(a3_1, a3_2, a3_3, a3_4));

        quiz.setQuestions(List.of(q1, q2, q3));
        quizRepository.save(quiz);

        // 11. Tạo sẵn 1 Lượt Ghi danh cho student@lms.com vào Course 1
        Enrollment studentEnrollment = Enrollment.builder()
                .user(student)
                .course(course1)
                .progressPercent(BigDecimal.valueOf(28))
                .isCompleted(false)
                .build();
        enrollmentRepository.save(studentEnrollment);

        LessonProgress prog1 = LessonProgress.builder()
                .enrollment(studentEnrollment)
                .lesson(les1_1)
                .isCompleted(true)
                .build();
        LessonProgress prog2 = LessonProgress.builder()
                .enrollment(studentEnrollment)
                .lesson(les1_2)
                .isCompleted(true)
                .build();
        lessonProgressRepository.saveAll(List.of(prog1, prog2));

        log.info("Khởi tạo dữ liệu mẫu 6 khóa học, toàn bộ bài học và lượt ghi danh thực tế hoàn tất thành công!");
    }
}
