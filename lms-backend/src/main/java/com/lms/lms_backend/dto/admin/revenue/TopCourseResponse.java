package com.lms.lms_backend.dto.admin.revenue;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopCourseResponse {
    private Long courseId;
    private String title;
    private String thumbnailUrl;
    private String instructorName;
    private Long totalSold;
    private BigDecimal totalRevenue;
}
