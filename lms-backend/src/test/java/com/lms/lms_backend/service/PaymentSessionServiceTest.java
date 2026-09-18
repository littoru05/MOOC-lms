package com.lms.lms_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lms.lms_backend.dto.payment.PaymentSessionResponse;
import com.lms.lms_backend.dto.payment.PaymentSessionStatusResponse;
import com.lms.lms_backend.entity.PaymentSession;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.PaymentSessionRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PaymentSessionServiceTest {

    @Mock
    private PaymentSessionRepository paymentSessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentSessionService paymentSessionService;

    private User mockUser;
    private PaymentSession mockSession;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Test Student")
                .build();

        mockSession = PaymentSession.builder()
                .id(10L)
                .sessionToken("test-session-uuid-1234")
                .user(mockUser)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
    }

    @Test
    void createSession_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(mockUser));
        when(paymentSessionRepository.save(any(PaymentSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse res = paymentSessionService.createSession("student@lms.com");

        assertNotNull(res);
        assertNotNull(res.getSessionToken());
        assertEquals("PENDING", res.getStatus());
        verify(paymentSessionRepository).save(any(PaymentSession.class));
    }

    @Test
    void createSession_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@lms.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentSessionService.createSession("unknown@lms.com"));
    }

    @Test
    void getSessionStatus_Pending() {
        when(paymentSessionRepository.findBySessionToken("test-session-uuid-1234")).thenReturn(Optional.of(mockSession));

        PaymentSessionStatusResponse res = paymentSessionService.getSessionStatus("test-session-uuid-1234");

        assertEquals("PENDING", res.getStatus());
        assertEquals("test-session-uuid-1234", res.getSessionToken());
    }

    @Test
    void getSessionStatus_Expired_WhenPastExpiresAt() {
        mockSession.setExpiresAt(LocalDateTime.now().minusSeconds(10));
        when(paymentSessionRepository.findBySessionToken("test-session-uuid-1234")).thenReturn(Optional.of(mockSession));
        when(paymentSessionRepository.save(any(PaymentSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionStatusResponse res = paymentSessionService.getSessionStatus("test-session-uuid-1234");

        assertEquals("EXPIRED", res.getStatus());
        verify(paymentSessionRepository).save(mockSession);
    }

    @Test
    void confirmSession_Success() {
        when(paymentSessionRepository.findBySessionToken("test-session-uuid-1234")).thenReturn(Optional.of(mockSession));
        when(paymentSessionRepository.save(any(PaymentSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionStatusResponse res = paymentSessionService.confirmSession("test-session-uuid-1234");

        assertEquals("CONFIRMED", res.getStatus());
        verify(paymentSessionRepository).save(mockSession);
    }

    @Test
    void confirmSession_Expired_ThrowsException() {
        mockSession.setExpiresAt(LocalDateTime.now().minusSeconds(10));
        when(paymentSessionRepository.findBySessionToken("test-session-uuid-1234")).thenReturn(Optional.of(mockSession));

        assertThrows(RuntimeException.class, () -> paymentSessionService.confirmSession("test-session-uuid-1234"));
    }

    @Test
    void confirmSession_NotPending_ThrowsException() {
        mockSession.setStatus("CONFIRMED");
        when(paymentSessionRepository.findBySessionToken("test-session-uuid-1234")).thenReturn(Optional.of(mockSession));

        assertThrows(RuntimeException.class, () -> paymentSessionService.confirmSession("test-session-uuid-1234"));
    }
}
