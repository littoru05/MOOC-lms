package com.lms.lms_backend.dto.admin.revenue;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class InstructorRankingRawDto {
    private Long instructorId;
    private String instructorName;
    private String avatarUrl;
    private BigDecimal totalGrossRevenue;
    private Long coursesSoldCount;

    public InstructorRankingRawDto(Long instructorId, String instructorName, String avatarUrl, BigDecimal totalGrossRevenue, Long coursesSoldCount) {
        this.instructorId = instructorId;
        this.instructorName = instructorName;
        this.avatarUrl = avatarUrl;
        this.totalGrossRevenue = totalGrossRevenue != null ? totalGrossRevenue : BigDecimal.ZERO;
        this.coursesSoldCount = coursesSoldCount != null ? coursesSoldCount : 0L;
    }
}
