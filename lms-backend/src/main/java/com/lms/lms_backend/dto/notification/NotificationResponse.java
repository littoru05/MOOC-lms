package com.lms.lms_backend.dto.notification;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lms.lms_backend.entity.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String link;
    private Long courseId;
    private Long actorId;

    @JsonProperty("isRead")
    private Boolean isRead;

    private LocalDateTime createdAt;

    @JsonProperty("isRead")
    public Boolean isRead() {
        return Boolean.TRUE.equals(isRead);
    }

    @JsonProperty("isRead")
    public Boolean getIsRead() {
        return isRead;
    }

    @JsonProperty("read")
    public Boolean getRead() {
        return isRead;
    }
}
