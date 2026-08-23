package com.lms.lms_backend.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnswerRequest {
    @NotBlank(message = "Nội dung đáp án không được để trống")
    private String answerText;
    private Boolean isCorrect;
}
