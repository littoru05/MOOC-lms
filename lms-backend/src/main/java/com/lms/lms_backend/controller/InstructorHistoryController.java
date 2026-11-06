package com.lms.lms_backend.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.audit.AuditLogPageResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/instructor/history")
@PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
@RequiredArgsConstructor
public class InstructorHistoryController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<AuditLogPageResponse> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                auditLogService.getInstructorHistory(
                        authentication.getName(),
                        page,
                        size,
                        action,
                        courseId,
                        from,
                        to
                )
        );
    }
}

