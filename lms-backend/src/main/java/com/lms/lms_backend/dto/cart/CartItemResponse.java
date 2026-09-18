package com.lms.lms_backend.dto.cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String thumbnailUrl;
    private String instructorName;
    private BigDecimal price;
    private LocalDateTime addedAt;
}
