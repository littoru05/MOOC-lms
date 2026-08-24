package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.dto.quiz.QuizResultResponse;
import com.lms.lms_backend.dto.quiz.QuizSubmissionRequest;
import com.lms.lms_backend.dto.quiz.StudentAnswerDto;
import com.lms.lms_backend.entity.Answer;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Question;
import com.lms.lms_backend.entity.Quiz;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AnswerRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.QuestionRepository;
import com.lms.lms_backend.repository.QuizRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CertificateService certificateService;

    @InjectMocks
    private QuizService quizService;

    private User student;
    private Course course;
    private Enrollment fullEnrollment;
    private Enrollment partialEnrollment;
    private Quiz quiz;
    private Question q1, q2;
    private Answer a1_correct, a1_wrong, a2_correct, a2_wrong;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .build();

        course = Course.builder()
                .id(10L)
                .title("Fullstack Spring Boot")
                .build();

        fullEnrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(course)
                .progressPercent(new BigDecimal("100.00"))
                .isCompleted(true)
                .build();

        partialEnrollment = Enrollment.builder()
                .id(101L)
                .user(student)
                .course(course)
                .progressPercent(new BigDecimal("50.00"))
                .isCompleted(false)
                .build();

        quiz = Quiz.builder()
                .id(1L)
                .course(course)
                .title("Final Assessment")
                .passingScore(80)
                .durationMinutes(15)
                .build();

        q1 = Question.builder().id(10L).quiz(quiz).questionText("Câu hỏi 1").point(1).build();
        a1_correct = Answer.builder().id(101L).question(q1).answerText("Đáp án đúng 1").isCorrect(true).build();
        a1_wrong = Answer.builder().id(102L).question(q1).answerText("Đáp án sai 1").isCorrect(false).build();
        q1.setAnswers(List.of(a1_correct, a1_wrong));

        q2 = Question.builder().id(20L).quiz(quiz).questionText("Câu hỏi 2").point(1).build();
        a2_correct = Answer.builder().id(201L).question(q2).answerText("Đáp án đúng 2").isCorrect(true).build();
        a2_wrong = Answer.builder().id(202L).question(q2).answerText("Đáp án sai 2").isCorrect(false).build();
        q2.setAnswers(List.of(a2_correct, a2_wrong));

        quiz.setQuestions(List.of(q1, q2));
    }

    @Test
    @DisplayName("Nộp bài đạt 100% và tiến độ học đã 100% -> Đạt bài thi và tự động cấp chứng chỉ")
    void submitQuiz_Passed_WithFullProgress_IssuesCertificate() {
        QuizSubmissionRequest req = new QuizSubmissionRequest();
        req.setEnrollmentId(100L);
        req.setStudentAnswers(List.of(
                new StudentAnswerDto(10L, 101L), // Đúng câu 1
                new StudentAnswerDto(20L, 201L)  // Đúng câu 2
        ));

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(fullEnrollment));

        Certificate cert = Certificate.builder()
                .id(500L)
                .certificateCode("CERT-ABCD-123")
                .pdfUrl("/api/v1/certificates/download/CERT-ABCD-123")
                .build();

        CertificateResponse certRes = CertificateResponse.builder()
                .certificateCode("CERT-ABCD-123")
                .pdfUrl("/api/v1/certificates/download/CERT-ABCD-123")
                .build();

        when(certificateService.issueCertificate(fullEnrollment)).thenReturn(cert);
        when(certificateService.mapToResponse(cert)).thenReturn(certRes);

        QuizResultResponse result = quizService.submitQuiz(1L, req, "student@lms.com");

        assertNotNull(result);
        assertTrue(result.getPassed());
        assertEquals(100, result.getScore());
        assertNotNull(result.getCertificate());
        assertEquals("CERT-ABCD-123", result.getCertificate().getCertificateCode());
        assertTrue(result.getMessage().contains("Chứng chỉ số của bạn đã được cấp"));

        verify(certificateService, times(1)).issueCertificate(fullEnrollment);
    }

    @Test
    @DisplayName("Nộp bài đạt 100% nhưng tiến độ học mới 50% -> Đạt bài thi nhưng CHƯA cấp chứng chỉ")
    void submitQuiz_Passed_WithIncompleteProgress_NoCertificate() {
        QuizSubmissionRequest req = new QuizSubmissionRequest();
        req.setEnrollmentId(101L);
        req.setStudentAnswers(List.of(
                new StudentAnswerDto(10L, 101L),
                new StudentAnswerDto(20L, 201L)
        ));

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(101L)).thenReturn(Optional.of(partialEnrollment));

        QuizResultResponse result = quizService.submitQuiz(1L, req, "student@lms.com");

        assertNotNull(result);
        assertTrue(result.getPassed());
        assertEquals(100, result.getScore());
        assertNull(result.getCertificate());
        assertTrue(result.getMessage().contains("Hãy hoàn thành nốt các bài giảng còn lại"));

        verify(certificateService, never()).issueCertificate(any());
    }

    @Test
    @DisplayName("Nộp bài chỉ đúng 1/2 câu (50% < 80% passing) -> Không đạt bài thi")
    void submitQuiz_Failed_ScoreBelowPassing() {
        QuizSubmissionRequest req = new QuizSubmissionRequest();
        req.setEnrollmentId(100L);
        req.setStudentAnswers(List.of(
                new StudentAnswerDto(10L, 101L), // Đúng câu 1
                new StudentAnswerDto(20L, 202L)  // Sai câu 2
        ));

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(fullEnrollment));

        QuizResultResponse result = quizService.submitQuiz(1L, req, "student@lms.com");

        assertNotNull(result);
        assertFalse(result.getPassed());
        assertEquals(50, result.getScore());
        assertNull(result.getCertificate());
        assertTrue(result.getMessage().contains("Bạn chưa đạt điểm yêu cầu"));

        verify(certificateService, never()).issueCertificate(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi nộp bài cho Enrollment của học viên khác")
    void submitQuiz_NotOwner_ThrowsException() {
        User otherUser = User.builder().id(99L).email("other@lms.com").build();

        QuizSubmissionRequest req = new QuizSubmissionRequest();
        req.setEnrollmentId(100L); // belongs to student (id=1)
        req.setStudentAnswers(List.of());

        when(userRepository.findByEmail("other@lms.com")).thenReturn(Optional.of(otherUser));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(fullEnrollment));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                quizService.submitQuiz(1L, req, "other@lms.com")
        );

        assertTrue(ex.getMessage().contains("không sở hữu lượt ghi danh này"));
    }
}
