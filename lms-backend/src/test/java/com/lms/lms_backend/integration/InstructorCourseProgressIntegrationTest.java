package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.instructor.CourseStudentProgressResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Lesson;
import com.lms.lms_backend.entity.LessonProgress;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.Section;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.EnrollmentService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class InstructorCourseProgressIntegrationTest {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    private User instructorA;
    private User instructorB;
    private User student1;
    private User student2;
    private Course courseA;

    @BeforeEach
    void setUp() {
        instructorA = userRepository.save(User.builder()
                .username("instructorA")
                .email("instructorA@test.com")
                .password("hash123")
                .fullName("Giảng viên A")
                .role(Role.ROLE_INSTRUCTOR)
                .build());

        instructorB = userRepository.save(User.builder()
                .username("instructorB")
                .email("instructorB@test.com")
                .password("hash123")
                .fullName("Giảng viên B")
                .role(Role.ROLE_INSTRUCTOR)
                .build());

        student1 = userRepository.save(User.builder()
                .username("student1")
                .email("student1@test.com")
                .password("hash123")
                .fullName("Học viên Một")
                .role(Role.ROLE_STUDENT)
                .build());

        student2 = userRepository.save(User.builder()
                .username("student2")
                .email("student2@test.com")
                .password("hash123")
                .fullName("Học viên Hai")
                .role(Role.ROLE_STUDENT)
                .build());

        courseA = courseRepository.save(Course.builder()
                .title("Khóa học Lập trình Web")
                .slug("khoa-hoc-lap-trinh-web-" + System.currentTimeMillis())
                .instructor(instructorA)
                .price(BigDecimal.ZERO)
                .status(CourseStatus.PUBLISHED)
                .build());

        Section section = sectionRepository.save(Section.builder()
                .title("Chương 1")
                .course(courseA)
                .orderIndex(1)
                .build());

        Lesson l1 = lessonRepository.save(Lesson.builder()
                .title("Bài 1")
                .section(section)
                .orderIndex(1)
                .durationMinutes(10)
                .build());

        Lesson l2 = lessonRepository.save(Lesson.builder()
                .title("Bài 2")
                .section(section)
                .orderIndex(2)
                .durationMinutes(15)
                .build());

        Enrollment e1 = enrollmentRepository.save(Enrollment.builder()
                .user(student1)
                .course(courseA)
                .progressPercent(new BigDecimal("50.00"))
                .isCompleted(false)
                .build());

        Enrollment e2 = enrollmentRepository.save(Enrollment.builder()
                .user(student2)
                .course(courseA)
                .progressPercent(new BigDecimal("100.00"))
                .isCompleted(true)
                .build());

        lessonProgressRepository.save(LessonProgress.builder()
                .enrollment(e1)
                .lesson(l1)
                .isCompleted(true)
                .build());

        lessonProgressRepository.save(LessonProgress.builder()
                .enrollment(e2)
                .lesson(l1)
                .isCompleted(true)
                .build());

        lessonProgressRepository.save(LessonProgress.builder()
                .enrollment(e2)
                .lesson(l2)
                .isCompleted(true)
                .build());
    }

    @Test
    @DisplayName("Giảng viên sở hữu khóa học xem tiến độ học viên chính xác")
    void getCourseStudentProgress_OwnerSuccess() {
        List<CourseStudentProgressResponse> list = enrollmentService.getCourseStudentProgress(instructorA.getEmail(), courseA.getId());

        assertNotNull(list);
        assertEquals(2, list.size());

        // Kiểm tra học viên 2
        CourseStudentProgressResponse s2Prog = list.stream()
                .filter(s -> s.getEmail().equals(student2.getEmail()))
                .findFirst()
                .orElse(null);
        assertNotNull(s2Prog);
        assertEquals("Học viên Hai", s2Prog.getFullName());
        assertTrue(s2Prog.getIsCompleted());
        assertEquals(new BigDecimal("100.00"), s2Prog.getProgressPercent());
        assertEquals(2L, s2Prog.getCompletedLessonsCount());
        assertEquals(2L, s2Prog.getTotalLessonsCount());

        // Kiểm tra học viên 1
        CourseStudentProgressResponse s1Prog = list.stream()
                .filter(s -> s.getEmail().equals(student1.getEmail()))
                .findFirst()
                .orElse(null);
        assertNotNull(s1Prog);
        assertEquals("Học viên Một", s1Prog.getFullName());
        assertFalse(s1Prog.getIsCompleted());
        assertEquals(new BigDecimal("50.00"), s1Prog.getProgressPercent());
        assertEquals(1L, s1Prog.getCompletedLessonsCount());
        assertEquals(2L, s1Prog.getTotalLessonsCount());
    }

    @Test
    @DisplayName("Giảng viên khác không được phép xem tiến độ của khóa học người khác")
    void getCourseStudentProgress_AccessDeniedForOtherInstructor() {
        assertThrows(AccessDeniedException.class, () ->
                enrollmentService.getCourseStudentProgress(instructorB.getEmail(), courseA.getId())
        );
    }

    @Test
    @DisplayName("Giảng viên xem tổng quan toàn bộ học viên các khóa học mình dạy")
    void getAllCoursesStudentProgress_Success() {
        List<CourseStudentProgressResponse> all = enrollmentService.getAllCoursesStudentProgress(instructorA.getEmail());

        assertNotNull(all);
        assertEquals(2, all.size());
    }
}
