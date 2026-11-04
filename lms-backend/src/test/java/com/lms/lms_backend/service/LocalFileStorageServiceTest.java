package com.lms.lms_backend.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new LocalFileStorageService(tempDir.toString(), 200);
        storageService.init();
    }

    // Helper tạo fake mp4 có 'ftyp' tại byte 4..7
    private byte[] createMockMp4Bytes() {
        byte[] bytes = new byte[64];
        bytes[0] = 0; bytes[1] = 0; bytes[2] = 0; bytes[3] = 32; // size
        bytes[4] = 'f'; bytes[5] = 't'; bytes[6] = 'y'; bytes[7] = 'p';
        bytes[8] = 'i'; bytes[9] = 's'; bytes[10] = 'o'; bytes[11] = 'm';
        return bytes;
    }

    // Helper tạo fake webm với EBML 1A 45 DF A3
    private byte[] createMockWebmBytes() {
        byte[] bytes = new byte[64];
        bytes[0] = (byte) 0x1A;
        bytes[1] = (byte) 0x45;
        bytes[2] = (byte) 0xDF;
        bytes[3] = (byte) 0xA3;
        return bytes;
    }

    // Helper tạo fake pdf với %PDF
    private byte[] createMockPdfBytes() {
        return "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF".getBytes(StandardCharsets.ISO_8859_1);
    }

    // Helper tạo fake png với 89 50 4E 47
    private byte[] createMockPngBytes() {
        byte[] bytes = new byte[64];
        bytes[0] = (byte) 0x89;
        bytes[1] = 0x50; // 'P'
        bytes[2] = 0x4E; // 'N'
        bytes[3] = 0x47; // 'G'
        return bytes;
    }

    // Helper tạo fake jpeg với FF D8 FF
    private byte[] createMockJpegBytes() {
        byte[] bytes = new byte[64];
        bytes[0] = (byte) 0xFF;
        bytes[1] = (byte) 0xD8;
        bytes[2] = (byte) 0xFF;
        return bytes;
    }

    @Test
    void store_validMp4Video_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture1.mp4", "video/mp4", createMockMp4Bytes());

        String filename = storageService.store(file, "video");
        assertNotNull(filename);
        assertTrue(filename.endsWith(".mp4"));

        Resource res = storageService.loadAsResource(filename);
        assertTrue(res.exists());
    }

    @Test
    void store_validWebmVideo_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture2.webm", "video/webm", createMockWebmBytes());

        String filename = storageService.store(file, "video");
        assertNotNull(filename);
        assertTrue(filename.endsWith(".webm"));
    }

    @Test
    void store_validPdfDocument_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "syllabus.pdf", "application/pdf", createMockPdfBytes());

        String filename = storageService.store(file, "document");
        assertNotNull(filename);
        assertTrue(filename.endsWith(".pdf"));
    }

    @Test
    void store_validPngImage_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", createMockPngBytes());

        String filename = storageService.store(file, "image");
        assertNotNull(filename);
        assertTrue(filename.endsWith(".png"));
    }

    @Test
    void store_validJpegImage_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", createMockJpegBytes());

        String filename = storageService.store(file, "image");
        assertNotNull(filename);
        assertTrue(filename.endsWith(".jpg"));
    }

    @Test
    void store_fakeMp4File_withoutFtyp_throwsException() {
        byte[] fakeBytes = "Hello this is a plain text masquerading as mp4".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious.mp4", "video/mp4", fakeBytes);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(file, "video");
        });
        assertTrue(ex.getMessage().contains("ftyp") || ex.getMessage().contains("không phải là video MP4"));
    }

    @Test
    void store_fakePdfFile_withoutMagicHeader_throwsException() {
        byte[] fakeBytes = "This is not a pdf file content at all!".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake.pdf", "application/pdf", fakeBytes);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(file, "document");
        });
        assertTrue(ex.getMessage().contains("%PDF") || ex.getMessage().contains("không phải là tài liệu PDF"));
    }

    @Test
    void store_wrongExtensionForType_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", createMockPdfBytes());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(file, "video");
        });
        assertTrue(ex.getMessage().contains("Định dạng video không hợp lệ"));
    }

    @Test
    void store_invalidFileType_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "archive.zip", "application/zip", new byte[]{1, 2, 3, 4, 5});

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(file, "unknown_type");
        });
        assertTrue(ex.getMessage().contains("Loại tệp không hợp lệ"));
    }

    @Test
    void store_oversizedImage_throwsException() {
        MockMultipartFile oversizedFile = new MockMultipartFile(
                "file", "huge.png", "image/png", new byte[6 * 1024 * 1024]);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(oversizedFile, "image");
        });
        assertTrue(ex.getMessage().contains("vượt quá giới hạn tối đa 5MB"));
    }

    @Test
    void store_oversizedDocument_throwsException() {
        MockMultipartFile oversizedFile = new MockMultipartFile(
                "file", "huge.pdf", "application/pdf", new byte[21 * 1024 * 1024]);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            storageService.store(oversizedFile, "document");
        });
        assertTrue(ex.getMessage().contains("vượt quá giới hạn tối đa 20MB"));
    }

    @Test
    void store_oversizedVideo_throwsException() {
        // Cấu hình service với giới hạn video nhỏ để test dễ dàng (ví dụ 10MB)
        LocalFileStorageService customStorage = new LocalFileStorageService(tempDir.toString(), 10);
        customStorage.init();

        MockMultipartFile oversizedFile = new MockMultipartFile(
                "file", "huge.mp4", "video/mp4", new byte[11 * 1024 * 1024]);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            customStorage.store(oversizedFile, "video");
        });
        assertTrue(ex.getMessage().contains("vượt quá giới hạn tối đa 10MB"));
    }

    @Test
    void store_pathTraversalAttempt_storesSafelyWithUUID() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../etc/passwd.png", "image/png", createMockPngBytes());

        String stored = storageService.store(file, "image");
        assertTrue(stored.endsWith(".png"));
        Path destination = tempDir.resolve(stored);
        assertTrue(Files.exists(destination));
        assertTrue(destination.startsWith(tempDir));
    }
}

