package com.lms.lms_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.auth.AuthResponse;
import com.lms.lms_backend.dto.auth.ChangePasswordRequest;
import com.lms.lms_backend.dto.auth.LoginRequest;
import com.lms.lms_backend.dto.auth.RegisterRequest;
import com.lms.lms_backend.dto.auth.UpdateProfileRequest;
import com.lms.lms_backend.dto.auth.UserProfileResponse;
import com.lms.lms_backend.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.register(request, response));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String refreshToken,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, String>> logout(
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String refreshToken,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        authService.logout(refreshToken, response);
        java.util.Map<String, String> res = new java.util.HashMap<>();
        res.put("message", "Đăng xuất thành công!");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}
