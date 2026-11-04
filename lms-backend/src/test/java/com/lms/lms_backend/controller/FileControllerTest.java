package com.lms.lms_backend.controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.lms.lms_backend.service.FileStorageService;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    @Mock
    private FileStorageService fileStorageService;

    private FileController fileController;

    private Authentication studentAuth;
    private Authentication instructorAuth;
    private Authentication adminAuth;

    private MockMultipartFile mockVideoFile;
    private MockMultipartFile mockDocFile;
    private MockMultipartFile mockImageFile;

    @BeforeEach
    void setUp() {
        fileController = new FileController(fileStorageService);

        studentAuth = new UsernamePasswordAuthenticationToken(
                "student01", "password", List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        instructorAuth = new UsernamePasswordAuthenticationToken(
                "instructor01", "password", List.of(new SimpleGrantedAuthority("ROLE_INSTRUCTOR")));
        adminAuth = new UsernamePasswordAuthenticationToken(
                "admin01", "password", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        mockVideoFile = new MockMultipartFile(
                "file", "lecture.mp4", "video/mp4", "ftypisomcontentvideo".getBytes(StandardCharsets.UTF_8));
        mockDocFile = new MockMultipartFile(
                "file", "syllabus.pdf", "application/pdf", "%PDF-1.4content".getBytes(StandardCharsets.UTF_8));
        mockImageFile = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[]{(byte) 0x89, 'P', 'N', 'G'});
    }

    @Test
    void student_uploadVideo_throwsAccessDeniedException() {
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            fileController.uploadFile(mockVideoFile, "video", studentAuth);
        });

        assertTrue(ex.getMessage().contains("Bạn không có quyền tải lên video bài giảng hoặc tài liệu"));
    }

    @Test
    void student_uploadDocument_throwsAccessDeniedException() {
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            fileController.uploadFile(mockDocFile, "document", studentAuth);
        });

        assertTrue(ex.getMessage().contains("Bạn không có quyền tải lên video bài giảng hoặc tài liệu"));
    }

    @Test
    void student_uploadImage_returns200Ok() {
        when(fileStorageService.store(any(), eq("image"))).thenReturn("avatar-123.png");

        ResponseEntity<Map<String, String>> response = fileController.uploadFile(mockImageFile, "image", studentAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("avatar-123.png", response.getBody().get("filename"));
        assertEquals("/api/v1/files/avatar-123.png", response.getBody().get("url"));
    }

    @Test
    void instructor_uploadVideo_returns200Ok() {
        when(fileStorageService.store(any(), eq("video"))).thenReturn("video-lesson-uuid.mp4");

        ResponseEntity<Map<String, String>> response = fileController.uploadFile(mockVideoFile, "video", instructorAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("video-lesson-uuid.mp4", response.getBody().get("filename"));
        assertEquals("/api/v1/files/video-lesson-uuid.mp4", response.getBody().get("url"));
        verify(fileStorageService).store(mockVideoFile, "video");
    }

    @Test
    void instructor_uploadDocument_returns200Ok() {
        when(fileStorageService.store(any(), eq("document"))).thenReturn("doc-syllabus-uuid.pdf");

        ResponseEntity<Map<String, String>> response = fileController.uploadFile(mockDocFile, "document", instructorAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("doc-syllabus-uuid.pdf", response.getBody().get("filename"));
        verify(fileStorageService).store(mockDocFile, "document");
    }

    @Test
    void admin_uploadVideo_returns200Ok() {
        when(fileStorageService.store(any(), eq("video"))).thenReturn("admin-video.mp4");

        ResponseEntity<Map<String, String>> response = fileController.uploadFile(mockVideoFile, "video", adminAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("admin-video.mp4", response.getBody().get("filename"));
    }

    @Test
    void unauthenticatedUser_upload_throwsAccessDeniedException() {
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            fileController.uploadFile(mockVideoFile, "video", null);
        });

        assertTrue(ex.getMessage().contains("Vui lòng đăng nhập"));
    }

    @Test
    void getFile_withoutRange_returns200OkWithAcceptRanges() throws IOException {
        byte[] dummyData = "abcdefghijklmnopqrstuvwxyz".getBytes(StandardCharsets.UTF_8);
        InputStream is = new ByteArrayInputStream(dummyData);
        InputStreamResource resource = new InputStreamResource(is) {
            @Override
            public long contentLength() {
                return dummyData.length;
            }

            @Override
            public String getFilename() {
                return "test-video.mp4";
            }
        };

        when(fileStorageService.loadAsResource("test-video.mp4")).thenReturn(resource);

        ResponseEntity<?> response = fileController.getFile("test-video.mp4", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("bytes", response.getHeaders().getFirst("Accept-Ranges"));
        assertEquals("video/mp4", response.getHeaders().getContentType().toString());
        assertEquals(String.valueOf(dummyData.length), response.getHeaders().getFirst("Content-Length"));
        assertEquals(resource, response.getBody());
    }

    @Test
    void getFile_withRangeHeader_returns206PartialContent() throws IOException {
        byte[] dummyData = "0123456789abcdefghijklmnopqrstuvwxyz".getBytes(StandardCharsets.UTF_8);
        InputStream is = new ByteArrayInputStream(dummyData);
        InputStreamResource resource = new InputStreamResource(is) {
            @Override
            public long contentLength() {
                return dummyData.length;
            }

            @Override
            public String getFilename() {
                return "test-video.mp4";
            }
        };

        when(fileStorageService.loadAsResource("test-video.mp4")).thenReturn(resource);

        ResponseEntity<?> response = fileController.getFile("test-video.mp4", "bytes=0-9");

        assertEquals(HttpStatus.PARTIAL_CONTENT, response.getStatusCode());
        assertEquals("bytes", response.getHeaders().getFirst("Accept-Ranges"));
        assertEquals("video/mp4", response.getHeaders().getContentType().toString());
        assertTrue(response.getBody() instanceof ResourceRegion);

        ResourceRegion region = (ResourceRegion) response.getBody();
        assertEquals(0, region.getPosition());
        assertEquals(10, region.getCount());
    }
}
