package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.course.CourseCreateRequest;
import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.course.CourseUpdateRequest;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
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
        return courseRepository.findByStatus(CourseStatus.PUBLISHED).stream()
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
        return courseRepository.findByInstructorId(instructor.getId()).stream()
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

        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + req.getCategoryId()));
        }

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
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + req.getCategoryId()));
        }

        if (req.getPrice() != null) {
            if (req.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá khóa học không được âm!");
            }
            course.setPrice(req.getPrice());
        }

        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setThumbnailUrl(req.getThumbnailUrl());
        course.setCategory(category);

        return mapToResponse(courseRepository.save(course));
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
        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse approveCourse(Long courseId) {
        Course course = getCourseEntityById(courseId);
        course.setStatus(CourseStatus.PUBLISHED);
        return mapToResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse rejectCourse(Long courseId) {
        Course course = getCourseEntityById(courseId);
        course.setStatus(CourseStatus.REJECTED);
        return mapToResponse(courseRepository.save(course));
    }

    public CourseResponse mapToResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .slug(c.getSlug())
                .description(c.getDescription())
                .thumbnailUrl(c.getThumbnailUrl())
                .price(c.getPrice() != null ? c.getPrice() : java.math.BigDecimal.ZERO)
                .status(c.getStatus())
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .instructorId(c.getInstructor() != null ? c.getInstructor().getId() : null)
                .instructorName(c.getInstructor() != null ? c.getInstructor().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
