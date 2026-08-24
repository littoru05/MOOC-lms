package com.lms.lms_backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lms.lms_backend.dto.auth.AuthResponse;
import com.lms.lms_backend.dto.auth.ChangePasswordRequest;
import com.lms.lms_backend.dto.auth.LoginRequest;
import com.lms.lms_backend.dto.auth.RegisterRequest;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.security.JwtUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User activeUser;
    private User inactiveUser;

    @BeforeEach
    void setUp() {
        activeUser = User.builder()
                .id(1L)
                .email("student@lms.com")
                .username("student")
                .password("encoded_pass_123")
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        inactiveUser = User.builder()
                .id(2L)
                .email("locked@lms.com")
                .username("locked")
                .password("encoded_pass_123")
                .fullName("Tài khoản bị khóa")
                .role(Role.ROLE_STUDENT)
                .isActive(false)
                .build();
    }

    @Test
    @DisplayName("Đăng nhập thành công với thông tin chính xác")
    void login_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@lms.com");
        req.setPassword("student123");

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("student123", "encoded_pass_123")).thenReturn(true);
        when(jwtUtils.generateToken("student@lms.com")).thenReturn("mocked_jwt_token");

        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals("mocked_jwt_token", res.getToken());
        assertEquals("student@lms.com", res.getEmail());
        assertEquals(Role.ROLE_STUDENT, res.getRole());
    }

    @Test
    @DisplayName("Đăng nhập thất bại do tài khoản bị quản trị viên khóa")
    void login_AccountInactive_ThrowsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("locked@lms.com");
        req.setPassword("student123");

        when(userRepository.findByEmail("locked@lms.com")).thenReturn(Optional.of(inactiveUser));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.login(req)
        );

        assertTrue(ex.getMessage().contains("vô hiệu hóa / khóa"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại do sai mật khẩu")
    void login_WrongPassword_ThrowsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("student@lms.com");
        req.setPassword("wrong_pass");

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong_pass", "encoded_pass_123")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.login(req)
        );

        assertTrue(ex.getMessage().contains("Email hoặc mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("Đăng ký tài khoản mới thành công")
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@lms.com");
        req.setPassword("password123");
        req.setFullName("Lê Thị Mới");
        req.setRole(Role.ROLE_STUDENT);

        when(userRepository.existsByEmail("newuser@lms.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_new_pass");
        when(jwtUtils.generateToken("newuser@lms.com")).thenReturn("token_for_newuser");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("token_for_newuser", res.getToken());
        assertEquals("newuser@lms.com", res.getEmail());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi đăng ký email đã được sử dụng")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("student@lms.com");

        when(userRepository.existsByEmail("student@lms.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.register(req)
        );

        assertTrue(ex.getMessage().contains("Email đã được sử dụng"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Đổi mật khẩu thành công khi nhập đúng mật khẩu cũ")
    void changePassword_Success() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setOldPassword("student123");
        req.setNewPassword("newSecretPassword123");

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("student123", "encoded_pass_123")).thenReturn(true);
        when(passwordEncoder.encode("newSecretPassword123")).thenReturn("new_encoded_hash");

        authService.changePassword("student@lms.com", req);

        assertEquals("new_encoded_hash", activeUser.getPassword());
        verify(userRepository, times(1)).save(activeUser);
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi nhập sai mật khẩu cũ")
    void changePassword_WrongOldPassword_ThrowsException() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setOldPassword("wrong_old_pass");
        req.setNewPassword("newSecretPassword123");

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong_old_pass", "encoded_pass_123")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.changePassword("student@lms.com", req)
        );

        assertTrue(ex.getMessage().contains("Mật khẩu hiện tại không chính xác"));
        verify(userRepository, never()).save(any());
    }
}
