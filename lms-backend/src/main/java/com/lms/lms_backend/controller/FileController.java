package com.lms.lms_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.lms_backend.service.FileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/files", "/api/files"})
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String storedFilename = fileStorageService.store(file);
        String fileUrl = "/api/v1/files/" + storedFilename;
        return ResponseEntity.ok(Map.of(
            "url", fileUrl,
            "filename", storedFilename
        ));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource file = fileStorageService.loadAsResource(filename);

        String contentType = null;
        try {
            contentType = Files.probeContentType(file.getFile().toPath());
        } catch (IOException e) {
            contentType = "application/octet-stream";
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
