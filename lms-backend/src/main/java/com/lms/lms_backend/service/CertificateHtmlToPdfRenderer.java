package com.lms.lms_backend.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.openhtmltopdf.svgsupport.BatikSVGDrawer;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CertificateHtmlToPdfRenderer {

    private static final String TEMPLATE_PATH = "templates/certificate_template.html";

    /**
     * Renders a course completion certificate into a PDF byte array using OpenHtmlToPdf.
     */
    public byte[] renderCertificate(
            String studentName,
            String courseTitle,
            String instructorName,
            String certificateCode,
            LocalDateTime issuedAt,
            Integer durationMinutes,
            Integer finalScore,
            String verificationUrl
    ) {
        try {
            // 1. Read HTML template
            ClassPathResource templateResource = new ClassPathResource(TEMPLATE_PATH);
            String html;
            try (InputStream is = templateResource.getInputStream()) {
                html = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

            // 2. Format Issue Date (e.g., "OCTOBER 06, 2026" or "18/09/2026")
            String formattedDate;
            if (issuedAt != null) {
                formattedDate = issuedAt.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy", java.util.Locale.ENGLISH)).toUpperCase();
            } else {
                formattedDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy", java.util.Locale.ENGLISH)).toUpperCase();
            }

            // 3. Format Duration
            String durationText;
            if (durationMinutes != null && durationMinutes > 0) {
                if (durationMinutes >= 60) {
                    int hours = durationMinutes / 60;
                    int mins = durationMinutes % 60;
                    durationText = mins > 0 ? hours + " giờ " + mins + " phút" : hours + " giờ";
                } else {
                    durationText = durationMinutes + " phút";
                }
            } else {
                durationText = "36 giờ";
            }

            // 4. Distinction badge & statement
            boolean isDistinction = finalScore != null && finalScore >= 90;
            String distinctionBadgeHtml = isDistinction
                    ? "<div class=\"distinction-badge\">WITH DISTINCTION</div>"
                    : "";
            String completionPhrase = isDistinction
                    ? "has successfully completed with distinction / đã hoàn thành xuất sắc khóa học"
                    : "has successfully completed / đã hoàn thành khóa học";

            // 5. Generate QR Code Base64
            String qrBase64DataUri = generateQrCodeBase64(verificationUrl, 200, 200);

            // 6. Format verify short URL
            String verifyShortUrl = verificationUrl.replaceFirst("^https?://", "");

            // 7. Instructor Signature Text (name in Latin cursive)
            String instructorSigText = stripAccents(instructorName != null && !instructorName.isBlank() ? instructorName : "Instructor");

            // 8. Replace placeholders (using XML escaping where appropriate)
            html = html.replace("{{issueDate}}", escapeXml(formattedDate))
                    .replace("{{studentName}}", escapeXml(studentName != null ? studentName : "Học Viên"))
                    .replace("{{completionPhrase}}", escapeXml(completionPhrase))
                    .replace("{{courseTitle}}", escapeXml(courseTitle != null ? courseTitle : "Khóa học"))
                    .replace("{{durationText}}", escapeXml(durationText))
                    .replace("{{instructorSigText}}", escapeXml(instructorSigText))
                    .replace("{{instructorName}}", escapeXml(instructorName != null ? instructorName : "Giảng viên"))
                    .replace("{{distinctionBadgeHtml}}", distinctionBadgeHtml)
                    .replace("{{qrCodeDataUri}}", qrBase64DataUri)
                    .replace("{{verifyShortUrl}}", escapeXml(verifyShortUrl))
                    .replace("{{certCode}}", escapeXml(certificateCode != null ? certificateCode : ""));

            // 9. Build PDF with OpenHtmlToPdf
            try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.useSVGDrawer(new BatikSVGDrawer());

                // Register local bundled TTF fonts
                registerFonts(builder);

                builder.withHtmlContent(html, "");
                builder.toStream(os);
                builder.run();

                return os.toByteArray();
            }

        } catch (Exception e) {
            log.error("Lỗi khi render chứng chỉ bằng OpenHtmlToPdf: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo file PDF chứng chỉ: " + e.getMessage(), e);
        }
    }

    private void registerFonts(PdfRendererBuilder builder) {
        try {
            // Register Arial
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Arial-Regular.ttf"), "Arial", 400, FontStyle.NORMAL, true);
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Arial-Bold.ttf"), "Arial", 700, FontStyle.NORMAL, true);

            // Register Times New Roman & Times
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Times-Regular.ttf"), "Times New Roman", 400, FontStyle.NORMAL, true);
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Times-Bold.ttf"), "Times New Roman", 700, FontStyle.NORMAL, true);
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Times-Regular.ttf"), "Times", 400, FontStyle.NORMAL, true);
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/Times-Bold.ttf"), "Times", 700, FontStyle.NORMAL, true);

            // Register AlexBrush & DancingScript for handwritten signatures
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/AlexBrush-Regular.ttf"), "AlexBrush", 400, FontStyle.NORMAL, true);
            builder.useFont(() -> getClass().getResourceAsStream("/fonts/DancingScript.ttf"), "DancingScript", 400, FontStyle.NORMAL, true);
        } catch (Exception e) {
            log.warn("Không thể nạp font tùy chỉnh cho OpenHtmlToPdf: {}", e.getMessage());
        }
    }

    private String generateQrCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);

            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Không thể tạo mã QR cho chứng chỉ: {}", e.getMessage());
            return "";
        }
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String stripAccents(String s) {
        if (s == null) return "";
        String normalized = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D");
    }
}
