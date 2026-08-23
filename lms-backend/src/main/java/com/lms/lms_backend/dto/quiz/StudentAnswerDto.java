package com.lms.lms_backend.dto.quiz;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentAnswerDto {
    @NotNull(message = "Question ID không được để trống")
    private Long questionId;

    @NotNull(message = "Answer ID không được để trống")
    private Long selectedAnswerId;
}
