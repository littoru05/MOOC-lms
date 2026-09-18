package com.lms.lms_backend.dto.auth;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    private String avatarUrl;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String title;
    private String bio;
    private String teachingField;
}
