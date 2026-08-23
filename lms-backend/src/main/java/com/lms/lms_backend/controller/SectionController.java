package com.lms.lms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.section.SectionRequest;
import com.lms.lms_backend.dto.section.SectionResponse;
import com.lms.lms_backend.service.SectionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/sections", "/api/sections"})
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<SectionResponse>> getSectionsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(sectionService.getSectionsByCourse(courseId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<SectionResponse> createSection(@Valid @RequestBody SectionRequest request) {
        return ResponseEntity.ok(sectionService.createSection(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<SectionResponse> updateSection(@PathVariable Long id, @Valid @RequestBody SectionRequest request) {
        return ResponseEntity.ok(sectionService.updateSection(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<String> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.ok("Xóa chương học thành công!");
    }
}
