package com.lms.lms_backend.dto.quiz;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;
    private Integer point;

    @NotEmpty(message = "Danh sách đáp án không được để trống")
    private List<AnswerRequest> answers;
}
