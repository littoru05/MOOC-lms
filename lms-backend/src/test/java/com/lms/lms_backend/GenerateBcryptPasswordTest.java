package com.lms.lms_backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBcryptPasswordTest {

    @Test
    void generateHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminPass = "admin123";
        String instructorPass = "instructor123";
        String studentPass = "student123";

        String adminHash = encoder.encode(adminPass);
        String instructorHash = encoder.encode(instructorPass);
        String studentHash = encoder.encode(studentPass);

        System.out.println("==================================================");
        System.out.println("BCRYPT HASH RESULTS:");
        System.out.println("admin123: " + adminHash + " (matches=" + encoder.matches(adminPass, adminHash) + ")");
        System.out.println("instructor123: " + instructorHash + " (matches=" + encoder.matches(instructorPass, instructorHash) + ")");
        System.out.println("student123: " + studentHash + " (matches=" + encoder.matches(studentPass, studentHash) + ")");
        System.out.println("==================================================");
    }
}
