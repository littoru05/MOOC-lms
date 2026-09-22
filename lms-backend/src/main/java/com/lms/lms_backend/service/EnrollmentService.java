package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.course.CourseResponse;
import com.lms.lms_backend.dto.enrollment.EnrollmentResponse;
import com.lms.lms_backend.dto.instructor.CourseStudentProgressResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Enrollment;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CertificateRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.LessonProgressRepository;
import com.lms.lms_backend.repository.LessonRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CertificateRepository certificateRepository;

    @Transactional
    public EnrollmentResponse enrollCourse(String userEmail, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new RuntimeException("Khóa học chưa được công khai/xuất bản!");
        }

        if (course.getPrice() != null && course.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Khóa học có phí, vui lòng thêm vào giỏ hàng và thanh toán trước khi ghi danh.");
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Bạn đã đăng ký khóa học này rồi!");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .progressPercent(BigDecimal.ZERO)
                .isCompleted(false)
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    @Transactional
    public Enrollment enrollCourseFromOrder(User user, Course course) {
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            return enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(user.getId()).stream()
                    .filter(e -> e.getCourse().getId().equals(course.getId()))
                    .findFirst()
                    .orElse(null);
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .progressPercent(BigDecimal.ZERO)
                .isCompleted(false)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    public List<EnrollmentResponse> getMyEnrollments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        return enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public boolean isEnrolled(String userEmail, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        return enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);
    }

    public Enrollment getEnrollmentEntityById(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin ghi danh với ID: " + id));
    }

    public EnrollmentResponse mapToResponse(Enrollment e) {
        CourseResponse courseRes = courseService.mapToResponse(e.getCourse());

        return EnrollmentResponse.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .courseId(e.getCourse().getId())
                .course(courseRes)
                .progressPercent(e.getProgressPercent())
                .isCompleted(e.getIsCompleted())
                .enrolledAt(e.getEnrolledAt())
                .build();
    }

    public List<CourseStudentProgressResponse> getCourseStudentProgress(String userEmail, Long courseId) {
        User instructor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại!"));

        boolean isAdmin = instructor.getRole() == Role.ROLE_ADMIN;
        if (!course.getInstructor().getId().equals(instructor.getId()) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xem tiến độ của khóa học này!");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdWithUserAndCourse(courseId);
        if (enrollments.isEmpty()) {
            return List.of();
        }

        return mapToStudentProgressResponses(enrollments);
    }

    public List<CourseStudentProgressResponse> getAllCoursesStudentProgress(String userEmail) {
        User instructor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        List<Enrollment> enrollments = enrollmentRepository.findByInstructorIdWithUserAndCourse(instructor.getId());
        if (enrollments.isEmpty()) {
            return List.of();
        }

        return mapToStudentProgressResponses(enrollments);
    }

    private List<CourseStudentProgressResponse> mapToStudentProgressResponses(List<Enrollment> enrollments) {
        List<Long> enrollmentIds = enrollments.stream().map(Enrollment::getId).toList();

        // Map of enrollmentId -> completed lessons count
        Map<Long, Long> completedLessonsMap = new HashMap<>();
        List<Object[]> completedCounts = lessonProgressRepository.countCompletedLessonsByEnrollmentIds(enrollmentIds);
        for (Object[] row : completedCounts) {
            Long eid = (Long) row[0];
            Long count = (Long) row[1];
            completedLessonsMap.put(eid, count);
        }

        // Map of enrollmentId -> quizScore
        Map<Long, Integer> quizScoreMap = new HashMap<>();
        List<Object[]> scores = certificateRepository.findFinalScoresByEnrollmentIds(enrollmentIds);
        for (Object[] row : scores) {
            Long eid = (Long) row[0];
            Integer score = (Integer) row[1];
            quizScoreMap.put(eid, score);
        }

        // Cache total lessons per courseId to avoid repeated queries
        Map<Long, Long> totalLessonsPerCourse = new HashMap<>();

        return enrollments.stream().map(e -> {
            Long cId = e.getCourse().getId();
            Long totalLessons = totalLessonsPerCourse.computeIfAbsent(cId, lessonRepository::countByCourseId);
            Long completedLessons = completedLessonsMap.getOrDefault(e.getId(), 0L);
            Integer quizScore = quizScoreMap.get(e.getId());

            return CourseStudentProgressResponse.builder()
                    .enrollmentId(e.getId())
                    .userId(e.getUser().getId())
                    .fullName(e.getUser().getFullName())
                    .email(e.getUser().getEmail())
                    .avatarUrl(e.getUser().getAvatarUrl())
                    .courseId(cId)
                    .courseTitle(e.getCourse().getTitle())
                    .enrolledAt(e.getEnrolledAt())
                    .progressPercent(e.getProgressPercent())
                    .isCompleted(e.getIsCompleted())
                    .completedLessonsCount(completedLessons)
                    .totalLessonsCount(totalLessons)
                    .quizScore(quizScore)
                    .build();
        }).collect(Collectors.toList());
    }
}
