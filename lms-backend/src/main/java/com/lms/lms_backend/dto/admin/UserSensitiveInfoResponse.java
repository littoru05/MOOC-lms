package com.lms.lms_backend.dto.admin;

import java.time.LocalDate;

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
public class UserSensitiveInfoResponse {
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
}

