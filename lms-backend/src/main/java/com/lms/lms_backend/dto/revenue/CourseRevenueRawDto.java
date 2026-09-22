package com.lms.lms_backend.dto.revenue;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRevenueRawDto {
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String thumbnailUrl;
    private BigDecimal coursePrice;
    private Long totalSold;
    private BigDecimal grossRevenue;
}
