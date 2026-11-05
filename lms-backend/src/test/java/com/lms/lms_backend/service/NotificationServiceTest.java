package com.lms.lms_backend.service;

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
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.lms.lms_backend.dto.notification.NotificationPageResponse;
import com.lms.lms_backend.dto.notification.NotificationResponse;
import com.lms.lms_backend.dto.notification.UnreadCountResponse;
import com.lms.lms_backend.entity.Notification;
import com.lms.lms_backend.entity.NotificationType;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.NotificationRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User admin1;
    private User admin2;
    private User instructor;
    private User otherUser;

    @BeforeEach
    void setUp() {
        admin1 = User.builder().id(1L).email("admin1@lms.com").fullName("Admin 1").role(Role.ROLE_ADMIN).isActive(true).build();
        admin2 = User.builder().id(2L).email("admin2@lms.com").fullName("Admin 2").role(Role.ROLE_ADMIN).isActive(true).build();
        instructor = User.builder().id(3L).email("instructor@lms.com").fullName("TS. Nguyen Van A").role(Role.ROLE_INSTRUCTOR).isActive(true).build();
        otherUser = User.builder().id(4L).email("other@lms.com").fullName("Other User").role(Role.ROLE_STUDENT).isActive(true).build();
    }

    @Test
    @DisplayName("notifyAdmins: Mọi admin đang hoạt động đều nhận được 1 thông báo riêng biệt")
    void notifyAdmins_AllActiveAdminsReceiveNotification() {
        when(userRepository.findByRoleAndIsActiveTrue(Role.ROLE_ADMIN)).thenReturn(List.of(admin1, admin2));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        notificationService.notifyAdmins(
                NotificationType.COURSE_SUBMITTED,
                "Khóa học mới chờ duyệt",
                "Giảng viên đã gửi duyệt",
                "/admin/courses/approval?courseId=10",
                10L,
                3L
        );

        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Gộp trùng: Nếu đã có thông báo CHƯA ĐỌC cùng type + course trong 10 phút thì cập nhật thời gian thay vì tạo mới")
    void deduplication_Within10Minutes_MergesNotification() {
        Notification existing = Notification.builder()
                .id(100L)
                .recipient(admin1)
                .type(NotificationType.LESSON_ADDED)
                .courseId(5L)
                .isRead(false)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .title("Cũ")
                .message("Tin cũ")
                .build();

        when(notificationRepository.findFirstByRecipientIdAndTypeAndCourseIdAndIsReadFalseAndCreatedAtAfterOrderByCreatedAtDesc(
                eq(1L), eq(NotificationType.LESSON_ADDED), eq(5L), any(LocalDateTime.class)))
                .thenReturn(Optional.of(existing));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createOrUpdateNotification(
                admin1, NotificationType.LESSON_ADDED, "Mới", "Tin mới", "/courses/slug", 5L, 3L
        );

        assertEquals(100L, result.getId());
        assertEquals("Mới", result.getTitle());
        assertEquals("Tin mới", result.getMessage());
        verify(notificationRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("Gộp trùng: Nếu thông báo trước đó đã đọc hoặc quá 10 phút thì tạo thông báo mới")
    void deduplication_WhenNoRecentUnread_CreatesNewNotification() {
        when(notificationRepository.findFirstByRecipientIdAndTypeAndCourseIdAndIsReadFalseAndCreatedAtAfterOrderByCreatedAtDesc(
                eq(1L), eq(NotificationType.LESSON_ADDED), eq(5L), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> {
            Notification n = i.getArgument(0);
            n.setId(200L);
            return n;
        });

        Notification result = notificationService.createOrUpdateNotification(
                admin1, NotificationType.LESSON_ADDED, "Mới", "Tin mới", "/courses/slug", 5L, 3L
        );

        assertEquals(200L, result.getId());
        assertEquals("Mới", result.getTitle());
        assertFalse(result.isRead());
    }

    @Test
    @DisplayName("markAsRead: Người dùng A không đánh dấu được thông báo của người dùng B (trả về 404)")
    void markAsRead_BelongsToAnotherUser_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("other@lms.com")).thenReturn(Optional.of(otherUser));
        // otherUser.getId() = 4L, but notification belongs to recipient 1L
        when(notificationRepository.findByIdAndRecipientId(100L, 4L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                notificationService.markAsRead(100L, "other@lms.com")
        );

        assertTrue(ex.getMessage().contains("không tồn tại hoặc bạn không có quyền"));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markAsRead: Đánh dấu đã đọc thành công thông báo của chính mình")
    void markAsRead_OwnNotification_Success() {
        Notification notif = Notification.builder()
                .id(100L)
                .recipient(instructor)
                .type(NotificationType.COURSE_APPROVED)
                .isRead(false)
                .title("Được duyệt")
                .message("Đã duyệt")
                .build();

        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(notificationRepository.findByIdAndRecipientId(100L, 3L)).thenReturn(Optional.of(notif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse res = notificationService.markAsRead(100L, "instructor@lms.com");

        assertNotNull(res);
        assertTrue(res.isRead());
        assertTrue(notif.isRead());
        verify(notificationRepository).save(notif);
    }

    @Test
    @DisplayName("markAllAsRead: Đánh dấu tất cả thông báo của chính mình là đã đọc")
    void markAllAsRead_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        notificationService.markAllAsRead("instructor@lms.com");

        verify(notificationRepository).markAllAsReadByRecipientId(3L);
    }

    @Test
    @DisplayName("getUnreadCount: Lấy đúng số lượng thông báo chưa đọc của user")
    void getUnreadCount_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(notificationRepository.countByRecipientIdAndIsReadFalse(3L)).thenReturn(7L);

        UnreadCountResponse res = notificationService.getUnreadCount("instructor@lms.com");

        assertNotNull(res);
        assertEquals(7L, res.getUnreadCount());
        assertEquals(7L, res.getCount());
    }

    @Test
    @DisplayName("getNotifications: Phân trang và hỗ trợ lọc unreadOnly")
    void getNotifications_PaginationAndFilter() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        Notification n = Notification.builder()
                .id(10L)
                .recipient(instructor)
                .type(NotificationType.COURSE_APPROVED)
                .isRead(false)
                .title("T")
                .message("M")
                .createdAt(LocalDateTime.now())
                .build();

        Page<Notification> page = new PageImpl<>(List.of(n), PageRequest.of(0, 10), 1);
        when(notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(eq(3L), any())).thenReturn(page);
        when(notificationRepository.countByRecipientIdAndIsReadFalse(3L)).thenReturn(1L);

        NotificationPageResponse res = notificationService.getNotifications("instructor@lms.com", 0, 10, true);

        assertNotNull(res);
        assertEquals(1, res.getContent().size());
        assertEquals(1L, res.getTotalElements());
        assertEquals(1L, res.getUnreadCount());
    }
}

