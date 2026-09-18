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

    // Tải thông tin / xuất file chứng chỉ định dạng PDF chuẩn quốc tế
    @GetMapping("/download/{code}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String code) {
        byte[] pdfBytes = certificateService.generateCertificatePdf(code);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // Xem trước trực tiếp chứng chỉ PDF trên web (Content-Disposition: inline)
    @GetMapping("/preview/{code}")
    public ResponseEntity<byte[]> previewCertificate(@PathVariable String code) {
        byte[] pdfBytes = certificateService.generateCertificatePdf(code);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"certificate-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

