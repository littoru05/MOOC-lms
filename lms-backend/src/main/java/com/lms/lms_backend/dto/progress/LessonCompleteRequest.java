package com.lms.lms_backend.dto.progress;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonCompleteRequest {
    @NotNull(message = "Enrollment ID không được để trống")
    private Long enrollmentId;

    @NotNull(message = "Lesson ID không được để trống")
    private Long lessonId;
}
