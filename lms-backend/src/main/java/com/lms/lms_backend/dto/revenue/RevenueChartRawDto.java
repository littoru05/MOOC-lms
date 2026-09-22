package com.lms.lms_backend.dto.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class RevenueChartRawDto {
    private Integer year;
    private Integer month;
    private Integer day;
    private BigDecimal grossRevenue;
    private Long ordersCount;

    public RevenueChartRawDto(Integer year, Integer month, Integer day, BigDecimal grossRevenue, Long ordersCount) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.grossRevenue = grossRevenue != null ? grossRevenue : BigDecimal.ZERO;
        this.ordersCount = ordersCount != null ? ordersCount : 0L;
    }
}
