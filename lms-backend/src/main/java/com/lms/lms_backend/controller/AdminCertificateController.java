package com.lms.lms_backend.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.certificate.CertificateAdminResponse;
import com.lms.lms_backend.dto.certificate.CertificatePageResponse;
import com.lms.lms_backend.dto.certificate.CertificateRevokeRequest;
import com.lms.lms_backend.dto.certificate.CertificateSummaryResponse;
import com.lms.lms_backend.entity.CertificateStatus;
import com.lms.lms_backend.service.CertificateService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/admin/certificates", "/api/admin/certificates"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<CertificatePageResponse> getAdminCertificates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) CertificateStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(certificateService.getAdminCertificates(page, size, q, status, from, to));
    }

    @GetMapping("/summary")
    public ResponseEntity<CertificateSummaryResponse> getSummary() {
        return ResponseEntity.ok(certificateService.getCertificateSummary());
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<CertificateAdminResponse> revokeCertificate(
            @PathVariable Long id,
            @Valid @RequestBody CertificateRevokeRequest request,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        return ResponseEntity.ok(certificateService.revokeCertificate(id, request.getReason(), adminEmail));
    }

    @PostMapping("/{id}/reinstate")
    public ResponseEntity<CertificateAdminResponse> reinstateCertificate(
            @PathVariable Long id,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        return ResponseEntity.ok(certificateService.reinstateCertificate(id, adminEmail));
    }
}

