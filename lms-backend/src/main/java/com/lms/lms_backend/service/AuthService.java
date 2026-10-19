package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.auth.AuthResponse;
import com.lms.lms_backend.dto.auth.ChangePasswordRequest;
import com.lms.lms_backend.dto.auth.LoginRequest;
import com.lms.lms_backend.dto.auth.RegisterRequest;
import com.lms.lms_backend.dto.auth.UpdateProfileRequest;
import com.lms.lms_backend.dto.auth.UserProfileResponse;
import com.lms.lms_backend.entity.RefreshToken;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.RefreshTokenRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.security.JwtUtils;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        return register(req, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .username(req.getEmail().split("@")[0])
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role(req.getRole() != null ? req.getRole() : Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail());

        RefreshToken refreshToken = createAndSaveRefreshToken(user);
        if (response != null) {
            setRefreshTokenCookie(response, refreshToken.getToken());
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        return login(req, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse response) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hóa / khóa bởi quản trị viên!");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }

        String token = jwtUtils.generateToken(user.getEmail());

        RefreshToken refreshToken = createAndSaveRefreshToken(user);
        if (response != null) {
            setRefreshTokenCookie(response, refreshToken.getToken());
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponse refreshToken(String refreshTokenStr, HttpServletResponse response) {
        if (refreshTokenStr == null || refreshTokenStr.isBlank()) {
            throw new BadCredentialsException("Refresh token không tồn tại hoặc phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại!");
        }

        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshTokenStr);

        // Case (a): Token KHÔNG tìm thấy trong DB -> lỗi thông thường, trả 401 yêu cầu đăng nhập lại, KHÔNG thu hồi toàn bộ
        if (tokenOpt.isEmpty()) {
            throw new BadCredentialsException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!");
        }

        RefreshToken refreshToken = tokenOpt.get();

        // Case (b): Token TÌM THẤY nhưng revoked = true -> dấu hiệu bị đánh cắp/dùng lại, kích hoạt thu hồi toàn bộ token của user đó
        if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
            log.warn("CẢNH BÁO BẢO MẬT: Phát hiện tái sử dụng Refresh Token đã bị thu hồi cho user ID: {}. Đang kích hoạt thu hồi độc lập toàn bộ token của người dùng!",
                    refreshToken.getUser().getId());
            refreshTokenService.revokeAllTokensForUser(refreshToken.getUser());
            throw new BadCredentialsException("Cảnh báo bảo mật: Refresh token đã bị vô hiệu hóa trước đó. Toàn bộ phiên đăng nhập của bạn đã bị thu hồi!");
        }

        // Kiểm tra thời hạn hết hạn
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BadCredentialsException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        }

        // Hợp lệ: Thực hiện Token Rotation (Xoay vòng token)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        RefreshToken newRefreshToken = createAndSaveRefreshToken(user);

        if (response != null) {
            setRefreshTokenCookie(response, newRefreshToken.getToken());
        }

        String newAccessToken = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(newAccessToken)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void logout(String refreshTokenStr, HttpServletResponse response) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }

        if (response != null) {
            clearRefreshTokenCookie(response);
        }
    }

    @Transactional
    public RefreshToken createAndSaveRefreshToken(User user) {
        String tokenString = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenString)
                .expiryDate(LocalDateTime.now().plusSeconds(jwtUtils.getJwtRefreshExpirationMs() / 1000))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        if (response == null) return;
        // TODO: khi deploy production với Frontend/Backend khác domain, cần đổi SameSite=Lax thành SameSite=None kèm bắt buộc Secure=true, nếu không trình duyệt sẽ chặn cookie hoàn toàn.
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false) // Đặt true khi chạy môi trường HTTPS production
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(jwtUtils.getJwtRefreshExpirationMs() / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        if (response == null) return;
        // TODO: khi deploy production với Frontend/Backend khác domain, cần đổi SameSite=Lax thành SameSite=None kèm bắt buộc Secure=true, nếu không trình duyệt sẽ chặn cookie hoàn toàn.
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .title(user.getTitle())
                .bio(user.getBio())
                .teachingField(user.getTeachingField())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        user.setFullName(req.getFullName());
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }
        if (req.getDateOfBirth() != null) {
            user.setDateOfBirth(req.getDateOfBirth());
        }
        if (req.getGender() != null) {
            user.setGender(req.getGender());
        }
        if (req.getTitle() != null) {
            user.setTitle(req.getTitle());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        if (req.getTeachingField() != null) {
            user.setTeachingField(req.getTeachingField());
        }

        User saved = userRepository.save(user);
        return getProfile(saved.getEmail());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
