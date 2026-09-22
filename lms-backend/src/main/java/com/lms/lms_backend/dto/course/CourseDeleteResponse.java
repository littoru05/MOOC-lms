package com.lms.lms_backend.dto.course;

import com.lms.lms_backend.entity.CourseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDeleteResponse {
    private Long courseId;
    private CourseStatus status;
    private Boolean isDeleted;
    private Boolean isArchived;
    private Long enrolledCount;
    private String message;

    public boolean isDeleted() {
        return Boolean.TRUE.equals(isDeleted);
    }

    public boolean isArchived() {
        return Boolean.TRUE.equals(isArchived);
    }
}
