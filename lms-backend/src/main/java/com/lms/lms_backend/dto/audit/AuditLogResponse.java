package com.lms.lms_backend.dto.audit;

import java.time.LocalDateTime;

import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.CourseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {
    private Long id;
    private AuditAction action;
    private String actionLabel;
    private Long actorId;
    private String actorName;
    private String actorRole;
    private Boolean isCurrentActor;
    private String entityType;
    private Long entityId;
    private String entityLabel;
    private String details;
    private Long courseOwnerId;
    private CourseStatus courseStatus;
    private Boolean isCourseDeleted;
    private Boolean canRestore;
    private LocalDateTime createdAt;
}

