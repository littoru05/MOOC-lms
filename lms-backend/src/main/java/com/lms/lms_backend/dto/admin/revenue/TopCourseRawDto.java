package com.lms.lms_backend.dto.admin.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class TopCourseRawDto {
    private Long courseId;
    private String title;
    private String thumbnailUrl;
    private String instructorName;
    private Long totalSold;
    private BigDecimal totalRevenue;

    public TopCourseRawDto(Long courseId, String title, String thumbnailUrl, String instructorName, Long totalSold, BigDecimal totalRevenue) {
        this.courseId = courseId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.instructorName = instructorName;
        this.totalSold = totalSold != null ? totalSold : 0L;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
    }
}
