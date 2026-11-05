package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyAdmins(NotificationType type, String title, String message, String link, Long courseId, Long actorId) {
        List<User> admins = userRepository.findByRoleAndIsActiveTrue(Role.ROLE_ADMIN);
        for (User admin : admins) {
            createOrUpdateNotification(admin, type, title, message, link, courseId, actorId);
        }
    }

    @Transactional
    public Notification notifyUser(User recipient, NotificationType type, String title, String message, String link, Long courseId, Long actorId) {
        return createOrUpdateNotification(recipient, type, title, message, link, courseId, actorId);
    }

    @Transactional
    public Notification createOrUpdateNotification(User recipient, NotificationType type, String title, String message, String link, Long courseId, Long actorId) {
        if (courseId != null) {
            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
            Optional<Notification> existingOpt = notificationRepository
                    .findFirstByRecipientIdAndTypeAndCourseIdAndIsReadFalseAndCreatedAtAfterOrderByCreatedAtDesc(
                            recipient.getId(), type, courseId, cutoff
                    );

            if (existingOpt.isPresent()) {
                Notification existing = existingOpt.get();
                existing.setCreatedAt(LocalDateTime.now());
                existing.setTitle(title);
                existing.setMessage(message);
                existing.setLink(link);
                existing.setActorId(actorId);
                return notificationRepository.save(existing);
            }
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .courseId(courseId)
                .actorId(actorId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getNotifications(String userEmail, int page, int size, boolean unreadOnly) {
        User user = getUserByEmail(userEmail);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));

        Page<Notification> notifPage = unreadOnly
                ? notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), pageable)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), pageable);

        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());

        List<NotificationResponse> content = notifPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return NotificationPageResponse.builder()
                .content(content)
                .page(notifPage.getNumber())
                .size(notifPage.getSize())
                .totalElements(notifPage.getTotalElements())
                .totalPages(notifPage.getTotalPages())
                .last(notifPage.isLast())
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
        return UnreadCountResponse.of(count);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findByIdAndRecipientId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo không tồn tại hoặc bạn không có quyền truy cập!"));

        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);
        notificationRepository.markAllAsReadByRecipientId(user.getId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }

    public NotificationResponse mapToResponse(Notification n) {
        if (n == null) {
            return null;
        }
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .courseId(n.getCourseId())
                .actorId(n.getActorId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

