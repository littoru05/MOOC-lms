package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.enrollment.EnrollmentResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseService courseService;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private CertificateRepository certificateRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private User student;
    private Course publishedCourse;
    private Course draftCourse;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        publishedCourse = Course.builder()
                .id(10L)
                .title("Lập trình Spring Boot 3")
                .slug("spring-boot-3")
                .status(CourseStatus.PUBLISHED)
                .build();

        draftCourse = Course.builder()
                .id(20L)
                .title("Khóa học Bản thảo")
                .slug("draft-course")
                .status(CourseStatus.DRAFT)
                .build();
    }

    @Test
    @DisplayName("Ghi danh thành công vào khóa học đã xuất bản")
    void enrollCourse_Success() {
        // Arrange
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(publishedCourse));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);

        Enrollment savedEnrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(publishedCourse)
                .progressPercent(BigDecimal.ZERO)
                .isCompleted(false)
                .enrolledAt(LocalDateTime.now())
                .build();

        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(savedEnrollment);
        when(courseService.mapToResponse(publishedCourse)).thenReturn(CourseResponse.builder().id(10L).title("Lập trình Spring Boot 3").build());

        // Act
        EnrollmentResponse response = enrollmentService.enrollCourse("student@lms.com", 10L);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals(10L, response.getCourseId());
        assertEquals(BigDecimal.ZERO, response.getProgressPercent());
        assertFalse(response.getIsCompleted());

        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi người dùng không tồn tại")
    void enrollCourse_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@lms.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse("unknown@lms.com", 10L)
        );

        assertTrue(exception.getMessage().contains("Người dùng không tồn tại"));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi khóa học không tồn tại")
    void enrollCourse_CourseNotFound_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse("student@lms.com", 999L)
        );

        assertTrue(exception.getMessage().contains("Khóa học không tồn tại"));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi khóa học chưa được PUBLISHED (DRAFT/PENDING)")
    void enrollCourse_CourseNotPublished_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(20L)).thenReturn(Optional.of(draftCourse));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse("student@lms.com", 20L)
        );

        assertTrue(exception.getMessage().contains("chưa được công khai"));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi ghi danh trực tiếp vào khóa học có phí (price > 0)")
    void enrollCourse_PaidCourse_ThrowsException() {
        Course paidCourse = Course.builder()
                .id(30L)
                .title("Khóa học Chuyên sâu có phí")
                .slug("khoa-hoc-co-phi")
                .status(CourseStatus.PUBLISHED)
                .price(new BigDecimal("500000"))
                .build();

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(30L)).thenReturn(Optional.of(paidCourse));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse("student@lms.com", 30L)
        );

        assertTrue(exception.getMessage().contains("Khóa học có phí, vui lòng thêm vào giỏ hàng"));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi học viên đã đăng ký khóa học này trước đó")
    void enrollCourse_AlreadyEnrolled_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(publishedCourse));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse("student@lms.com", 10L)
        );

        assertTrue(exception.getMessage().contains("Bạn đã đăng ký khóa học này rồi"));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Lấy danh sách các khóa học đã đăng ký của tôi")
    void getMyEnrollments_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));

        Enrollment enrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(publishedCourse)
                .progressPercent(new BigDecimal("50.00"))
                .isCompleted(false)
                .build();

        when(enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(1L)).thenReturn(List.of(enrollment));
        when(courseService.mapToResponse(publishedCourse)).thenReturn(CourseResponse.builder().id(10L).build());

        List<EnrollmentResponse> responses = enrollmentService.getMyEnrollments("student@lms.com");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(100L, responses.get(0).getId());
        assertEquals(new BigDecimal("50.00"), responses.get(0).getProgressPercent());
    }

    @Test
    @DisplayName("Kiểm tra trạng thái isEnrolled")
    void isEnrolled_ReturnsBoolean() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(true);
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 99L)).thenReturn(false);

        assertTrue(enrollmentService.isEnrolled("student@lms.com", 10L));
        assertFalse(enrollmentService.isEnrolled("student@lms.com", 99L));
    }

    @Test
    @DisplayName("Giảng viên xem tiến độ học viên của khóa học thành công")
    void getCourseStudentProgress_Success() {
        User instructor = User.builder()
                .id(2L)
                .email("instructor@lms.com")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        Course course = Course.builder()
                .id(10L)
                .title("Khóa học Java")
                .instructor(instructor)
                .build();

        Enrollment enrollment = Enrollment.builder()
                .id(100L)
                .user(student)
                .course(course)
                .progressPercent(new BigDecimal("50.00"))
                .isCompleted(false)
                .enrolledAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.findByCourseIdWithUserAndCourse(10L)).thenReturn(List.of(enrollment));
        when(lessonRepository.countByCourseId(10L)).thenReturn(4L);
        when(lessonProgressRepository.countCompletedLessonsByEnrollmentIds(List.of(100L)))
                .thenReturn(List.<Object[]>of(new Object[]{100L, 2L}));
        when(certificateRepository.findFinalScoresByEnrollmentIds(List.of(100L)))
                .thenReturn(List.<Object[]>of(new Object[]{100L, 95}));

        var results = enrollmentService.getCourseStudentProgress("instructor@lms.com", 10L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Trần Văn Học Viên", results.get(0).getFullName());
        assertEquals("student@lms.com", results.get(0).getEmail());
        assertEquals(new BigDecimal("50.00"), results.get(0).getProgressPercent());
        assertEquals(2L, results.get(0).getCompletedLessonsCount());
        assertEquals(4L, results.get(0).getTotalLessonsCount());
        assertEquals(95, results.get(0).getQuizScore());
    }

    @Test
    @DisplayName("Giảng viên khác không được xem tiến độ khóa học không sở hữu")
    void getCourseStudentProgress_AccessDenied_WhenNotOwner() {
        User instructorA = User.builder()
                .id(2L)
                .email("instructorA@lms.com")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        User instructorB = User.builder()
                .id(3L)
                .email("instructorB@lms.com")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        Course course = Course.builder()
                .id(10L)
                .instructor(instructorB)
                .build();

        when(userRepository.findByEmail("instructorA@lms.com")).thenReturn(Optional.of(instructorA));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                enrollmentService.getCourseStudentProgress("instructorA@lms.com", 10L)
        );
    }
}
