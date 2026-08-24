package com.lms.lms_backend.dto.quiz;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswerDto {
    @NotNull(message = "Question ID không được để trống")
    private Long questionId;

    @NotNull(message = "Answer ID không được để trống")
    private Long selectedAnswerId;
}
