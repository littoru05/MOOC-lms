package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseDeleteResponse;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.course.CourseUpdateRequest;
import com.lms.lms_backend.entity.AuditAction;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.NotificationType;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.specification.CourseSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;


    public List<CourseResponse> getAllPublishedCourses(
            String priceType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Long categoryId,
            String search
    ) {
        Specification<Course> spec = CourseSpecification.filterPublishedCourses(
                priceType, minPrice, maxPrice, categoryId, search
        );
        return courseRepository.findAll(spec).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getAllPublishedCourses() {
        return courseRepository.findByStatusAndIsDeletedFalse(CourseStatus.PUBLISHED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));
        return mapToResponse(course);
    }

    public CourseResponse getCourseById(Long id, String userEmail) {
        Course course = getCourseEntityById(id);
        if (course.getStatus() == CourseStatus.PUBLISHED) {
            return mapToResponse(course);
        }

        if (userEmail == null) {
            throw new RuntimeException("Bạn không có quyền truy cập khóa học chưa xuất bản!");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền xem chi tiết khóa học này!");
        }

        return mapToResponse(course);
    }

    public Course getCourseEntityById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));
    }

    public List<CourseResponse> getCoursesByInstructor(String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại!"));
        return courseRepository.findByInstructorIdAndIsDeletedFalse(instructor.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse createCourse(CourseCreateRequest req, String instructorEmail) {
        if (courseRepository.existsBySlug(req.getSlug())) {
            throw new RuntimeException("Slug khóa học đã tồn tại: " + req.getSlug());
        }

        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại với email: " + instructorEmail));

        Category category = resolveCategory(req.getCategoryId(), req.getCustomCategoryName());

        java.math.BigDecimal price = req.getPrice() != null ? req.getPrice() : java.math.BigDecimal.ZERO;
        if (price.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá khóa học không được âm!");
        }

        Course course = Course.builder()
                .title(req.getTitle())
                .slug(req.getSlug())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .price(price)
                .status(CourseStatus.DRAFT) // Mặc định là DRAFT
                .category(category)
                .instructor(instructor)
                .build();

        Course saved = courseRepository.save(course);
        if (auditLogService != null) {
            auditLogService.log(
                    instructor,
                    AuditAction.COURSE_CREATED,
                    "COURSE",
                    saved.getId(),
                    saved.getTitle(),
                    "Tạo mới khóa học (Bản nháp)",
                    instructor
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseUpdateRequest req, String userEmail) {
        Course course = getCourseEntityById(courseId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Chỉ chủ sở hữu (Instructor) hoặc Admin mới có quyền cập nhật
        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này!");
        }

        Category category = null;
        if ((req.getCustomCategoryName() != null && !req.getCustomCategoryName().trim().isEmpty())
                || req.getCategoryId() != null) {
            category = resolveCategory(req.getCategoryId(), req.getCustomCategoryName());
        } else {
            category = course.getCategory();
        }

        java.util.List<String> changedFields = new java.util.ArrayList<>();
        if (req.getTitle() != null && !req.getTitle().equals(course.getTitle())) {
            changedFields.add("Tiêu đề");
            course.setTitle(req.getTitle());
        }
        if (req.getDescription() != null && !req.getDescription().equals(course.getDescription())) {
            changedFields.add("Mô tả");
            course.setDescription(req.getDescription());
        }
        if (req.getThumbnailUrl() != null && !req.getThumbnailUrl().equals(course.getThumbnailUrl())) {
            changedFields.add("Ảnh thu nhỏ");
            course.setThumbnailUrl(req.getThumbnailUrl());
        }
        if (category != null && (course.getCategory() == null || !category.getId().equals(course.getCategory().getId()))) {
            changedFields.add("Danh mục");
            course.setCategory(category);
        }

        if (req.getPrice() != null) {
            if (req.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá khóa học không được âm!");
            }
            if (course.getPrice() == null || req.getPrice().compareTo(course.getPrice()) != 0) {
                changedFields.add("Giá");
                course.setPrice(req.getPrice());
            }
        }

        Course saved = courseRepository.save(course);
        if (auditLogService != null) {
            String details = changedFields.isEmpty() ? "Cập nhật thông tin khóa học" : "Cập nhật trường: " + String.join(", ", changedFields);
            auditLogService.log(
                    user,
                    AuditAction.COURSE_UPDATED,
                    "COURSE",
                    saved.getId(),
                    saved.getTitle(),
                    details,
                    saved.getInstructor()
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse submitForReview(Long courseId, String userEmail) {
        Course course = getCourseEntityById(courseId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền gửi duyệt khóa học này!");
        }

        course.setStatus(CourseStatus.PENDING);
        course.setRejectionReason(null);
        Course saved = courseRepository.save(course);

        if (auditLogService != null) {
            auditLogService.log(
                    user,
                    AuditAction.COURSE_SUBMITTED,
                    "COURSE",
                    course.getId(),
                    course.getTitle(),
                    "Gửi duyệt khóa học",
                    course.getInstructor()
            );
        }

        if (notificationService != null) {
            notificationService.notifyAdmins(
                    NotificationType.COURSE_SUBMITTED,
                    "Khóa học mới chờ duyệt",
                    user.getFullName() + " đã gửi duyệt khóa học \"" + course.getTitle() + "\"",
                    "/admin/courses/approval?courseId=" + course.getId(),
                    course.getId(),
                    user.getId()
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public CourseDeleteResponse deleteCourse(Long courseId, String userEmail) {
        Course course = getCourseEntityById(courseId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền xóa hoặc thao tác trên khóa học này!");
        }

        long enrolledCount = enrollmentRepository != null ? enrollmentRepository.countByCourseId(courseId) : 0L;

        if (enrolledCount > 0) {
            course.setStatus(CourseStatus.ARCHIVED);
            courseRepository.save(course);

            if (auditLogService != null) {
                auditLogService.log(
                        user,
                        AuditAction.COURSE_DELETED,
                        "COURSE",
                        course.getId(),
                        course.getTitle(),
                        "Lưu trữ khóa học do đã có học viên đăng ký",
                        course.getInstructor()
                );
            }

            return CourseDeleteResponse.builder()
                    .courseId(courseId)
                    .status(CourseStatus.ARCHIVED)
                    .isDeleted(false)
                    .isArchived(true)
                    .enrolledCount(enrolledCount)
                    .message("Khóa học đã có học viên đăng ký nên đã được chuyển sang trạng thái Lưu trữ (Ngừng kinh doanh) thay vì xóa vĩnh viễn.")
                    .build();
        } else {
            course.setIsDeleted(true);
            course.setDeletedAt(LocalDateTime.now());
            course.setStatus(CourseStatus.DRAFT);
            courseRepository.save(course);

            if (auditLogService != null) {
                auditLogService.log(
                        user,
                        AuditAction.COURSE_DELETED,
                        "COURSE",
                        course.getId(),
                        course.getTitle(),
                        "Xóa khóa học",
                        course.getInstructor()
                );
            }

            return CourseDeleteResponse.builder()
                    .courseId(courseId)
                    .status(CourseStatus.DRAFT)
                    .isDeleted(true)
                    .isArchived(false)
                    .enrolledCount(0L)
                    .message("Khóa học chưa có học viên đăng ký nên đã được xóa thành công khỏi hệ thống.")
                    .build();
        }
    }

    @Transactional
    public CourseResponse restoreCourse(Long courseId, String userEmail) {
        Course course = getCourseEntityById(courseId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền khôi phục khóa học này!");
        }

        if (course.getStatus() != CourseStatus.ARCHIVED && !Boolean.TRUE.equals(course.getIsDeleted())) {
            throw new RuntimeException("Chỉ có thể khôi phục khóa học đang ở trạng thái Lưu trữ hoặc Đã xóa!");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setIsDeleted(false);
        course.setDeletedAt(null);
        Course saved = courseRepository.save(course);

        if (auditLogService != null) {
            auditLogService.log(
                    user,
                    AuditAction.COURSE_RESTORED,
                    "COURSE",
                    saved.getId(),
                    saved.getTitle(),
                    "Khôi phục khóa học",
                    saved.getInstructor()
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse requestDeleteCourse(Long courseId, String userEmail) {
        Course course = getCourseEntityById(courseId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if (!course.getInstructor().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền yêu cầu xóa khóa học này!");
        }

        course.setStatus(CourseStatus.PENDING_DELETE);
        Course saved = courseRepository.save(course);

        if (auditLogService != null) {
            auditLogService.log(
                    user,
                    AuditAction.COURSE_DELETE_REQUESTED,
                    "COURSE",
                    course.getId(),
                    course.getTitle(),
                    "Yêu cầu xóa khóa học",
                    course.getInstructor()
            );
        }

        if (notificationService != null) {
            notificationService.notifyAdmins(
                    NotificationType.COURSE_DELETE_REQUESTED,
                    "Yêu cầu xóa khóa học",
                    user.getFullName() + " đã yêu cầu xóa khóa học \"" + course.getTitle() + "\"",
                    "/admin/courses/approval?courseId=" + course.getId(),
                    course.getId(),
                    user.getId()
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId) {
        Course course = getCourseEntityById(courseId);
        if (course.getStatus() == CourseStatus.PENDING_DELETE) {
            long enrolledCount = enrollmentRepository != null ? enrollmentRepository.countByCourseId(courseId) : 0L;
            if (enrolledCount > 0) {
                course.setStatus(CourseStatus.ARCHIVED);
            } else {
                course.setIsDeleted(true);
                course.setDeletedAt(LocalDateTime.now());
                course.setStatus(CourseStatus.DRAFT);
            }
            Course saved = courseRepository.save(course);
            if (notificationService != null && course.getInstructor() != null) {
                notificationService.notifyUser(
                        course.getInstructor(),
                        NotificationType.COURSE_DELETE_APPROVED,
                        "Yêu cầu xóa khóa học đã được duyệt",
                        "Yêu cầu xóa khóa học \"" + course.getTitle() + "\" đã được chấp thuận.",
                        "/instructor/courses/editor?courseId=" + course.getId(),
                        course.getId(),
                        null
                );
            }
            return mapToResponse(saved);
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setRejectionReason(null);
        Course saved = courseRepository.save(course);

        if (notificationService != null && course.getInstructor() != null) {
            notificationService.notifyUser(
                    course.getInstructor(),
                    NotificationType.COURSE_APPROVED,
                    "Khóa học đã được duyệt",
                    "Khóa học \"" + course.getTitle() + "\" đã được duyệt và xuất bản.",
                    "/instructor/courses/editor?courseId=" + course.getId(),
                    course.getId(),
                    null
            );
        }

        return mapToResponse(saved);
    }

    public CourseResponse rejectCourse(Long courseId) {
        return rejectCourse(courseId, null);
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId, String reason) {
        Course course = getCourseEntityById(courseId);
        String trimmedReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : null;

        if (course.getStatus() == CourseStatus.PENDING_DELETE) {
            course.setStatus(CourseStatus.PUBLISHED);
            Course saved = courseRepository.save(course);
            if (notificationService != null && course.getInstructor() != null) {
                String msg = (trimmedReason != null)
                        ? "Yêu cầu xóa khóa học \"" + course.getTitle() + "\" đã bị từ chối. Lý do: " + trimmedReason
                        : "Yêu cầu xóa khóa học \"" + course.getTitle() + "\" đã bị từ chối.";
                notificationService.notifyUser(
                        course.getInstructor(),
                        NotificationType.COURSE_DELETE_REJECTED,
                        "Yêu cầu xóa khóa học bị từ chối",
                        msg,
                        "/instructor/courses/editor?courseId=" + course.getId(),
                        course.getId(),
                        null
                );
            }
            return mapToResponse(saved);
        }

        course.setStatus(CourseStatus.REJECTED);
        course.setRejectionReason(trimmedReason);
        Course saved = courseRepository.save(course);

        if (notificationService != null && course.getInstructor() != null) {
            String msg = (trimmedReason != null)
                    ? "Khóa học \"" + course.getTitle() + "\" đã bị từ chối xét duyệt. Lý do: " + trimmedReason
                    : "Khóa học \"" + course.getTitle() + "\" đã bị từ chối xét duyệt.";
            notificationService.notifyUser(
                    course.getInstructor(),
                    NotificationType.COURSE_REJECTED,
                    "Khóa học bị từ chối",
                    msg,
                    "/instructor/courses/editor?courseId=" + course.getId(),
                    course.getId(),
                    null
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId, String actorEmail) {
        CourseResponse res = approveCourse(courseId);
        if (auditLogService != null && actorEmail != null) {
            User admin = userRepository.findByEmail(actorEmail).orElse(null);
            Course c = courseRepository.findById(courseId).orElse(null);
            if (admin != null && c != null) {
                auditLogService.log(
                        admin,
                        AuditAction.COURSE_APPROVED,
                        "COURSE",
                        c.getId(),
                        c.getTitle(),
                        "Quản trị viên duyệt xuất bản khóa học",
                        c.getInstructor()
                );
            }
        }
        return res;
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId, String reason, String actorEmail) {
        CourseResponse res = rejectCourse(courseId, reason);
        if (auditLogService != null && actorEmail != null) {
            User admin = userRepository.findByEmail(actorEmail).orElse(null);
            Course c = courseRepository.findById(courseId).orElse(null);
            if (admin != null && c != null) {
                auditLogService.log(
                        admin,
                        AuditAction.COURSE_REJECTED,
                        "COURSE",
                        c.getId(),
                        c.getTitle(),
                        reason != null ? "Từ chối khóa học: " + reason : "Từ chối khóa học",
                        c.getInstructor()
                );
            }
        }
        return res;
    }

    public CourseResponse mapToResponse(Course c) {
        if (c == null) {
            return null;
        }
        long enrolledCount = (enrollmentRepository != null && c.getId() != null)
                ? enrollmentRepository.countByCourseId(c.getId())
                : 0L;

        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .slug(c.getSlug())
                .description(c.getDescription())
                .thumbnailUrl(c.getThumbnailUrl())
                .price(c.getPrice() != null ? c.getPrice() : java.math.BigDecimal.ZERO)
                .status(c.getStatus())
                .isDeleted(c.getIsDeleted())
                .deletedAt(c.getDeletedAt())
                .rejectionReason(c.getRejectionReason())
                .enrolledCount(enrolledCount)
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .categorySlug(c.getCategory() != null ? c.getCategory().getSlug() : null)
                .instructorId(c.getInstructor() != null ? c.getInstructor().getId() : null)
                .instructorName(c.getInstructor() != null ? c.getInstructor().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private Category resolveCategory(Long categoryId, String customCategoryName) {
        if (customCategoryName != null && !customCategoryName.trim().isEmpty()) {
            String catName = customCategoryName.trim();
            return categoryRepository.findByNameIgnoreCase(catName)
                    .orElseGet(() -> {
                        String slug = com.lms.lms_backend.util.SlugUtils.toSlug(catName);
                        if (slug.isBlank()) {
                            slug = "danh-muc-" + System.currentTimeMillis();
                        } else if (categoryRepository.existsBySlug(slug)) {
                            slug = slug + "-" + (System.currentTimeMillis() % 10000);
                        }
                        Category newCat = Category.builder()
                                .name(catName)
                                .slug(slug)
                                .description("Danh mục " + catName)
                                .build();
                        return categoryRepository.save(newCat);
                    });
        }
        if (categoryId != null) {
            return categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + categoryId));
        }
        return null;
    }
}
