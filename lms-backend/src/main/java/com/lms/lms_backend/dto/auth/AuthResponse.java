package com.lms.lms_backend.dto.auth;

import com.lms.lms_backend.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
}
