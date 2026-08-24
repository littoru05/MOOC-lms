package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.dto.enrollment.EnrollmentResponse;
import com.lms.lms_backend.dto.progress.LessonCompleteRequest;
import com.lms.lms_backend.dto.progress.LessonProgressResponse;
import com.lms.lms_backend.dto.quiz.QuizResultResponse;
import com.lms.lms_backend.dto.quiz.QuizSubmissionRequest;
import com.lms.lms_backend.dto.quiz.StudentAnswerDto;
import com.lms.lms_backend.entity.Answer;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.ContentType;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.Question;
import com.lms.lms_backend.entity.Quiz;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AnswerRepository;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.QuestionRepository;
import com.lms.lms_backend.repository.QuizRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.CertificateService;
import com.lms.lms_backend.service.EnrollmentService;
import com.lms.lms_backend.service.ProgressService;
import com.lms.lms_backend.service.QuizService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LearningAndCertificationFlowIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private CertificateService certificateService;

    private User student;
    private User instructor;
    private Course course;
    private Lesson lesson1, lesson2;
    private Quiz quiz;
    private Question q1, q2;
    private Answer a1_correct, a2_correct;

    @BeforeEach
    void setupTestData() {
        instructor = userRepository.save(User.builder()
                .username("test_instructor")
                .email("test_instructor@lms.com")
                .password("hash123")
                .fullName("TS. Giảng Viên Test")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build());

        student = userRepository.save(User.builder()
                .username("test_student")
                .email("test_student@lms.com")
                .password("hash123")
                .fullName("Học Viên Test")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Công nghệ thông tin")
                .slug("cntt")
                .build());

        course = courseRepository.save(Course.builder()
                .title("Khóa học Thực chiến Java Spring Boot")
                .slug("java-spring-boot-thuc-chien")
                .description("Học Spring Boot toàn diện")
                .instructor(instructor)
                .category(category)
                .status(CourseStatus.PUBLISHED)
                .build());

        Section section = sectionRepository.save(Section.builder()
                .course(course)
                .title("Chương 1: Kiến thức nền tảng")
                .orderIndex(1)
                .build());

        lesson1 = lessonRepository.save(Lesson.builder()
                .section(section)
                .title("Bài 1.1: Giới thiệu Spring Boot")
                .contentType(ContentType.VIDEO)
                .durationMinutes(15)
                .orderIndex(1)
                .build());

        lesson2 = lessonRepository.save(Lesson.builder()
                .section(section)
                .title("Bài 1.2: Kiến trúc 3-Layer")
                .contentType(ContentType.VIDEO)
                .durationMinutes(20)
                .orderIndex(2)
                .build());

        quiz = quizRepository.save(Quiz.builder()
                .course(course)
                .title("Bài thi đánh giá cuối khóa")
                .passingScore(80)
                .durationMinutes(15)
                .build());

        q1 = questionRepository.save(Question.builder()
                .quiz(quiz)
                .questionText("Spring Boot dùng annotation nào để đánh dấu lớp Service?")
                .point(1)
                .build());

        a1_correct = answerRepository.save(Answer.builder()
                .question(q1)
                .answerText("@Service")
                .isCorrect(true)
                .build());

        Answer a1_wrong = answerRepository.save(Answer.builder()
                .question(q1)
                .answerText("@Component")
                .isCorrect(false)
                .build());
        q1.setAnswers(List.of(a1_correct, a1_wrong));

        q2 = questionRepository.save(Question.builder()
                .quiz(quiz)
                .questionText("JPA là viết tắt của từ gì?")
                .point(1)
                .build());

        a2_correct = answerRepository.save(Answer.builder()
                .question(q2)
                .answerText("Jakarta Persistence API")
                .isCorrect(true)
                .build());

        Answer a2_wrong = answerRepository.save(Answer.builder()
                .question(q2)
                .answerText("Java Protocol Access")
                .isCorrect(false)
                .build());
        q2.setAnswers(List.of(a2_correct, a2_wrong));

        quiz.setQuestions(List.of(q1, q2));
    }

    @Test
    @DisplayName("Luồng Tích hợp Toàn diện: Đăng ký -> Hoàn thành 100% bài học -> Thi Quiz đạt -> Cấp chứng chỉ số")
    void completeLearningFlow_Success() {
        // 1. Học viên ghi danh vào khóa học
        EnrollmentResponse enrollRes = enrollmentService.enrollCourse(student.getEmail(), course.getId());
        assertNotNull(enrollRes);
        assertEquals(course.getId(), enrollRes.getCourseId());
        assertEquals(BigDecimal.ZERO, enrollRes.getProgressPercent());

        Long enrollmentId = enrollRes.getId();

        // 2. Học viên hoàn thành bài 1 (1/2 = 50%)
        LessonCompleteRequest completeL1 = new LessonCompleteRequest();
        completeL1.setEnrollmentId(enrollmentId);
        completeL1.setLessonId(lesson1.getId());

        LessonProgressResponse progressRes1 = progressService.completeLesson(student.getEmail(), completeL1);
        assertNotNull(progressRes1);
        assertEquals(new BigDecimal("50.00"), progressRes1.getProgressPercent());
        assertEquals(false, progressRes1.getIsCourseCompleted());

        // 3. Học viên hoàn thành bài 2 (2/2 = 100%)
        LessonCompleteRequest completeL2 = new LessonCompleteRequest();
        completeL2.setEnrollmentId(enrollmentId);
        completeL2.setLessonId(lesson2.getId());

        LessonProgressResponse progressRes2 = progressService.completeLesson(student.getEmail(), completeL2);
        assertNotNull(progressRes2);
        assertEquals(new BigDecimal("100.00"), progressRes2.getProgressPercent());
        assertTrue(progressRes2.getIsCourseCompleted());

        // 4. Học viên nộp bài thi Quiz với toàn bộ câu trả lời đúng
        QuizSubmissionRequest quizReq = new QuizSubmissionRequest();
        quizReq.setEnrollmentId(enrollmentId);
        quizReq.setStudentAnswers(List.of(
                new StudentAnswerDto(q1.getId(), a1_correct.getId()),
                new StudentAnswerDto(q2.getId(), a2_correct.getId())
        ));

        QuizResultResponse quizResult = quizService.submitQuiz(quiz.getId(), quizReq, student.getEmail());

        // 5. Kiểm tra kết quả chấm thi và cấp chứng chỉ
        assertNotNull(quizResult);
        assertTrue(quizResult.getPassed());
        assertEquals(100, quizResult.getScore());
        assertNotNull(quizResult.getCertificate());

        String certCode = quizResult.getCertificate().getCertificateCode();
        assertNotNull(certCode);
        assertTrue(certCode.startsWith("CERT-"));

        // 6. Truy vấn lại chứng chỉ qua CertificateService bằng mã xác thực
        CertificateResponse verifiedCert = certificateService.getCertificateByCode(certCode);
        assertNotNull(verifiedCert);
        assertEquals(certCode, verifiedCert.getCertificateCode());
        assertEquals(student.getFullName(), verifiedCert.getStudentName());
        assertEquals(course.getTitle(), verifiedCert.getCourseTitle());
        assertEquals(instructor.getFullName(), verifiedCert.getInstructorName());
    }
}
