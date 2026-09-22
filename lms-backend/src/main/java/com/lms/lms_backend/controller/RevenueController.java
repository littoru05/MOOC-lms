package com.lms.lms_backend.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms_backend.dto.revenue.CourseRevenueResponse;
import com.lms.lms_backend.dto.revenue.InstructorRevenueSummaryResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartPointResponse;
import com.lms.lms_backend.service.RevenueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/v1/instructor/revenue", "/api/instructor/revenue"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR', 'INSTRUCTOR', 'ROLE_ADMIN', 'ADMIN')")
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/summary")
    public ResponseEntity<InstructorRevenueSummaryResponse> getSummary(Principal principal) {
        return ResponseEntity.ok(revenueService.getSummary(principal.getName()));
    }

    @GetMapping("/chart")
    public ResponseEntity<List<RevenueChartPointResponse>> getChartData(
            @RequestParam(name = "groupBy", defaultValue = "month") String groupBy,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Principal principal
    ) {
        return ResponseEntity.ok(revenueService.getChartData(principal.getName(), groupBy, from, to));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseRevenueResponse>> getCourseRevenue(Principal principal) {
        return ResponseEntity.ok(revenueService.getCourseRevenue(principal.getName()));
    }
}
