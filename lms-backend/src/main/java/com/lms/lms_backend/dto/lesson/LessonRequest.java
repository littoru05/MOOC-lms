package com.lms.lms_backend.dto.lesson;

import com.lms.lms_backend.entity.ContentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonRequest {
    @NotNull(message = "Section ID không được để trống")
    private Long sectionId;

    @NotBlank(message = "Tiêu đề bài học không được để trống")
    private String title;

    private ContentType contentType;
    private String contentUrl;
    private Integer durationMinutes;
    private Integer orderIndex;
}
