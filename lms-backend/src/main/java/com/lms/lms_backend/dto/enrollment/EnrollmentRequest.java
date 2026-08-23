package com.lms.lms_backend.dto.enrollment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull(message = "Course ID không được để trống")
    private Long courseId;
}
