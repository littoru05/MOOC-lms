package com.lms.lms_backend.dto.admin;

import java.time.LocalDateTime;

import com.lms.lms_backend.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
