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
import com.lms.lms_backend.dto.course.CourseDeleteResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

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

    @Test
    @DisplayName("Giảng viên gửi yêu cầu xóa khóa học chuyển trạng thái -> PENDING_DELETE")
    void requestDeleteCourse_Success() {
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.requestDeleteCourse(10L, "instructor@lms.com");

        assertNotNull(res);
        assertEquals(CourseStatus.PENDING_DELETE, res.getStatus());
        assertEquals(CourseStatus.PENDING_DELETE, draftCourse.getStatus());
        verify(courseRepository).save(draftCourse);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi user không phải chủ sở hữu gửi yêu cầu xóa")
    void requestDeleteCourse_Unauthorized_ThrowsException() {
        User otherInstructor = User.builder().id(99L).email("other@lms.com").role(Role.ROLE_INSTRUCTOR).build();
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("other@lms.com")).thenReturn(Optional.of(otherInstructor));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                courseService.requestDeleteCourse(10L, "other@lms.com")
        );

        assertTrue(ex.getMessage().contains("không có quyền yêu cầu xóa"));
        verify(courseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Admin phê duyệt yêu cầu xóa: thực hiện xóa mềm khóa học khi chưa có học viên")
    void approveCourse_PendingDelete_DeletesCourse() {
        draftCourse.setStatus(CourseStatus.PENDING_DELETE);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));
        when(enrollmentRepository.countByCourseId(10L)).thenReturn(0L);

        CourseResponse res = courseService.approveCourse(10L);

        assertNotNull(res);
        assertTrue(res.getIsDeleted());
        verify(courseRepository).save(draftCourse);
    }

    @Test
    @DisplayName("Admin từ chối yêu cầu xóa: khôi phục khóa học về PUBLISHED")
    void rejectCourse_PendingDelete_RestoresPublished() {
        draftCourse.setStatus(CourseStatus.PENDING_DELETE);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(draftCourse));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.rejectCourse(10L);

        assertNotNull(res);
        assertEquals(CourseStatus.PUBLISHED, res.getStatus());
        assertEquals(CourseStatus.PUBLISHED, draftCourse.getStatus());
        verify(courseRepository).save(draftCourse);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi tạo khóa học với giá âm")
    void createCourse_NegativePrice_ThrowsException() {
        CourseCreateRequest req = new CourseCreateRequest();
        req.setTitle("Khóa học giá âm");
        req.setSlug("khoa-hoc-gia-am");
        req.setPrice(new java.math.BigDecimal("-50000"));

        when(courseRepository.existsBySlug("khoa-hoc-gia-am")).thenReturn(false);
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                courseService.createCourse(req, "instructor@lms.com")
        );

        assertTrue(ex.getMessage().contains("Giá khóa học không được âm"));
    }

    @Test
    @DisplayName("Lấy danh sách khóa học public có áp dụng filter Specification")
    void getAllPublishedCourses_WithFilters_Success() {
        Course publishedCourse = Course.builder()
                .id(1L)
                .title("Khóa học có phí")
                .slug("khoa-hoc-co-phi")
                .price(new java.math.BigDecimal("499000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .category(category)
                .build();

        when(courseRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(java.util.List.of(publishedCourse));

        java.util.List<CourseResponse> result = courseService.getAllPublishedCourses(
                "paid", new java.math.BigDecimal("100000"), new java.math.BigDecimal("600000"), 1L, "Khóa học"
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(new java.math.BigDecimal("499000"), result.get(0).getPrice());
        verify(courseRepository, times(1)).findAll(any(org.springframework.data.jpa.domain.Specification.class));
    }

    @Test
    @DisplayName("Xóa khóa học khi chưa có học viên -> Xóa mềm (isDeleted=true)")
    void deleteCourse_ZeroEnrollments_SoftDeletes() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(enrollmentRepository.countByCourseId(1L)).thenReturn(0L);

        CourseDeleteResponse response = courseService.deleteCourse(1L, "instructor@lms.com");

        assertNotNull(response);
        assertEquals(1L, response.getCourseId());
        assertEquals(CourseStatus.DRAFT, response.getStatus());
        assertTrue(response.isDeleted());
        org.junit.jupiter.api.Assertions.assertFalse(response.isArchived());
        assertEquals(0L, response.getEnrolledCount());
        assertTrue(draftCourse.getIsDeleted());
        assertEquals(CourseStatus.DRAFT, draftCourse.getStatus());
        org.junit.jupiter.api.Assertions.assertNotNull(draftCourse.getDeletedAt());
        verify(courseRepository, times(1)).save(draftCourse);
    }

    @Test
    @DisplayName("Xóa khóa học khi ĐÃ có học viên -> Chuyển sang ARCHIVED (isArchived=true, isDeleted=false)")
    void deleteCourse_HasEnrollments_Archives() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(enrollmentRepository.countByCourseId(1L)).thenReturn(12L);

        CourseDeleteResponse response = courseService.deleteCourse(1L, "instructor@lms.com");

        assertNotNull(response);
        assertEquals(1L, response.getCourseId());
        org.junit.jupiter.api.Assertions.assertFalse(response.isDeleted());
        assertTrue(response.isArchived());
        assertEquals(CourseStatus.ARCHIVED, response.getStatus());
        assertEquals(12L, response.getEnrolledCount());
        assertEquals(CourseStatus.ARCHIVED, draftCourse.getStatus());
        org.junit.jupiter.api.Assertions.assertFalse(draftCourse.getIsDeleted());
        verify(courseRepository, times(1)).save(draftCourse);
    }

    @Test
    @DisplayName("Khôi phục khóa học đang ở trạng thái ARCHIVED -> Thành công chuyển về PUBLISHED")
    void restoreCourse_ArchivedCourse_Success() {
        draftCourse.setStatus(CourseStatus.ARCHIVED);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(draftCourse));
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponse res = courseService.restoreCourse(1L, "instructor@lms.com");

        assertNotNull(res);
        assertEquals(CourseStatus.PUBLISHED, res.getStatus());
        assertEquals(CourseStatus.PUBLISHED, draftCourse.getStatus());
        org.junit.jupiter.api.Assertions.assertFalse(draftCourse.getIsDeleted());
        org.junit.jupiter.api.Assertions.assertNull(draftCourse.getDeletedAt());
        verify(courseRepository, times(1)).save(draftCourse);
    }
}
