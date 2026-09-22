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
public class InstructorRankingResponse {
    private Long instructorId;
    private String instructorName;
    private String avatarUrl;
    private BigDecimal totalRevenue; // Thu nhập thực nhận của GV
    private BigDecimal totalGrossRevenue; // Doanh thu gộp
    private Long coursesSoldCount;
}
