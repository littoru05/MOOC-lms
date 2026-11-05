package com.lms.lms_backend.dto.section;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SectionRequest {
    @NotNull(message = "Course ID không được để trống")
    private Long courseId;

    @NotBlank(message = "Tiêu đề section không được để trống")
    private String title;

    private Integer orderIndex;
}
