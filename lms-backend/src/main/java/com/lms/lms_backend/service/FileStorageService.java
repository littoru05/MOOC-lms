package com.lms.lms_backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String store(MultipartFile file);
    String store(MultipartFile file, String fileType);
    Resource loadAsResource(String filename);
}
