package com.lms.lms_backend.dto.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class RevenueSummaryRawDto {
    private Long totalCoursesSold;
    private BigDecimal totalGrossRevenue;
    private Long totalStudentsCount;

    public RevenueSummaryRawDto(Long totalCoursesSold, BigDecimal totalGrossRevenue, Long totalStudentsCount) {
        this.totalCoursesSold = totalCoursesSold != null ? totalCoursesSold : 0L;
        this.totalGrossRevenue = totalGrossRevenue != null ? totalGrossRevenue : BigDecimal.ZERO;
        this.totalStudentsCount = totalStudentsCount != null ? totalStudentsCount : 0L;
    }
}
