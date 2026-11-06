package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.lms.lms_backend.dto.audit.AuditLogPageResponse;
import com.lms.lms_backend.dto.audit.AuditLogResponse;
import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.course.CourseUpdateRequest;
import com.lms.lms_backend.dto.lesson.LessonRequest;
import com.lms.lms_backend.dto.section.SectionRequest;
import com.lms.lms_backend.dto.section.SectionResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.ContentType;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.AuditLogRepository;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.NotificationRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AdminService;
import com.lms.lms_backend.service.AuditLogService;
import com.lms.lms_backend.service.CourseService;
import com.lms.lms_backend.service.LessonService;
import com.lms.lms_backend.service.SectionService;

@SpringBootTest
@ActiveProfiles("test")
public class InstructorHistoryIntegrationTest {

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
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private SectionService sectionService;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private User instructorA;
    private User instructorB;
    private User admin;
    private Category category;

    @BeforeEach
    void setUp() {
        instructorA = userRepository.save(User.builder()
                .email("inst_audit_a_" + System.currentTimeMillis() + "@lms.com")
                .password("$2a$10$dummy")
                .fullName("ThS. Trần Văn A")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build());

        instructorB = userRepository.save(User.builder()
                .email("inst_audit_b_" + System.currentTimeMillis() + "@lms.com")
                .password("$2a$10$dummy")
                .fullName("TS. Lê Thị B")
                .role(Role.ROLE_INSTRUCTOR)
                .isActive(true)
                .build());

        admin = userRepository.save(User.builder()
                .email("admin_audit_" + System.currentTimeMillis() + "@lms.com")
                .password("$2a$10$dummy")
                .fullName("Quản trị viên Hệ thống")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build());

        category = categoryRepository.save(Category.builder()
                .name("Công nghệ thông tin " + System.currentTimeMillis())
                .slug("cntt-" + System.currentTimeMillis())
                .build());
    }

    @AfterEach
    void tearDown() {
        auditLogRepository.deleteAll();
        notificationRepository.deleteAll();
        lessonRepository.deleteAll();
        sectionRepository.deleteAll();
        courseRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Quyền riêng tư: Giảng viên A tuyệt đối không xem được lịch sử của Giảng viên B")
    void instructorHistoryIsolation_InstructorACannotSeeInstructorB() {
        // Tạo khóa cho Giảng viên A
        CourseResponse courseA = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học của A")
                        .slug("khoa-hoc-a-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructorA.getEmail()
        );

        // Tạo khóa cho Giảng viên B
        CourseResponse courseB = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học của B")
                        .slug("khoa-hoc-b-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructorB.getEmail()
        );

        // Lấy lịch sử của Giảng viên A
        AuditLogPageResponse historyA = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 10, null, null, null, null
        );

        assertEquals(1, historyA.getContent().size());
        assertEquals("Khóa học của A", historyA.getContent().get(0).getEntityLabel());
        assertEquals(instructorA.getId(), historyA.getContent().get(0).getCourseOwnerId());

        // Lấy lịch sử của Giảng viên B
        AuditLogPageResponse historyB = auditLogService.getInstructorHistory(
                instructorB.getEmail(), 0, 10, null, null, null, null
        );

        assertEquals(1, historyB.getContent().size());
        assertEquals("Khóa học của B", historyB.getContent().get(0).getEntityLabel());
        assertEquals(instructorB.getId(), historyB.getContent().get(0).getCourseOwnerId());
    }

    @Test
    @DisplayName("Các hành động chính đều ghi AuditLog: Tạo, Sửa, Gửi duyệt, Admin duyệt, Thêm bài, Yêu cầu xóa, Khôi phục")
    void courseLifecycle_LogsAllMajorActions() {
        // 1. Tạo khóa học
        CourseResponse course = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học Fullstack")
                        .slug("fullstack-" + System.currentTimeMillis())
                        .price(new BigDecimal("499000"))
                        .categoryId(category.getId())
                        .build(),
                instructorA.getEmail()
        );

        // 2. Chỉnh sửa khóa học (đổi giá)
        courseService.updateCourse(
                course.getId(),
                CourseUpdateRequest.builder()
                        .title("Khóa học Fullstack Pro")
                        .price(new BigDecimal("599000"))
                        .categoryId(category.getId())
                        .description("Mô tả mới")
                        .build(),
                instructorA.getEmail()
        );

