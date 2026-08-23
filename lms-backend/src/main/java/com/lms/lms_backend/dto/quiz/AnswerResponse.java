package com.lms.lms_backend.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponse {
    private Long id;
    private String answerText;
    private Boolean isCorrect; // Sẽ ẩn khi trả về cho Student làm bài
}
