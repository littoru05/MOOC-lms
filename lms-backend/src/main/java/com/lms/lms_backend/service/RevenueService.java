package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.revenue.CourseRevenueRawDto;
import com.lms.lms_backend.dto.revenue.CourseRevenueResponse;
import com.lms.lms_backend.dto.revenue.InstructorRevenueSummaryResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartPointResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartRawDto;
import com.lms.lms_backend.dto.revenue.RevenueSummaryRawDto;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.OrderItemRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RevenueService {

    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    @Value("${app.platform.commission-rate:0.20}")
    private BigDecimal platformCommissionRate;

    public InstructorRevenueSummaryResponse getSummary(String instructorEmail) {
        User instructor = getInstructor(instructorEmail);
        RevenueSummaryRawDto raw = orderItemRepository.getRevenueSummaryByInstructor(instructor.getId());

        Long totalSold = raw != null && raw.getTotalCoursesSold() != null ? raw.getTotalCoursesSold() : 0L;
        BigDecimal grossRevenue = raw != null && raw.getTotalGrossRevenue() != null ? raw.getTotalGrossRevenue() : BigDecimal.ZERO;
        Long totalStudents = raw != null && raw.getTotalStudentsCount() != null ? raw.getTotalStudentsCount() : 0L;

        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");
        BigDecimal netFactor = BigDecimal.ONE.subtract(commissionRate);
        BigDecimal netRevenue = grossRevenue.multiply(netFactor).setScale(0, RoundingMode.HALF_UP);

        return InstructorRevenueSummaryResponse.builder()
                .totalCoursesSold(totalSold)
                .totalNetRevenue(netRevenue)
                .platformCommissionRate(commissionRate)
                .totalStudentsCount(totalStudents)
                .build();
    }

    public List<RevenueChartPointResponse> getChartData(String instructorEmail, String groupBy, LocalDate from, LocalDate to) {
        User instructor = getInstructor(instructorEmail);

        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.atTime(LocalTime.MAX) : null;

        String normalizedGroupBy = groupBy != null ? groupBy.trim().toLowerCase() : "month";
        List<RevenueChartRawDto> rawList;

        switch (normalizedGroupBy) {
            case "day" -> rawList = orderItemRepository.getDailyRevenueChartData(instructor.getId(), fromDateTime, toDateTime);
            case "year" -> rawList = orderItemRepository.getYearlyRevenueChartData(instructor.getId(), fromDateTime, toDateTime);
            default -> {
                normalizedGroupBy = "month";
                rawList = orderItemRepository.getMonthlyRevenueChartData(instructor.getId(), fromDateTime, toDateTime);
            }
        }

        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");
        BigDecimal netFactor = BigDecimal.ONE.subtract(commissionRate);
        final String finalGroupBy = normalizedGroupBy;

        return rawList.stream().map(raw -> {
            String period;
            if ("day".equals(finalGroupBy)) {
                period = String.format("%04d-%02d-%02d", raw.getYear(), raw.getMonth(), raw.getDay());
            } else if ("year".equals(finalGroupBy)) {
                period = String.format("%04d", raw.getYear());
            } else {
                period = String.format("%04d-%02d", raw.getYear(), raw.getMonth());
            }

            BigDecimal gross = raw.getGrossRevenue() != null ? raw.getGrossRevenue() : BigDecimal.ZERO;
            BigDecimal net = gross.multiply(netFactor).setScale(0, RoundingMode.HALF_UP);

            return RevenueChartPointResponse.builder()
                    .period(period)
                    .netRevenue(net)
                    .ordersCount(raw.getOrdersCount() != null ? raw.getOrdersCount() : 0L)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<CourseRevenueResponse> getCourseRevenue(String instructorEmail) {
        User instructor = getInstructor(instructorEmail);
        List<CourseRevenueRawDto> rawList = orderItemRepository.getCourseRevenueByInstructor(instructor.getId());

        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");
        BigDecimal netFactor = BigDecimal.ONE.subtract(commissionRate);

        return rawList.stream().map(raw -> {
            BigDecimal gross = raw.getGrossRevenue() != null ? raw.getGrossRevenue() : BigDecimal.ZERO;
            BigDecimal net = gross.multiply(netFactor).setScale(0, RoundingMode.HALF_UP);

            return CourseRevenueResponse.builder()
                    .courseId(raw.getCourseId())
                    .courseTitle(raw.getCourseTitle())
                    .courseSlug(raw.getCourseSlug())
                    .thumbnailUrl(raw.getThumbnailUrl())
                    .coursePrice(raw.getCoursePrice())
                    .totalSold(raw.getTotalSold() != null ? raw.getTotalSold() : 0L)
                    .netRevenue(net)
                    .build();
        }).collect(Collectors.toList());
    }

    private User getInstructor(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin giảng viên: " + email));
    }
}
