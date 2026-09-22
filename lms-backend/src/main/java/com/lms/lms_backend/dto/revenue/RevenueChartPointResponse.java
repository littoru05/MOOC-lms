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
public class RevenueChartPointResponse {
    private String period;
    private BigDecimal netRevenue;
    private Long ordersCount;
}
