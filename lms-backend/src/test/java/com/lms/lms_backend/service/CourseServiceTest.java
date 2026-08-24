package com.lms.lms_backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourseService courseService;

    private User instructor;
    private User otherInstructor;
    private Category category;
    private Course draftCourse;

    @BeforeEach
    void setUp() {
        instructor = User.builder()
                .id(2L)
                .email("instructor@lms.com")
                .fullName("TS. Nguyễn Văn A")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        otherInstructor = User.builder()
                .id(3L)
                .email("other_instructor@lms.com")
                .fullName("TS. Trần Văn B")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        category = Category.builder()
                .id(1L)
                .name("Lập trình Web")
                .slug("lap-trinh-web")
                .build();

        draftCourse = Course.builder()
                .id(10L)
                .title("Lập trình Web Fullstack")
                .slug("web-fullstack")
                .instructor(instructor)
                .category(category)
                .status(CourseStatus.DRAFT)
                .build();
    }

    @Test
    @DisplayName("Tạo khóa học mới thành công với trạng thái mặc định DRAFT")
    void createCourse_Success() {
        CourseCreateRequest req = new CourseCreateRequest();
        req.setTitle("Lập trình Web Fullstack");
        req.setSlug("web-fullstack");
        req.setCategoryId(1L);
        req.setDescription("Mô tả khóa học");

        when(courseRepository.existsBySlug("web-fullstack")).thenReturn(false);
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(courseRepository.save(any(Course.class))).thenReturn(draftCourse);

        CourseResponse res = courseService.createCourse(req, "instructor@lms.com");

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("web-fullstack", res.getSlug());
        assertEquals(CourseStatus.DRAFT, res.getStatus());

        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi tạo khóa học có slug đã tồn tại")
    void createCourse_DuplicateSlug_ThrowsException() {
        CourseCreateRequest req = new CourseCreateRequest();
        req.setSlug("web-fullstack");

        when(courseRepository.existsBySlug("web-fullstack")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                courseService.createCourse(req, "instructor@lms.com")
        );

        assertTrue(ex.getMessage().contains("Slug khóa học đã tồn tại"));
        verify(courseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Giảng viên gửi duyệt khóa học chuyển DRAFT -> PENDING")
    void submitForReview_Success() {
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.submitForReview(10L, "instructor@lms.com");

        assertNotNull(res);
        assertEquals(CourseStatus.PENDING, res.getStatus());
        assertEquals(CourseStatus.PENDING, draftCourse.getStatus());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi giảng viên khác cố tình gửi duyệt khóa học không phải của mình")
    void submitForReview_NotOwner_ThrowsException() {
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse)); // owner is instructor@lms.com
        when(userRepository.findByEmail("other_instructor@lms.com")).thenReturn(Optional.of(otherInstructor));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                courseService.submitForReview(10L, "other_instructor@lms.com")
        );

        assertTrue(ex.getMessage().contains("không có quyền gửi duyệt"));
    }

    @Test
    @DisplayName("Admin phê duyệt khóa học chuyển PENDING -> PUBLISHED")
    void approveCourse_Success() {
        draftCourse.setStatus(CourseStatus.PENDING);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.approveCourse(10L);

        assertNotNull(res);
        assertEquals(CourseStatus.PUBLISHED, res.getStatus());
        assertEquals(CourseStatus.PUBLISHED, draftCourse.getStatus());
    }

    @Test
    @DisplayName("Admin từ chối duyệt khóa học chuyển PENDING -> REJECTED")
    void rejectCourse_Success() {
        draftCourse.setStatus(CourseStatus.PENDING);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.rejectCourse(10L);

        assertNotNull(res);
        assertEquals(CourseStatus.REJECTED, res.getStatus());
        assertEquals(CourseStatus.REJECTED, draftCourse.getStatus());
    }
}
