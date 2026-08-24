package com.lms.lms_backend.integration;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.enrollment.EnrollmentResponse;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AdminService;
import com.lms.lms_backend.service.CourseService;
import com.lms.lms_backend.service.EnrollmentService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CoursePublishingFlowIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private EnrollmentService enrollmentService;

    private User instructor;
    private User student;
    private Category category;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(User.builder()
                .username("prof_nam")
                .email("nam@lms.com")
                .password("hash123")
                .fullName("PGS. TS. Trần Văn Nam")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build());

        student = userRepository.save(User.builder()
                .username("student_linh")
                .email("linh@lms.com")
                .password("hash123")
                .fullName("Nguyễn Thùy Linh")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build());

        category = categoryRepository.save(Category.builder()
                .name("Trí tuệ nhân tạo")
                .slug("tri-tue-nhan-tao")
                .description("Khóa học AI")
                .build());
    }

    @Test
    @DisplayName("Luồng Tích hợp Quản lý & Kiểm duyệt: Tạo DRAFT -> Chặn học viên -> Gửi PENDING -> Admin duyệt PUBLISHED -> Học viên ghi danh")
    void courseLifecycle_DraftToPublishedAndEnroll_Success() {
        // 1. Giảng viên tạo mới khóa học
        CourseCreateRequest createReq = new CourseCreateRequest();
        createReq.setTitle("Deep Learning Nâng cao với PyTorch");
        createReq.setSlug("deep-learning-nang-cao-pytorch");
        createReq.setCategoryId(category.getId());
        createReq.setDescription("Chuyên sâu mạng nơ-ron tích chập và Transformer");

        CourseResponse createdCourse = courseService.createCourse(createReq, instructor.getEmail());
        assertNotNull(createdCourse);
        assertEquals(CourseStatus.DRAFT, createdCourse.getStatus());
        Long courseId = createdCourse.getId();

        // 2. Học viên cố tình ghi danh khóa học đang ở trạng thái DRAFT -> Phải bị từ chối
        RuntimeException draftEnrollEx = assertThrows(RuntimeException.class, () ->
                enrollmentService.enrollCourse(student.getEmail(), courseId)
        );
        assertTrue(draftEnrollEx.getMessage().contains("chưa được công khai"));

        // 3. Giảng viên gửi duyệt khóa học (DRAFT -> PENDING)
        CourseResponse pendingCourse = courseService.submitForReview(courseId, instructor.getEmail());
        assertEquals(CourseStatus.PENDING, pendingCourse.getStatus());

        // 4. Admin kiểm tra danh sách khóa học đang chờ duyệt
        List<CourseResponse> pendingList = adminService.getPendingCourses();
        assertTrue(pendingList.stream().anyMatch(c -> c.getId().equals(courseId)));

        // 5. Admin phê duyệt khóa học (PENDING -> PUBLISHED)
        CourseResponse approvedCourse = adminService.approveCourse(courseId);
        assertEquals(CourseStatus.PUBLISHED, approvedCourse.getStatus());

        // 6. Học viên ghi danh khóa học đã PUBLISHED -> Thành công
        EnrollmentResponse enrollRes = enrollmentService.enrollCourse(student.getEmail(), courseId);
        assertNotNull(enrollRes);
        assertEquals(courseId, enrollRes.getCourseId());
        assertEquals(student.getId(), enrollRes.getUserId());
    }
}
