package com.lms.lms_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Kích hoạt giao dịch độc lập (REQUIRES_NEW) để thu hồi toàn bộ refresh token của User.
     * Khi hàm này hoàn thành, các thay đổi UPDATE sẽ COMMIT NGAY LẬP TỨC xuống CSDL.
     * Cho dù phương thức gọi bên ngoài có ném Exception (như BadCredentialsException 401),
     * trạng thái revoked = true của toàn bộ token vẫn được bảo toàn vĩnh viễn trong CSDL.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int revokeAllTokensForUser(User user) {
        log.warn("KÍCH HOẠT THU HỒI KHẨN CẤP (REQUIRES_NEW): Thu hồi toàn bộ refresh token cho User ID: {}", user.getId());
        return refreshTokenRepository.revokeAllByUser(user);
    }
}
