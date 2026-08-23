package com.lms.lms_backend.dto.quiz;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizCreateRequest {
    @NotNull(message = "Course ID không được để trống")
    private Long courseId;

    @NotBlank(message = "Tiêu đề bài kiểm tra không được để trống")
    private String title;

    private Integer passingScore;
    private Integer durationMinutes;

    @NotEmpty(message = "Danh sách câu hỏi không được để trống")
    private List<QuestionRequest> questions;
}
