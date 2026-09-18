package com.lms.lms_backend.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CertificateHtmlToPdfRendererTest {

    private final CertificateHtmlToPdfRenderer renderer = new CertificateHtmlToPdfRenderer();

    @Test
    @DisplayName("Render chứng chỉ thường: Tạo thành công PDF hợp lệ có magic byte %PDF-")
    void renderCertificate_Standard_Success() {
        byte[] pdfBytes = renderer.renderCertificate(
                "Nguyễn Văn Bình",
                "Lập trình Spring Boot & React toàn diện",
                "TS. Trần Anh Tuấn",
                "CERT-TEST-001",
                LocalDateTime.now(),
                120,
                85,
                "http://localhost:5173/certificates?code=CERT-TEST-001"
        );

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 5000, "File PDF chứng chỉ hoàn chỉnh phải có dung lượng tối thiểu 5KB");

        // Kiểm tra magic byte %PDF-
        String magicHeader = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", magicHeader);
    }

    @Test
    @DisplayName("Render chứng chỉ Xuất sắc (With Distinction >= 90%): Thành công")
    void renderCertificate_WithDistinction_Success() throws Exception {
        byte[] pdfBytes = renderer.renderCertificate(
                "Lê Thị Bích Hường",
                "Trí Tuệ Nhân Tạo và Ứng Dụng Deep Learning",
                "GS. John Hopkins",
                "CERT-DIST-999",
                LocalDateTime.of(2026, 10, 6, 14, 30),
                360,
                98,
                "https://edumooc.edu.vn/certificates?code=CERT-DIST-999"
        );

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 5000);

        String magicHeader = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", magicHeader);
    }
}
