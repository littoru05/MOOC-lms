package com.lms.lms_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.lms.lms_backend.dto.audit.AuditLogPageResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.AuditLog;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.AuditLogRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    private User instructorA;
    private User instructorB;
    private User admin;
    private Course courseA;

    @BeforeEach
    void setUp() {
        instructorA = User.builder().id(10L).email("instA@lms.com").fullName("Giảng viên A").role(Role.ROLE_INSTRUCTOR).build();
        instructorB = User.builder().id(20L).email("instB@lms.com").fullName("Giảng viên B").role(Role.ROLE_INSTRUCTOR).build();
        admin = User.builder().id(1L).email("admin@lms.com").fullName("Admin").role(Role.ROLE_ADMIN).build();

        courseA = Course.builder()
                .id(100L)
                .title("Khóa học Spring Boot")
                .instructor(instructorA)
                .status(CourseStatus.DRAFT)
                .build();
    }

    @Test
    @DisplayName("logCourseAction: Ghi thành công audit log cho hành động của khóa học")
    void logCourseAction_Success() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        AuditLog saved = auditLogService.logCourseAction(instructorA, courseA, AuditAction.COURSE_CREATED, "Khởi tạo khóa học mới");

        assertNotNull(saved);
        assertEquals(AuditAction.COURSE_CREATED, saved.getAction());
        assertEquals("COURSE", saved.getEntityType());
        assertEquals(100L, saved.getEntityId());
        assertEquals("Khóa học Spring Boot", saved.getEntityLabel());
        assertEquals(instructorA, saved.getActor());
        assertEquals(instructorA, saved.getCourseOwner());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("getInstructorHistory: Trả về phân trang và thông tin khóa học chuẩn xác")
    void getInstructorHistory_Success() {
        when(userRepository.findByEmail("instA@lms.com")).thenReturn(Optional.of(instructorA));

        AuditLog log1 = AuditLog.builder()
                .id(1L)
                .actor(instructorA)
                .action(AuditAction.COURSE_CREATED)
                .entityType("COURSE")
                .entityId(100L)
                .entityLabel("Khóa học Spring Boot")
                .details("Tạo mới")
                .courseOwner(instructorA)
                .createdAt(LocalDateTime.now())
                .build();

        Page<AuditLog> mockPage = new PageImpl<>(List.of(log1));
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);
        when(courseRepository.findAllById(anyCollection())).thenReturn(List.of(courseA));

        AuditLogPageResponse res = auditLogService.getInstructorHistory(
                "instA@lms.com", 0, 10, null, null, null, null
        );

        assertNotNull(res);
        assertEquals(1, res.getContent().size());
        assertEquals("Tạo khóa học", res.getContent().get(0).getActionLabel());
        assertTrue(res.getContent().get(0).getIsCurrentActor());
        assertFalse(res.getContent().get(0).getCanRestore()); // DRAFT -> canRestore is false
    }

    @Test
    @DisplayName("getInstructorHistory: Khóa ARCHIVED hoặc isDeleted=true thì canRestore = true")
    void getInstructorHistory_CanRestoreWhenArchivedOrDeleted() {
        when(userRepository.findByEmail("instA@lms.com")).thenReturn(Optional.of(instructorA));

        Course archivedCourse = Course.builder()
                .id(101L)
                .title("Khóa học Cũ")
                .instructor(instructorA)
                .status(CourseStatus.ARCHIVED)
                .isDeleted(false)
                .build();

        AuditLog logItem = AuditLog.builder()
                .id(2L)
                .actor(instructorA)
                .action(AuditAction.COURSE_DELETED)
                .entityType("COURSE")
                .entityId(101L)
                .entityLabel("Khóa học Cũ")
                .details("Chuyển sang lưu trữ")
                .courseOwner(instructorA)
                .createdAt(LocalDateTime.now())
                .build();

        Page<AuditLog> mockPage = new PageImpl<>(List.of(logItem));
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);
        when(courseRepository.findAllById(anyCollection())).thenReturn(List.of(archivedCourse));

        AuditLogPageResponse res = auditLogService.getInstructorHistory(
                "instA@lms.com", 0, 10, AuditAction.COURSE_DELETED, 101L, null, null
        );

        assertNotNull(res);
        assertEquals(1, res.getContent().size());
        assertTrue(res.getContent().get(0).getCanRestore());
    }

    @Test
    @DisplayName("getInstructorHistory: Ném ResourceNotFoundException nếu email giảng viên không tồn tại")
    void getInstructorHistory_ThrowsIfNotFound() {
        when(userRepository.findByEmail("unknown@lms.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                auditLogService.getInstructorHistory("unknown@lms.com", 0, 10, null, null, null, null)
        );
    }
}

