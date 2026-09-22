package com.lms.lms_backend.dto.admin.revenue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGrowthPointResponse {
    private String period;
    private Long newStudentsCount;
}
