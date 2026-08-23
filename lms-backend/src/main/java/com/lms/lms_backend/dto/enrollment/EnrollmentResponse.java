package com.lms.lms_backend.dto.enrollment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.lms.lms_backend.dto.course.CourseResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private Long courseId;
    private CourseResponse course;
    private BigDecimal progressPercent;
    private Boolean isCompleted;
    private LocalDateTime enrolledAt;
}
