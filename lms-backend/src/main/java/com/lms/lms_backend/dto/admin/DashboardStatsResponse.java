package com.lms.lms_backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalInstructors;
    private long totalCourses;
    private long publishedCourses;
    private long pendingCourses;
    private long totalEnrollments;
    private long completedEnrollments;
    private double completionRate;
}
