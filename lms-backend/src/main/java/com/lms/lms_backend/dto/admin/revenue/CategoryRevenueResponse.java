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
public class CategoryRevenueResponse {
    private Long categoryId;
    private String categoryName;
    private BigDecimal totalRevenue;
    private Long coursesSoldCount;
}
