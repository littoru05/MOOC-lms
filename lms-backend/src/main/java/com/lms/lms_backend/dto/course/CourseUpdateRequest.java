package com.lms.lms_backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseUpdateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;
    private String thumbnailUrl;
    private Long categoryId;
}