        // 3. Gửi duyệt
        courseService.submitForReview(course.getId(), instructorA.getEmail());

        // 4. Admin duyệt
        adminService.approveCourse(course.getId(), admin.getEmail());

        // 5. Thêm chương và bài giảng
        SectionResponse section = sectionService.createSection(
                SectionRequest.builder()
                        .courseId(course.getId())
                        .title("Chương 1: Khởi động")
                        .build()
        );

        lessonService.createLesson(
                LessonRequest.builder()
                        .sectionId(section.getId())
                        .title("Bài 1: Giới thiệu")
                        .contentType(ContentType.VIDEO)
                        .contentUrl("https://example.com/v1.mp4")
                        .build()
        );

        // 6. Yêu cầu xóa khóa học
        courseService.requestDeleteCourse(course.getId(), instructorA.getEmail());

        // 7. Xóa khóa học (chuyển soft delete/draft)
        courseService.deleteCourse(course.getId(), instructorA.getEmail());

        // 8. Khôi phục khóa học
        courseService.restoreCourse(course.getId(), instructorA.getEmail());

        // Kiểm tra danh sách nhật ký của Giảng viên A
        AuditLogPageResponse history = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 50, null, null, null, null
        );

        assertNotNull(history);
        List<AuditLogResponse> logs = history.getContent();
        assertTrue(logs.size() >= 8);

        // Kiểm tra log Admin duyệt: actor là admin, courseOwner là instructorA
        AuditLogResponse approvedLog = logs.stream()
                .filter(l -> l.getAction() == AuditAction.COURSE_APPROVED)
                .findFirst()
                .orElse(null);
        assertNotNull(approvedLog);
        assertEquals(admin.getId(), approvedLog.getActorId());
        assertEquals("ROLE_ADMIN", approvedLog.getActorRole());
        assertEquals(instructorA.getId(), approvedLog.getCourseOwnerId());
        assertFalse(approvedLog.getIsCurrentActor()); // Admin làm thì không phải currentActor

        // Kiểm tra log cập nhật có chi tiết trường đã đổi
        AuditLogResponse updatedLog = logs.stream()
                .filter(l -> l.getAction() == AuditAction.COURSE_UPDATED)
                .findFirst()
                .orElse(null);
        assertNotNull(updatedLog);
        assertTrue(updatedLog.getDetails().contains("Giá"));
    }

    @Test
    @DisplayName("Lọc theo hành động, theo khóa học và phân trang phía server")
    void filteringAndPagination_WorksCorrectly() {
        CourseResponse course1 = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học 1")
                        .slug("c1-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructorA.getEmail()
        );

        CourseResponse course2 = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học 2")
                        .slug("c2-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructorA.getEmail()
        );

        // Lọc theo courseId = course1.getId()
        AuditLogPageResponse pageC1 = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 10, null, course1.getId(), null, null
        );
        assertEquals(1, pageC1.getContent().size());
        assertEquals(course1.getId(), pageC1.getContent().get(0).getEntityId());

        // Lọc theo action = COURSE_CREATED
        AuditLogPageResponse pageCreated = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 10, AuditAction.COURSE_CREATED, null, null, null
        );
        assertEquals(2, pageCreated.getContent().size());

        // Phân trang: size = 1
        AuditLogPageResponse pageOne = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 1, null, null, null, null
        );
        assertEquals(1, pageOne.getContent().size());
        assertEquals(2, pageOne.getTotalElements());
        assertEquals(2, pageOne.getTotalPages());
    }

    @Test
    @DisplayName("Transaction Rollback: Khi giao dịch gốc bị rollback thì không lưu AuditLog")
    void transactionRollback_NoAuditLogSaved() {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("RollbackTestTx");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            courseService.createCourse(
                    CourseCreateRequest.builder()
                            .title("Khóa học Hủy")
                            .slug("c-cancel-" + System.currentTimeMillis())
                            .categoryId(category.getId())
                            .build(),
                    instructorA.getEmail()
            );
            // Chủ động rollback transaction
            transactionManager.rollback(status);
        } catch (Exception e) {
            transactionManager.rollback(status);
        }

        AuditLogPageResponse history = auditLogService.getInstructorHistory(
                instructorA.getEmail(), 0, 10, null, null, null, null
        );
        assertEquals(0, history.getContent().size());
    }
}
