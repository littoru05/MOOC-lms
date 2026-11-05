package com.lms.lms_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.notification.NotificationPageResponse;
import com.lms.lms_backend.dto.notification.NotificationResponse;
import com.lms.lms_backend.dto.notification.UnreadCountResponse;
import com.lms.lms_backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationPageResponse> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                notificationService.getNotifications(authentication.getName(), page, size, unreadOnly)
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.getUnreadCount(authentication.getName())
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id, authentication.getName())
        );
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tất cả thông báo là đã đọc."));
    }
}

