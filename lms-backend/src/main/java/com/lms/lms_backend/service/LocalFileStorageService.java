package com.lms.lms_backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path rootLocation;
    private final long maxVideoMb;

    private static final List<String> IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp");
    private static final List<String> VIDEO_EXTENSIONS = List.of("mp4", "webm");
    private static final List<String> DOCUMENT_EXTENSIONS = List.of("pdf");

    public LocalFileStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.upload.max-video-mb:200}") long maxVideoMb) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxVideoMb = maxVideoMb > 0 ? maxVideoMb : 200;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized upload directory at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ file: " + rootLocation, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        return store(file, "image");
    }

    @Override
    public String store(MultipartFile file, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống!");
        }

        String normalizedType = (fileType != null && !fileType.trim().isEmpty())
                ? fileType.trim().toLowerCase()
                : "image";

        if (!List.of("image", "video", "document").contains(normalizedType)) {
            throw new IllegalArgumentException("Loại tệp không hợp lệ! Chỉ chấp nhận: image, video, document.");
        }

        long fileSize = file.getSize();
        validateFileSize(normalizedType, fileSize);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        validateFileExtension(normalizedType, extension);

        String storedFilename = UUID.randomUUID().toString() + "." + extension;

        try {
            Path destinationFile = this.rootLocation.resolve(storedFilename).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new SecurityException("Không thể lưu file bên ngoài thư mục được chỉ định.");
            }

            // Ghi file dạng stream, KHÔNG đọc cả file vào bộ nhớ
            try (InputStream rawIn = file.getInputStream();
                 PushbackInputStream pbis = new PushbackInputStream(rawIn, 64)) {

                byte[] header = new byte[64];
                int bytesRead = pbis.read(header);
                if (bytesRead < 4) {
                    throw new IllegalArgumentException("Tệp tải lên không hợp lệ hoặc bị hỏng (dung lượng quá nhỏ)!");
                }

                // Kiểm tra chữ ký nội dung thực tế (magic bytes)
                validateContentSignature(normalizedType, extension, header, bytesRead);

                // Trả lại các byte đã đọc vào luồng để ghi trọn vẹn tệp
                pbis.unread(header, 0, bytesRead);

                // Ghi trực tiếp ra đĩa bằng luồng đệm
                Files.copy(pbis, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Saved file: {} as {} (type: {}, size: {} bytes)", originalFilename, storedFilename, normalizedType, fileSize);
            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu trữ file vào ổ đĩa!", e);
        }
    }

    private void validateFileSize(String type, long fileSize) {
        if ("image".equals(type) && fileSize > 5L * 1024 * 1024) {
            throw new IllegalArgumentException("Dung lượng ảnh vượt quá giới hạn tối đa 5MB!");
        }
        if ("video".equals(type) && fileSize > maxVideoMb * 1024 * 1024) {
            throw new IllegalArgumentException("Dung lượng video vượt quá giới hạn tối đa " + maxVideoMb + "MB!");
        }
        if ("document".equals(type) && fileSize > 20L * 1024 * 1024) {
            throw new IllegalArgumentException("Dung lượng tài liệu PDF vượt quá giới hạn tối đa 20MB!");
        }
    }

    private void validateFileExtension(String type, String extension) {
        switch (type) {
            case "image":
                if (!IMAGE_EXTENSIONS.contains(extension)) {
                    throw new IllegalArgumentException("Định dạng ảnh không hợp lệ! Chỉ chấp nhận: JPG, JPEG, PNG, WEBP.");
                }
                break;
            case "video":
                if (!VIDEO_EXTENSIONS.contains(extension)) {
                    throw new IllegalArgumentException("Định dạng video không hợp lệ! Chỉ chấp nhận: MP4, WEBM.");
                }
                break;
            case "document":
                if (!DOCUMENT_EXTENSIONS.contains(extension)) {
                    throw new IllegalArgumentException("Định dạng tài liệu không hợp lệ! Chỉ chấp nhận: PDF.");
                }
                break;
            default:
                throw new IllegalArgumentException("Loại tệp không được hỗ trợ: " + type);
        }
    }

    private void validateContentSignature(String type, String extension, byte[] header, int bytesRead) {
        switch (type) {
            case "image":
                if ("jpg".equals(extension) || "jpeg".equals(extension)) {
                    if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là ảnh JPEG/JPG hợp lệ!");
                    }
                } else if ("png".equals(extension)) {
                    if ((header[0] & 0xFF) != 0x89 || (header[1] & 0xFF) != 0x50 
                            || (header[2] & 0xFF) != 0x4E || (header[3] & 0xFF) != 0x47) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là ảnh PNG hợp lệ!");
                    }
                } else if ("webp".equals(extension)) {
                    boolean isRiff = (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F');
                    boolean isWebp = bytesRead >= 12 && (header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P');
                    if (!isRiff || !isWebp) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là ảnh WEBP hợp lệ!");
                    }
                }
                break;

            case "video":
                if ("mp4".equals(extension)) {
                    boolean hasFtyp = false;
                    for (int i = 0; i <= bytesRead - 4 && i <= 32; i++) {
                        if (header[i] == 'f' && header[i + 1] == 't' && header[i + 2] == 'y' && header[i + 3] == 'p') {
                            hasFtyp = true;
                            break;
                        }
                    }
                    if (!hasFtyp) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là video MP4 hợp lệ (không tìm thấy chữ ký 'ftyp')!");
                    }
                } else if ("webm".equals(extension)) {
                    boolean isEbml = ((header[0] & 0xFF) == 0x1A && (header[1] & 0xFF) == 0x45 
                                   && (header[2] & 0xFF) == 0xDF && (header[3] & 0xFF) == 0xA3);
                    if (!isEbml) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là video WebM hợp lệ (thiếu mã EBML 1A 45 DF A3)!");
                    }
                }
                break;

            case "document":
                if ("pdf".equals(extension)) {
                    boolean isPdf = (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46);
                    if (!isPdf) {
                        throw new IllegalArgumentException("Nội dung tệp không phải là tài liệu PDF hợp lệ (thiếu '%PDF')!");
                    }
                }
                break;
        }
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            if (!file.toAbsolutePath().startsWith(rootLocation.toAbsolutePath())) {
                throw new SecurityException("Đường dẫn file không hợp lệ!");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Không tìm thấy file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Lỗi đường dẫn file: " + filename, e);
        }
    }
}
