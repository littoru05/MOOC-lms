package com.lms.lms_backend.dto.cart;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;
    private int totalItems;
}
