package com.lms.lms_backend.dto.quiz;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizSubmissionRequest {
    @NotNull(message = "Enrollment ID không được để trống")
    private Long enrollmentId;

    @NotNull(message = "Danh sách câu trả lời không được null")
    private List<StudentAnswerDto> studentAnswers;
}
