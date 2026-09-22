package com.lms.lms_backend.dto.admin.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class CategoryRevenueRawDto {
    private Long categoryId;
    private String categoryName;
    private BigDecimal totalRevenue;
    private Long coursesSoldCount;

    public CategoryRevenueRawDto(Long categoryId, String categoryName, BigDecimal totalRevenue, Long coursesSoldCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.coursesSoldCount = coursesSoldCount != null ? coursesSoldCount : 0L;
    }
}
