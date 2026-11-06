package com.lms.lms_backend.util;

import java.time.LocalDate;

public final class MaskingUtils {

    private MaskingUtils() {
    }

    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }
        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex + 1);

        char localFirst = localPart.charAt(0);
        int dotIndex = domainPart.lastIndexOf('.');
        if (dotIndex > 0) {
            String domainName = domainPart.substring(0, dotIndex);
            String ext = domainPart.substring(dotIndex);
            char domainFirst = domainName.isEmpty() ? 'x' : domainName.charAt(0);
            return localFirst + "***@" + domainFirst + "***" + ext;
        } else {
            char domainFirst = domainPart.isEmpty() ? 'x' : domainPart.charAt(0);
            return localFirst + "***@" + domainFirst + "***";
        }
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String trimmed = phone.trim();
        if (trimmed.length() >= 6) {
            return trimmed.substring(0, 2) + "******" + trimmed.substring(trimmed.length() - 2);
        }
        return "******";
    }

    public static String maskDateOfBirth(LocalDate dob) {
        if (dob == null) {
            return null;
        }
        return "**/**/****";
    }

    public static String maskGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return null;
        }
        return "***";
    }
}

