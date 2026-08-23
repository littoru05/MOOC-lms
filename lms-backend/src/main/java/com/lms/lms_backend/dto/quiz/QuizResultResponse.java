package com.lms.lms_backend.dto.quiz;

import com.lms.lms_backend.dto.certificate.CertificateResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizResultResponse {
    private Boolean passed;
    private Integer score;
    private Integer totalScore;
    private Integer passingScore;
    private String message;
    private String certificateUrl;
    private CertificateResponse certificate;
}
