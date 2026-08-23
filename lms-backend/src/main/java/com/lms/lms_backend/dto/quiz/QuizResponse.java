package com.lms.lms_backend.dto.quiz;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer passingScore;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private List<QuestionResponse> questions;
}
