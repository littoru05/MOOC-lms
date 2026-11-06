package com.lms.lms_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.audit.AuditLogPageResponse;
import com.lms.lms_backend.dto.audit.AuditLogResponse;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.AuditLog;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.exception.ResourceNotFoundException;
import com.lms.lms_backend.repository.AuditLogRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    /**
     * Ghi nhật ký kiểm toán trong cùng transaction với hành động gốc.
     */
    @Transactional
    public AuditLog log(
            User actor,
            AuditAction action,
            String entityType,
            Long entityId,
            String entityLabel,
            String details,
            User courseOwner
    ) {
        User effectiveActor = actor;
        if (effectiveActor == null) {
            effectiveActor = resolveCurrentActor();
        }
        if (effectiveActor == null) {
            effectiveActor = courseOwner;
        }

        if (effectiveActor == null) {
            log.warn("Cannot log audit without actor or courseOwner for entity: {} #{}", entityType, entityId);
            return null;
        }

        AuditLog auditLog = AuditLog.builder()
                .actor(effectiveActor)
                .action(action)
                .entityType(entityType != null ? entityType : "COURSE")
                .entityId(entityId)
                .entityLabel(entityLabel)
                .details(details)
                .courseOwner(courseOwner)
                .createdAt(LocalDateTime.now())
                .build();

        return auditLogRepository.save(auditLog);
    }

    /**
     * Tiện ích ghi log cho các hành động trên khóa học.
     */
    @Transactional
    public AuditLog logCourseAction(User actor, Course course, AuditAction action, String details) {
        if (course == null) return null;
        User owner = course.getInstructor();
        return log(
                actor,
                action,
                "COURSE",
                course.getId(),
                course.getTitle(),
                details,
                owner
        );
    }

    /**
     * Lấy lịch sử hoạt động cho Giảng viên (chỉ trả về logs có course_owner_id = giảng viên).
     */
    @Transactional(readOnly = true)
    public AuditLogPageResponse getInstructorHistory(
            String instructorEmail,
            int page,
            int size,
            AuditAction action,
            Long courseId,
            LocalDate from,
            LocalDate to
    ) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Giảng viên không tồn tại!"));

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Ràng buộc bảo mật tuyệt đối: chỉ lấy nhật ký có course_owner_id = giảng viên đăng nhập
            predicates.add(cb.equal(root.get("courseOwner").get("id"), instructor.getId()));

            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (courseId != null) {
                predicates.add(cb.equal(root.get("entityId"), courseId));
                predicates.add(cb.equal(root.get("entityType"), "COURSE"));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> pageResult = auditLogRepository.findAll(spec, pageable);

        // Tối ưu N+1: Lấy thông tin các khóa học liên quan để xác định khả năng "Khôi phục"
        Set<Long> courseIds = pageResult.getContent().stream()
                .filter(l -> "COURSE".equalsIgnoreCase(l.getEntityType()))
                .map(AuditLog::getEntityId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Course> courseMap = courseIds.isEmpty()
                ? Collections.emptyMap()
                : courseRepository.findAllById(courseIds).stream()
                        .collect(Collectors.toMap(Course::getId, c -> c));

        List<AuditLogResponse> dtoList = pageResult.getContent().stream()
                .map(logItem -> {
                    Course course = courseMap.get(logItem.getEntityId());
                    boolean canRestore = course != null && (
                            course.getStatus() == CourseStatus.ARCHIVED ||
                            Boolean.TRUE.equals(course.getIsDeleted())
                    );

                    boolean isCurrent = logItem.getActor() != null &&
                            logItem.getActor().getId().equals(instructor.getId());

                    String actorName = logItem.getActor() != null ? logItem.getActor().getFullName() : "Hệ thống";
                    String actorRole = logItem.getActor() != null && logItem.getActor().getRole() != null
                            ? logItem.getActor().getRole().name()
                            : "UNKNOWN";

                    return AuditLogResponse.builder()
                            .id(logItem.getId())
                            .action(logItem.getAction())
                            .actionLabel(logItem.getAction() != null ? logItem.getAction().getLabel() : "")
                            .actorId(logItem.getActor() != null ? logItem.getActor().getId() : null)
                            .actorName(actorName)
                            .actorRole(actorRole)
                            .isCurrentActor(isCurrent)
                            .entityType(logItem.getEntityType())
                            .entityId(logItem.getEntityId())
                            .entityLabel(logItem.getEntityLabel())
                            .details(logItem.getDetails())
                            .courseOwnerId(logItem.getCourseOwner() != null ? logItem.getCourseOwner().getId() : null)
                            .courseStatus(course != null ? course.getStatus() : null)
                            .isCourseDeleted(course != null ? course.getIsDeleted() : null)
                            .canRestore(canRestore)
                            .createdAt(logItem.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return AuditLogPageResponse.builder()
                .content(dtoList)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    private User resolveCurrentActor() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                return userRepository.findByEmail(auth.getName()).orElse(null);
            }
        } catch (Exception e) {
            log.debug("Could not resolve current actor from SecurityContext", e);
        }
        return null;
    }
}

