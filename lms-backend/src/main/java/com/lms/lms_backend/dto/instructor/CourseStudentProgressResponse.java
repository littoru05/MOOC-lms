package com.lms.lms_backend.dto.instructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseStudentProgressResponse {
    private Long enrollmentId;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private BigDecimal progressPercent;
    private Boolean isCompleted;
    private Long completedLessonsCount;
    private Long totalLessonsCount;
    private Integer quizScore;
}
