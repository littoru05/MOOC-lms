package com.lms.lms_backend.dto.admin;

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
public class AdminPasswordResetResponse {

    private String tempPassword;
    private String message;

    @Override
    public String toString() {
        return "AdminPasswordResetResponse[tempPassword=PROTECTED]";
    }
}

