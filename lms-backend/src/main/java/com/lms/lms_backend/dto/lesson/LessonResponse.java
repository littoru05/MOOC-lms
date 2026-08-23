package com.lms.lms_backend.dto.lesson;

import com.lms.lms_backend.entity.ContentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LessonResponse {
    private Long id;
    private Long sectionId;
    private String title;
    private ContentType contentType;
    private String contentUrl;
    private Integer durationMinutes;
    private Integer orderIndex;
}
