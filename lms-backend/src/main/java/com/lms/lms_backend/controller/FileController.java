package com.lms.lms_backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.lms_backend.service.FileStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/v1/files", "/api/files"})
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "image") String type,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Vui lòng đăng nhập để thực hiện tải lên tệp!");
        }

        String normalizedType = (type != null && !type.trim().isEmpty())
                ? type.trim().toLowerCase()
                : "image";

        // Phân quyền: video và document chỉ dành cho Giảng viên hoặc Quản trị viên
        if ("video".equals(normalizedType) || "document".equals(normalizedType)) {
            boolean isInstructorOrAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR")
                                || a.getAuthority().equals("INSTRUCTOR")
                                || a.getAuthority().equals("ROLE_ADMIN")
                                || a.getAuthority().equals("ADMIN"));
            if (!isInstructorOrAdmin) {
                throw new AccessDeniedException("Bạn không có quyền tải lên video bài giảng hoặc tài liệu! Chỉ Giảng viên hoặc Quản trị viên mới được phép.");
            }
        }

        String storedFilename = fileStorageService.store(file, normalizedType);
        String fileUrl = "/api/v1/files/" + storedFilename;
        return ResponseEntity.ok(Map.of(
            "url", fileUrl,
            "filename", storedFilename
        ));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<?> getFile(
            @PathVariable String filename,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) throws IOException {

        Resource file = fileStorageService.loadAsResource(filename);
        String contentType = determineContentType(filename);
        MediaType mediaType = MediaType.parseMediaType(contentType);

        long contentLength = file.contentLength();

        // Nếu client không yêu cầu Range, trả về toàn bộ tệp với Accept-Ranges
        if (rangeHeader == null || rangeHeader.trim().isEmpty()) {
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                    .body(file);
        }

        // Xử lý HTTP Range (hỗ trợ tua video)
        List<HttpRange> httpRanges;
        try {
            httpRanges = HttpRange.parseRanges(rangeHeader);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + contentLength)
                    .build();
        }

        if (httpRanges.isEmpty()) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + contentLength)
                    .build();
        }

        HttpRange range = httpRanges.get(0);
        long start = range.getRangeStart(contentLength);
        long end = range.getRangeEnd(contentLength);
        long rangeLength = end - start + 1;

        ResourceRegion region = new ResourceRegion(file, start, rangeLength);
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(mediaType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(region);
    }

    private String determineContentType(String filename) {
        String lower = filename != null ? filename.toLowerCase() : "";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return MediaTypeFactory.getMediaType(filename)
                .map(MediaType::toString)
                .orElse("application/octet-stream");
    }
}
