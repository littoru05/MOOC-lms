package com.lms.lms_backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.admin.revenue.AdminRevenueChartPointResponse;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryResponse;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueResponse;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingResponse;
import com.lms.lms_backend.dto.admin.revenue.TopCourseResponse;
import com.lms.lms_backend.dto.admin.revenue.UserGrowthPointResponse;
import com.lms.lms_backend.service.AdminRevenueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/admin/revenue", "/api/admin/revenue"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
public class AdminRevenueController {

    private final AdminRevenueService adminRevenueService;

    @GetMapping("/overview")
    public ResponseEntity<AdminRevenueSummaryResponse> getOverview() {
        return ResponseEntity.ok(adminRevenueService.getOverview());
    }

    @GetMapping("/chart")
    public ResponseEntity<List<AdminRevenueChartPointResponse>> getChartData(
            @RequestParam(name = "groupBy", defaultValue = "month") String groupBy,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(adminRevenueService.getChartData(groupBy, from, to));
    }

    @GetMapping("/by-instructor")
    public ResponseEntity<List<InstructorRankingResponse>> getInstructorRanking() {
        return ResponseEntity.ok(adminRevenueService.getInstructorRanking());
    }

    @GetMapping("/top-courses")
    public ResponseEntity<List<TopCourseResponse>> getTopCourses(
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(adminRevenueService.getTopCourses(limit));
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<CategoryRevenueResponse>> getCategoryRevenue() {
        return ResponseEntity.ok(adminRevenueService.getCategoryRevenue());
    }

    @GetMapping("/growth/users")
    public ResponseEntity<List<UserGrowthPointResponse>> getUserGrowth(
            @RequestParam(name = "groupBy", defaultValue = "month") String groupBy
    ) {
        return ResponseEntity.ok(adminRevenueService.getUserGrowth(groupBy));
    }
}
