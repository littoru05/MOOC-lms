package com.lms.lms_backend.integration;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.lesson.LessonRequest;
import com.lms.lms_backend.dto.notification.NotificationPageResponse;
import com.lms.lms_backend.dto.notification.NotificationResponse;
import com.lms.lms_backend.dto.section.SectionRequest;
import com.lms.lms_backend.dto.section.SectionResponse;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.ContentType;
import com.lms.lms_backend.entity.Notification;
import com.lms.lms_backend.entity.NotificationType;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.NotificationRepository;
import com.lms.lms_backend.repository.SectionRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AdminService;
import com.lms.lms_backend.service.CourseService;
import com.lms.lms_backend.service.LessonService;
import com.lms.lms_backend.service.NotificationService;
import com.lms.lms_backend.service.SectionService;

@SpringBootTest
@ActiveProfiles("test")
public class NotificationIntegrationTest {

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
    private CourseService courseService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private SectionService sectionService;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private User admin1;
    private User admin2;
    private User instructor;
    private User otherInstructor;
    private Category category;

    @BeforeEach
    void setUp() {
        tearDown();

        admin1 = userRepository.findByEmail("admin_one@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin_one")
                        .email("admin_one@lms.com")
                        .password("hash123")
                        .fullName("Admin Một")
                        .role(Role.ROLE_ADMIN)
                        .isActive(true)
                        .build())
        );

        admin2 = userRepository.findByEmail("admin_two@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin_two")
                        .email("admin_two@lms.com")
                        .password("hash123")
                        .fullName("Admin Hai")
                        .role(Role.ROLE_ADMIN)
                        .isActive(true)
                        .build())
        );

        instructor = userRepository.findByEmail("giangvien_a@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("giangvien_a")
                        .email("giangvien_a@lms.com")
                        .password("hash123")
                        .fullName("TS. Giảng Viên A")
                        .role(Role.ROLE_INSTRUCTOR)
                        .isActive(true)
                        .build())
        );

        otherInstructor = userRepository.findByEmail("giangvien_b@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("giangvien_b")
                        .email("giangvien_b@lms.com")
                        .password("hash123")
                        .fullName("TS. Giảng Viên B")
                        .role(Role.ROLE_INSTRUCTOR)
                        .isActive(true)
                        .build())
        );

        category = categoryRepository.findBySlug("cong-nghe-thong-tin").orElseGet(() ->
                categoryRepository.save(Category.builder()
                        .name("Công nghệ thông tin")
                        .slug("cong-nghe-thong-tin")
                        .build())
        );
    }

    @AfterEach
    void tearDown() {
        notificationRepository.deleteAll();
        lessonRepository.deleteAll();
        sectionRepository.deleteAll();
        courseRepository.deleteAll();
    }

    @Test
    @DisplayName("Luồng duyệt khóa: Giảng viên gửi duyệt -> Cả 2 Admin nhận thông báo -> Admin duyệt -> Giảng viên nhận thông báo")
    void fullApprovalNotificationFlow() {
        // 1. Tạo khóa học dạng DRAFT
        CourseResponse course = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học Microservices")
                        .slug("khoa-hoc-microservices-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructor.getEmail()
        );

        // 2. Giảng viên gửi duyệt
        courseService.submitForReview(course.getId(), instructor.getEmail());

        // Kiểm tra 2 admin đều nhận được thông báo COURSE_SUBMITTED
        NotificationPageResponse admin1Notifs = notificationService.getNotifications(admin1.getEmail(), 0, 10, true);
        NotificationPageResponse admin2Notifs = notificationService.getNotifications(admin2.getEmail(), 0, 10, true);

        assertEquals(1, admin1Notifs.getContent().size());
        assertEquals(NotificationType.COURSE_SUBMITTED, admin1Notifs.getContent().get(0).getType());
        assertTrue(admin1Notifs.getContent().get(0).getMessage().contains("Khóa học Microservices"));

        assertEquals(1, admin2Notifs.getContent().size());
        assertEquals(NotificationType.COURSE_SUBMITTED, admin2Notifs.getContent().get(0).getType());

        // 3. Admin duyệt khóa học
        adminService.approveCourse(course.getId());

        // Kiểm tra giảng viên nhận được thông báo COURSE_APPROVED
        NotificationPageResponse instructorNotifs = notificationService.getNotifications(instructor.getEmail(), 0, 10, true);
        assertEquals(1, instructorNotifs.getContent().size());
        assertEquals(NotificationType.COURSE_APPROVED, instructorNotifs.getContent().get(0).getType());
        assertTrue(instructorNotifs.getContent().get(0).getMessage().contains("đã được duyệt và xuất bản"));
    }

    @Test
    @DisplayName("Luồng từ chối: Admin từ chối kèm lý do -> Giảng viên nhận thông báo kèm đúng lý do")
    void rejectCourseNotificationWithReason() {
        CourseResponse course = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học Python AI")
                        .slug("khoa-hoc-python-ai-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructor.getEmail()
        );

        courseService.submitForReview(course.getId(), instructor.getEmail());
        notificationRepository.deleteAll(); // dọn thông báo submit để kiểm tra reject riêng

        // Admin từ chối với lý do
        adminService.rejectCourse(course.getId(), "Video bài giảng chất lượng thấp, âm thanh rè");

        NotificationPageResponse notifs = notificationService.getNotifications(instructor.getEmail(), 0, 10, true);
        assertEquals(1, notifs.getContent().size());
        NotificationResponse n = notifs.getContent().get(0);
        assertEquals(NotificationType.COURSE_REJECTED, n.getType());
        assertTrue(n.getMessage().contains("Video bài giảng chất lượng thấp, âm thanh rè"));
    }

    @Test
    @DisplayName("Thêm bài giảng vào khóa đã PUBLISHED -> Gửi thông báo LESSON_ADDED cho Admins; thêm nhiều bài trong 10 phút -> Gộp trùng")
    void lessonAddedToPublishedCourse_SendsNotification_AndDeduplicates() {
        CourseResponse course = courseService.createCourse(
                CourseCreateRequest.builder()
                        .title("Khóa học DevOps Pro")
                        .slug("khoa-hoc-devops-pro-" + System.currentTimeMillis())
                        .categoryId(category.getId())
                        .build(),
                instructor.getEmail()
        );
        adminService.approveCourse(course.getId());
        notificationRepository.deleteAll();

        // Tạo section
        SectionResponse section = sectionService.createSection(
                SectionRequest.builder()
                        .courseId(course.getId())
                        .title("Chương 1: Docker cơ bản")
                        .build()
        );

        // Lúc này admin đã nhận được 1 thông báo LESSON_ADDED
        long countAfterSection = notificationRepository.countByRecipientIdAndIsReadFalse(admin1.getId());
        assertEquals(1, countAfterSection);

        // Tạo thêm bài giảng trong vòng 10 phút
        lessonService.createLesson(
                LessonRequest.builder()
                        .sectionId(section.getId())
                        .title("Bài 1: Container là gì?")
                        .contentType(ContentType.VIDEO)
                        .contentUrl("https://example.com/v1.mp4")
                        .build()
        );

        // Nhờ gộp trùng (deduplication trong 10 phút), số thông báo chưa đọc của admin1 vẫn là 1 (chỉ cập nhật timestamp)
        long countAfterLesson = notificationRepository.countByRecipientIdAndIsReadFalse(admin1.getId());
        assertEquals(1, countAfterLesson);
    }

    @Test
    @DisplayName("Bảo mật & Phân quyền: Người dùng B không thể đánh dấu đọc thông báo của người dùng A (ném 404)")
    void userIsolation_CannotMarkOthersNotification() {
        // Tạo thông báo cho instructor
        Notification notif = notificationRepository.save(Notification.builder()
                .recipient(instructor)
                .type(NotificationType.COURSE_APPROVED)
                .title("Thông báo cá nhân")
                .message("Nội dung")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());

        // otherInstructor cố đánh dấu đọc thông báo của instructor -> 404
        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.markAsRead(notif.getId(), otherInstructor.getEmail())
        );

        // Trạng thái vẫn là chưa đọc
        Notification dbNotif = notificationRepository.findById(notif.getId()).orElseThrow();
        assertFalse(dbNotif.isRead());
    }

    @Test
    @DisplayName("Rollback giao dịch: Khi transaction bị rollback, thông báo cũng không còn tồn tại")
    void rollbackTransaction_NoNotificationPersisted() {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("TestRollbackTx");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            CourseResponse course = courseService.createCourse(
                    CourseCreateRequest.builder()
                            .title("Khóa học Thử Nghiệm Rollback")
                            .slug("khoa-hoc-rollback-" + System.currentTimeMillis())
                            .categoryId(category.getId())
                            .build(),
                    instructor.getEmail()
            );

            courseService.submitForReview(course.getId(), instructor.getEmail());

            // Giả lập lỗi xảy ra trong cùng transaction
            throw new RuntimeException("Mô phỏng sự cố kinh doanh, buộc rollback!");
        } catch (RuntimeException e) {
            transactionManager.rollback(status);
        }

        // Sau khi rollback, không có thông báo nào được lưu
        List<Notification> allNotifs = notificationRepository.findAll();
        boolean hasRollbackNotif = allNotifs.stream().anyMatch(n -> n.getMessage().contains("Khóa học Thử Nghiệm Rollback"));
        assertFalse(hasRollbackNotif, "Thông báo không được tồn tại khi transaction bị rollback!");
    }
}
