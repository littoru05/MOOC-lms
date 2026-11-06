package com.lms.lms_backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPasswordVerificationRequest {

    @NotBlank(message = "Mật khẩu quản trị viên không được để trống")
    private String adminPassword;

    @Override
    public String toString() {
        return "AdminPasswordVerificationRequest[adminPassword=PROTECTED]";
    }
}

