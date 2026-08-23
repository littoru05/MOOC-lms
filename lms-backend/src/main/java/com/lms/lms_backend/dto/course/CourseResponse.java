package com.lms.lms_backend.dto.course;

import java.time.LocalDateTime;

import com.lms.lms_backend.entity.CourseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private CourseStatus status;
    private Long categoryId;
    private String categoryName;
    private Long instructorId;
    private String instructorName;
    private LocalDateTime createdAt;
}
