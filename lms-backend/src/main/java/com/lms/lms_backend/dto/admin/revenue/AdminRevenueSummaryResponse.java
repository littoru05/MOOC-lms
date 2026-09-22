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
public class AdminRevenueSummaryResponse {
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalPlatformCommission;
    private BigDecimal totalInstructorPayout;
    private Long totalOrdersCount;
    private Long totalStudentsCount;
    private BigDecimal platformCommissionRate;
}
