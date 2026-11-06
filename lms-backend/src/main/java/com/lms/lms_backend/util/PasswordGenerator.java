package com.lms.lms_backend.util;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class PasswordGenerator {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "@#$%&*!";
    private static final String ALL = UPPER + LOWER + DIGITS + SPECIAL;

    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordGenerator() {
    }

    /**
     * Sinh mật khẩu tạm thời 12 ký tự ngẫu nhiên bảo mật cao bằng SecureRandom.
     * Đảm bảo luôn có ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt.
     */
    public static String generateTemporaryPassword() {
        List<Character> chars = new ArrayList<>(12);

        chars.add(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
        chars.add(LOWER.charAt(RANDOM.nextInt(LOWER.length())));
        chars.add(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        chars.add(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));

        for (int i = 4; i < 12; i++) {
            chars.add(ALL.charAt(RANDOM.nextInt(ALL.length())));
        }

        Collections.shuffle(chars, RANDOM);

        StringBuilder sb = new StringBuilder(12);
        for (Character c : chars) {
            sb.append(c);
        }
        return sb.toString();
    }
}

