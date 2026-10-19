package com.lms.lms_backend.integration;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;

import com.lms.lms_backend.entity.RefreshToken;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.RefreshTokenRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AuthService;

@SpringBootTest
@ActiveProfiles("test")
public class RefreshTokenReuseIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .email("reuse_test@lms.com")
                .username("reuse_test")
                .password("encoded_pass")
                .fullName("Reuse Test User")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Kịch bản 2 Token: Token A bị reuse -> DB lập tức commit thu hồi Token B qua REQUIRES_NEW -> Token B gọi refresh bị chặn 401")
    void refreshToken_ReuseDetection_RevokesAllTokensInRealDatabase() {
        // 1. Tạo Token A (đã bị rotate/revoke trước đó)
        RefreshToken tokenA = RefreshToken.builder()
                .user(testUser)
                .token("cookie-A-revoked-token")
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(true)
                .build();
        refreshTokenRepository.save(tokenA);

        // 2. Tạo Token B (đang hợp lệ, active) của CÙNG user
        RefreshToken tokenB = RefreshToken.builder()
                .user(testUser)
                .token("cookie-B-active-token")
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        tokenB = refreshTokenRepository.save(tokenB);

        // Khẳng định ban đầu Token B chưa bị revoke trong CSDL
        assertFalse(tokenB.getRevoked(), "Token B ban đầu phải active (revoked = false)");

        // 3. Tái hiện Bước 3: Kẻ tấn công gửi lại Token A đã bị revoke
        // Phải ném BadCredentialsException (401)
        BadCredentialsException exA = assertThrows(BadCredentialsException.class, () ->
                authService.refreshToken("cookie-A-revoked-token", null)
        );
        assertTrue(exA.getMessage().contains("Cảnh báo bảo mật"), "Thông báo phải cảnh báo phát hiện reuse");

        // 4. KIỂM TRA TRỰC TIẾP TRONG CSDL:
        // Do có @Transactional(propagation = Propagation.REQUIRES_NEW),
        // Token B trong CSDL BẮT BUỘC ĐÃ BỊ UPDATE THÀNH revoked = true (không bị rollback theo exception 401!)
        RefreshToken tokenBInDb = refreshTokenRepository.findByToken("cookie-B-active-token").orElse(null);
        assertNotNull(tokenBInDb, "Token B phải tồn tại trong CSDL");
        assertTrue(tokenBInDb.getRevoked(), "CHỨNG MINH FIX: Token B PHẢI bị chuyển thành revoked = true trong CSDL sau khi token A bị reuse!");

        // 5. Tái hiện Bước 4: Thử gọi refresh bằng Token B
        // Vì Token B đã bị revoke vĩnh viễn ở bước 3, bước này BẮT BUỘC PHẢI THẤT BẠI với 401!
        BadCredentialsException exB = assertThrows(BadCredentialsException.class, () ->
                authService.refreshToken("cookie-B-active-token", null)
        );
        assertTrue(exB.getMessage().contains("Cảnh báo bảo mật") || exB.getMessage().contains("đã bị vô hiệu hóa"),
                "Token B khi gửi lên phải bị từ chối 401 vì đã bị thu hồi");
    }
}
