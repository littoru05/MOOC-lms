package com.lms.lms_backend.dto.section;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SectionResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer orderIndex;
}
