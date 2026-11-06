package com.lms.lms_backend.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.lms.lms_backend.entity.CertificateStatus;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDetailResponse {

    private Long id;
    private String username;
    private String fullName;
    private String avatarUrl;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String title;
    private String bio;
    private String teachingField;

    // Masked sensitive information (email: a***@g***.com, phone, dob, gender)
    private String email;
    private String phone;
    private String dateOfBirth;
    private String gender;

    // Aggregated statistics for student / instructor
    private UserStatsResponse stats;

    // 5 most recent records
    private List<RecentEnrollmentItem> recentEnrollments;
    private List<RecentOrderItem> recentOrders;
    private List<RecentCertificateItem> recentCertificates;
    private List<RecentCourseItem> recentCourses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStatsResponse {
        // Student stats
        private long enrolledCoursesCount;
        private long completedCoursesCount;
        private long certificatesCount;
        private long ordersCount;
        private BigDecimal totalSpent;

        // Instructor stats
        private long totalCoursesCount;
        private long publishedCoursesCount;
        private long pendingCoursesCount;
        private long draftCoursesCount;
        private long archivedCoursesCount;
        private long totalStudentsCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentEnrollmentItem {
        private Long enrollmentId;
        private Long courseId;
        private String courseTitle;
        private LocalDateTime enrolledAt;
        private BigDecimal progressPercent;
        private Boolean isCompleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentOrderItem {
        private Long orderId;
        private String orderCode;
        private BigDecimal totalAmount;
        private OrderStatus status;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentCertificateItem {
        private Long certificateId;
        private String certificateCode;
        private String courseTitle;
        private LocalDateTime issuedAt;
        private CertificateStatus status;
        private Integer finalScore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentCourseItem {
        private Long courseId;
        private String title;
        private CourseStatus status;
        private BigDecimal price;
        private LocalDateTime createdAt;
        private long enrolledCount;
    }
}

