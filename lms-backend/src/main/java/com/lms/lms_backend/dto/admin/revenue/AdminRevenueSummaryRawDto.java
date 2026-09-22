package com.lms.lms_backend.dto.admin.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class AdminRevenueSummaryRawDto {
    private BigDecimal totalGrossRevenue;
    private Long totalOrdersCount;
    private Long totalStudentsCount;

    public AdminRevenueSummaryRawDto(BigDecimal totalGrossRevenue, Long totalOrdersCount, Long totalStudentsCount) {
        this.totalGrossRevenue = totalGrossRevenue != null ? totalGrossRevenue : BigDecimal.ZERO;
        this.totalOrdersCount = totalOrdersCount != null ? totalOrdersCount : 0L;
        this.totalStudentsCount = totalStudentsCount != null ? totalStudentsCount : 0L;
    }
}
