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
public class AdminRevenueChartPointResponse {
    private String period;
    private BigDecimal grossRevenue;
    private BigDecimal platformCommission;
    private BigDecimal instructorPayout;
    private Long ordersCount;
}
