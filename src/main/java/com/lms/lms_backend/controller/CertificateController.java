package com.lms.lms_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.certificate.CertificateResponse;
import com.lms.lms_backend.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/certificates", "/api/certificates"})
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    // Tra cứu và xác thực chứng chỉ số công khai bằng mã băm UUID
    @GetMapping("/verify/{code}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable String code) {
        return ResponseEntity.ok(certificateService.getCertificateByCode(code));
    }

    // Lấy chứng chỉ theo lượt ghi danh
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<CertificateResponse> getCertificateByEnrollment(@PathVariable Long enrollmentId) {
        return ResponseEntity.ok(certificateService.getCertificateByEnrollment(enrollmentId));
    }

    // Tải thông tin / xuất file chứng chỉ
    @GetMapping("/download/{code}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String code) {
        CertificateResponse cert = certificateService.getCertificateByCode(code);
        String baseUrl = (frontendBaseUrl != null ? frontendBaseUrl : "http://localhost:5173").replaceAll("/+$", "");
        String text = "====================================================\n"
                    + "               CHỨNG NHẬN HOÀN THÀNH               \n"
                    + "          HỆ THỐNG ĐÀO TẠO TRỰC TUYẾN MOOC         \n"
                    + "====================================================\n\n"
                    + "Chứng nhận học viên: " + cert.getStudentName() + "\n"
                    + "Email: " + cert.getStudentEmail() + "\n\n"
                    + "Đã hoàn thành xuất sắc khóa học: " + cert.getCourseTitle() + "\n"
                    + "Giảng viên hướng dẫn: " + cert.getInstructorName() + "\n\n"
                    + "Mã xác thực duy nhất: " + cert.getCertificateCode() + "\n"
                    + "Ngày cấp: " + cert.getIssuedAt() + "\n\n"
                    + "Tra cứu xác thực tại: " + baseUrl + "/certificates/verify/" + cert.getCertificateCode() + "\n"
                    + "====================================================\n";

        byte[] output = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + code + ".txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(output);
    }
}

