package com.lms.lms_backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AdminAuthRateLimiter {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long WINDOW_MINUTES = 10;

    private final Map<Long, List<Instant>> failedAttemptsByAdmin = new ConcurrentHashMap<>();

    /**
     * Kiểm tra xem admin đã vượt quá 5 lần nhập sai trong 10 phút hay chưa.
     * Ném ResponseStatusException(429) nếu vi phạm rate limit.
     */
    public synchronized void checkRateLimit(Long adminId) {
        if (adminId == null) {
            return;
        }

        cleanupExpired(adminId);
        List<Instant> attempts = failedAttemptsByAdmin.get(adminId);
        if (attempts != null && attempts.size() >= MAX_FAILED_ATTEMPTS) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 10 phút."
            );
        }
    }

    /**
     * Ghi nhận một lần nhập sai mật khẩu của Admin.
     */
    public synchronized void recordFailedAttempt(Long adminId) {
        if (adminId == null) {
            return;
        }
        cleanupExpired(adminId);
        failedAttemptsByAdmin.computeIfAbsent(adminId, k -> new ArrayList<>()).add(Instant.now());
    }

    /**
     * Xóa lịch sử nhập sai của Admin khi nhập đúng mật khẩu.
     */
    public synchronized void clear(Long adminId) {
        if (adminId != null) {
            failedAttemptsByAdmin.remove(adminId);
        }
    }

    private void cleanupExpired(Long adminId) {
        List<Instant> attempts = failedAttemptsByAdmin.get(adminId);
        if (attempts == null || attempts.isEmpty()) {
            return;
        }
        Instant cutoff = Instant.now().minus(WINDOW_MINUTES, ChronoUnit.MINUTES);
        attempts.removeIf(instant -> instant.isBefore(cutoff));
        if (attempts.isEmpty()) {
            failedAttemptsByAdmin.remove(adminId);
        }
    }
}

