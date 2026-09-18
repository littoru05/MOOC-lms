package com.lms.lms_backend.dto.course;

import java.math.BigDecimal;
import jakarta.validation.constraints.Min;
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

    @Min(value = 0, message = "Giá khóa học không được âm")
    private BigDecimal price;
}
