package com.lms.lms_backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseCreateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;
    private String thumbnailUrl;
    private Long categoryId;
}
