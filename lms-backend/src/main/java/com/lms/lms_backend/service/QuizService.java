package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.dto.quiz.AnswerRequest;
import com.lms.lms_backend.dto.quiz.AnswerResponse;
import com.lms.lms_backend.dto.quiz.QuestionRequest;
import com.lms.lms_backend.dto.quiz.QuestionResponse;
import com.lms.lms_backend.dto.quiz.QuizCreateRequest;
import com.lms.lms_backend.dto.quiz.QuizResponse;
import com.lms.lms_backend.dto.quiz.QuizResultResponse;
import com.lms.lms_backend.dto.quiz.QuizSubmissionRequest;
import com.lms.lms_backend.dto.quiz.StudentAnswerDto;
import com.lms.lms_backend.entity.Answer;
import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Question;
import com.lms.lms_backend.entity.Quiz;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AnswerRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.QuestionRepository;
import com.lms.lms_backend.repository.QuizRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CertificateService certificateService;

    @Transactional
    public QuizResponse createFullQuiz(QuizCreateRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        Quiz quiz = Quiz.builder()
                .course(course)
                .title(req.getTitle())
                .passingScore(req.getPassingScore() != null ? req.getPassingScore() : 80)
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 15)
                .build();

        List<Question> questions = new ArrayList<>();

        for (QuestionRequest qr : req.getQuestions()) {
            Question question = Question.builder()
                    .quiz(quiz)
                    .questionText(qr.getQuestionText())
                    .point(qr.getPoint() != null ? qr.getPoint() : 1)
                    .build();

            List<Answer> answers = new ArrayList<>();
            for (AnswerRequest ar : qr.getAnswers()) {
                Answer answer = Answer.builder()
                        .question(question)
                        .answerText(ar.getAnswerText())
                        .isCorrect(Boolean.TRUE.equals(ar.getIsCorrect()))
                        .build();
                answers.add(answer);
            }
            question.setAnswers(answers);
            questions.add(question);
        }

        quiz.setQuestions(questions);
        Quiz saved = quizRepository.save(quiz);

        return mapToResponse(saved, false);
    }

    public List<QuizResponse> getQuizzesByCourseId(Long courseId, boolean isStudent) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(q -> mapToResponse(q, isStudent))
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id, boolean isStudent) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài kiểm tra không tồn tại với ID: " + id));
        return mapToResponse(quiz, isStudent);
    }

    @Transactional
    public QuizResultResponse submitQuiz(Long quizId, QuizSubmissionRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Bài kiểm tra không tồn tại!"));

        Enrollment enrollment = enrollmentRepository.findById(req.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Thông tin ghi danh không tồn tại!"));

        if (!enrollment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không sở hữu lượt ghi danh này!");
        }

        // Chấm điểm tự động
        Map<Long, Long> submissionMap = req.getStudentAnswers().stream()
                .collect(Collectors.toMap(StudentAnswerDto::getQuestionId, StudentAnswerDto::getSelectedAnswerId, (a, b) -> b));

        int totalScore = 0;
        int earnedScore = 0;

        for (Question question : quiz.getQuestions()) {
            int qPoint = question.getPoint() != null ? question.getPoint() : 1;
            totalScore += qPoint;

            Long selectedAnswerId = submissionMap.get(question.getId());
            if (selectedAnswerId != null) {
                boolean isCorrect = question.getAnswers().stream()
                        .anyMatch(ans -> ans.getId().equals(selectedAnswerId) && Boolean.TRUE.equals(ans.getIsCorrect()));
                if (isCorrect) {
                    earnedScore += qPoint;
                }
            }
        }

        int scorePercent = totalScore > 0 ? (int) Math.round(((double) earnedScore / totalScore) * 100) : 0;
        boolean passed = scorePercent >= quiz.getPassingScore();

        CertificateResponse certResponse = null;
        String message;

        if (passed) {
            // Kiểm tra điều kiện cấp chứng chỉ số: Progress == 100%
            boolean progressCompleted = enrollment.getProgressPercent().compareTo(BigDecimal.valueOf(100.00)) >= 0;

            if (progressCompleted) {
                Certificate certificate = certificateService.issueCertificate(enrollment);
                certResponse = certificateService.mapToResponse(certificate);
                message = "Chúc mừng! Bạn đã hoàn thành xuất sắc bài Quiz (" + scorePercent + "%) và toàn bộ khóa học. Chứng chỉ số của bạn đã được cấp!";
            } else {
                message = "Chúc mừng! Bạn đã đạt bài Quiz (" + scorePercent + "%). Hãy hoàn thành nốt các bài giảng còn lại (hiện tại " + enrollment.getProgressPercent() + "%) để nhận Chứng chỉ tốt nghiệp!";
            }
        } else {
            message = "Bạn chưa đạt điểm yêu cầu (" + scorePercent + "% / " + quiz.getPassingScore() + "%). Hãy ôn tập lại bài giảng và thử lại!";
        }

        return QuizResultResponse.builder()
                .passed(passed)
                .score(scorePercent)
                .totalScore(100)
                .passingScore(quiz.getPassingScore())
                .message(message)
                .certificateUrl(certResponse != null ? certResponse.getPdfUrl() : null)
                .certificate(certResponse)
                .build();
    }

    private QuizResponse mapToResponse(Quiz q, boolean isStudent) {
        List<QuestionResponse> questionResponses = q.getQuestions().stream()
                .map(quest -> QuestionResponse.builder()
                        .id(quest.getId())
                        .questionText(quest.getQuestionText())
                        .point(quest.getPoint())
                        .answers(quest.getAnswers().stream()
                                .map(ans -> AnswerResponse.builder()
                                        .id(ans.getId())
                                        .answerText(ans.getAnswerText())
                                        .isCorrect(isStudent ? null : ans.getIsCorrect())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return QuizResponse.builder()
                .id(q.getId())
                .courseId(q.getCourse().getId())
                .title(q.getTitle())
                .passingScore(q.getPassingScore())
                .durationMinutes(q.getDurationMinutes())
                .totalQuestions(q.getQuestions().size())
                .questions(questionResponses)
                .build();
    }
}
