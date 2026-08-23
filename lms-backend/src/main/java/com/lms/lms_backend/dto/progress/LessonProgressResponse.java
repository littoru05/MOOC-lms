package com.lms.lms_backend.dto.progress;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LessonProgressResponse {
    private Long enrollmentId;
    private Long lessonId;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private BigDecimal progressPercent;
    private Boolean isCourseCompleted;
}
