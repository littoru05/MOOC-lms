package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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

import com.lms.lms_backend.dto.progress.LessonCompleteRequest;
import com.lms.lms_backend.dto.progress.LessonProgressResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.LessonProgress;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProgressService progressService;

    private User student;
    private User otherStudent;
    private Course course;
    private Enrollment enrollment;
    private Lesson lesson1;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .build();

        otherStudent = User.builder()
                .id(2L)
                .email("other@lms.com")
                .fullName("Người dùng khác")
                .role(Role.ROLE_STUDENT)
                .build();

        course = Course.builder()
                .id(10L)
                .title("Fullstack Spring Boot")
                .build();

        enrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(course)
                .progressPercent(BigDecimal.ZERO)
                .isCompleted(false)
                .build();

        lesson1 = Lesson.builder()
                .id(50L)
                .title("Bài 1: Cài đặt môi trường")
                .build();
    }

    @Test
    @DisplayName("Hoàn thành bài học 1/4 (25%) - tiến độ cập nhật chính xác, khóa học chưa xong")
    void completeLesson_PartialProgress_Success() {
        // Arrange
        LessonCompleteRequest req = new LessonCompleteRequest();
        req.setEnrollmentId(100L);
        req.setLessonId(50L);

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findById(50L)).thenReturn(Optional.of(lesson1));
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(100L, 50L)).thenReturn(Optional.empty());

        when(lessonRepository.countByCourseId(10L)).thenReturn(4L);
        when(lessonProgressRepository.countCompletedLessonsByEnrollmentId(100L)).thenReturn(1L);

        // Act
        LessonProgressResponse response = progressService.completeLesson("student@lms.com", req);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getEnrollmentId());
        assertEquals(50L, response.getLessonId());
        assertTrue(response.getIsCompleted());
        assertEquals(new BigDecimal("25.00"), response.getProgressPercent());
        assertFalse(response.getIsCourseCompleted());

        verify(lessonProgressRepository, times(1)).save(any(LessonProgress.class));
        verify(enrollmentRepository, times(1)).save(enrollment);
    }

    @Test
    @DisplayName("Hoàn thành bài học cuối cùng 4/4 (100%) - tự động cập nhật isCompleted=true cho khóa học")
    void completeLesson_FullProgress_Success() {
        LessonCompleteRequest req = new LessonCompleteRequest();
        req.setEnrollmentId(100L);
        req.setLessonId(50L);

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(lessonRepository.findById(50L)).thenReturn(Optional.of(lesson1));
        when(lessonProgressRepository.findByEnrollmentIdAndLessonId(100L, 50L)).thenReturn(Optional.empty());

        when(lessonRepository.countByCourseId(10L)).thenReturn(4L);
        when(lessonProgressRepository.countCompletedLessonsByEnrollmentId(100L)).thenReturn(4L);

        LessonProgressResponse response = progressService.completeLesson("student@lms.com", req);

        assertNotNull(response);
        assertEquals(new BigDecimal("100.00"), response.getProgressPercent());
        assertTrue(response.getIsCourseCompleted());
        assertTrue(enrollment.getIsCompleted());

        verify(enrollmentRepository, times(1)).save(enrollment);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi người dùng không sở hữu Enrollment này")
    void completeLesson_NotOwner_ThrowsException() {
        LessonCompleteRequest req = new LessonCompleteRequest();
        req.setEnrollmentId(100L);
        req.setLessonId(50L);

        when(userRepository.findByEmail("other@lms.com")).thenReturn(Optional.of(otherStudent));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment)); // belongs to student (id=1)

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                progressService.completeLesson("other@lms.com", req)
        );

        assertTrue(exception.getMessage().contains("không sở hữu lượt ghi danh này"));
        verify(lessonProgressRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi Enrollment không tồn tại")
    void completeLesson_EnrollmentNotFound_ThrowsException() {
        LessonCompleteRequest req = new LessonCompleteRequest();
        req.setEnrollmentId(999L);
        req.setLessonId(50L);

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                progressService.completeLesson("student@lms.com", req)
        );

        assertTrue(exception.getMessage().contains("Thông tin ghi danh không tồn tại"));
        verify(lessonProgressRepository, never()).save(any());
    }

    @Test
    @DisplayName("Lấy danh sách tiến độ các bài học theo enrollment")
    void getProgressByEnrollment_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));

        LessonProgress lp1 = LessonProgress.builder()
                .id(1L)
                .enrollment(enrollment)
                .lesson(lesson1)
                .isCompleted(true)
                .build();

        when(lessonProgressRepository.findByEnrollmentId(100L)).thenReturn(List.of(lp1));

        List<LessonProgressResponse> result = progressService.getProgressByEnrollment("student@lms.com", 100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(50L, result.get(0).getLessonId());
        assertTrue(result.get(0).getIsCompleted());
    }
}
