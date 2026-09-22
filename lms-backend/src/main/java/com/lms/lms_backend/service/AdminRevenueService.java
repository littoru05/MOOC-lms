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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.admin.revenue.AdminRevenueChartPointResponse;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryRawDto;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryResponse;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueResponse;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingResponse;
import com.lms.lms_backend.dto.admin.revenue.TopCourseResponse;
import com.lms.lms_backend.dto.admin.revenue.UserGrowthPointResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartRawDto;
import com.lms.lms_backend.repository.AdminRevenueRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminRevenueService {

    private final AdminRevenueRepository adminRevenueRepository;
    private final UserRepository userRepository;

    @Value("${app.platform.commission-rate:0.20}")
    private BigDecimal platformCommissionRate;

    public AdminRevenueSummaryResponse getOverview() {
        AdminRevenueSummaryRawDto raw = adminRevenueRepository.getAdminRevenueSummary();

        BigDecimal grossRevenue = raw != null && raw.getTotalGrossRevenue() != null ? raw.getTotalGrossRevenue() : BigDecimal.ZERO;
        Long totalOrders = raw != null && raw.getTotalOrdersCount() != null ? raw.getTotalOrdersCount() : 0L;
        Long totalStudents = raw != null && raw.getTotalStudentsCount() != null ? raw.getTotalStudentsCount() : 0L;

        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");
        BigDecimal platformCommission = grossRevenue.multiply(commissionRate).setScale(0, RoundingMode.HALF_UP);
        BigDecimal instructorPayout = grossRevenue.subtract(platformCommission);

        return AdminRevenueSummaryResponse.builder()
                .totalGrossRevenue(grossRevenue)
                .totalPlatformCommission(platformCommission)
                .totalInstructorPayout(instructorPayout)
                .totalOrdersCount(totalOrders)
                .totalStudentsCount(totalStudents)
                .platformCommissionRate(commissionRate)
                .build();
    }

    public List<AdminRevenueChartPointResponse> getChartData(String groupBy, LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.atTime(LocalTime.MAX) : null;

        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");

        String normGroupBy = groupBy != null ? groupBy.trim().toLowerCase() : "month";
        List<RevenueChartRawDto> rawList;

        switch (normGroupBy) {
            case "day":
                rawList = adminRevenueRepository.getAdminDailyRevenueChartData(fromDateTime, toDateTime);
                break;
            case "year":
                rawList = adminRevenueRepository.getAdminYearlyRevenueChartData(fromDateTime, toDateTime);
                break;
            case "month":
            default:
                rawList = adminRevenueRepository.getAdminMonthlyRevenueChartData(fromDateTime, toDateTime);
                break;
        }

        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        return rawList.stream().map(raw -> {
            String period;
            if ("day".equals(normGroupBy)) {
                period = String.format("%04d-%02d-%02d", raw.getYear(), raw.getMonth(), raw.getDay());
            } else if ("year".equals(normGroupBy)) {
                period = String.format("%04d", raw.getYear());
            } else {
                period = String.format("%04d-%02d", raw.getYear(), raw.getMonth());
            }

            BigDecimal gross = raw.getGrossRevenue() != null ? raw.getGrossRevenue() : BigDecimal.ZERO;
            BigDecimal commission = gross.multiply(commissionRate).setScale(0, RoundingMode.HALF_UP);
            BigDecimal payout = gross.subtract(commission);

            return AdminRevenueChartPointResponse.builder()
                    .period(period)
                    .grossRevenue(gross)
                    .platformCommission(commission)
                    .instructorPayout(payout)
                    .ordersCount(raw.getOrdersCount() != null ? raw.getOrdersCount() : 0L)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<InstructorRankingResponse> getInstructorRanking() {
        BigDecimal commissionRate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.20");
        BigDecimal netFactor = BigDecimal.ONE.subtract(commissionRate);

        return adminRevenueRepository.getInstructorRevenueRanking().stream().map(raw -> {
            BigDecimal gross = raw.getTotalGrossRevenue() != null ? raw.getTotalGrossRevenue() : BigDecimal.ZERO;
            BigDecimal net = gross.multiply(netFactor).setScale(0, RoundingMode.HALF_UP);

            return InstructorRankingResponse.builder()
                    .instructorId(raw.getInstructorId())
                    .instructorName(raw.getInstructorName())
                    .avatarUrl(raw.getAvatarUrl())
                    .totalGrossRevenue(gross)
                    .totalRevenue(net)
                    .coursesSoldCount(raw.getCoursesSoldCount() != null ? raw.getCoursesSoldCount() : 0L)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<TopCourseResponse> getTopCourses(int limit) {
        int pageSize = limit > 0 ? limit : 10;
        return adminRevenueRepository.getTopCoursesRevenue(PageRequest.of(0, pageSize)).stream().map(raw ->
            TopCourseResponse.builder()
                    .courseId(raw.getCourseId())
                    .title(raw.getTitle())
                    .thumbnailUrl(raw.getThumbnailUrl())
                    .instructorName(raw.getInstructorName())
                    .totalSold(raw.getTotalSold() != null ? raw.getTotalSold() : 0L)
                    .totalRevenue(raw.getTotalRevenue() != null ? raw.getTotalRevenue() : BigDecimal.ZERO)
                    .build()
        ).collect(Collectors.toList());
    }

    public List<CategoryRevenueResponse> getCategoryRevenue() {
        return adminRevenueRepository.getCategoryRevenue().stream().map(raw ->
            CategoryRevenueResponse.builder()
                    .categoryId(raw.getCategoryId())
                    .categoryName(raw.getCategoryName())
                    .totalRevenue(raw.getTotalRevenue() != null ? raw.getTotalRevenue() : BigDecimal.ZERO)
                    .coursesSoldCount(raw.getCoursesSoldCount() != null ? raw.getCoursesSoldCount() : 0L)
                    .build()
        ).collect(Collectors.toList());
    }

    public List<UserGrowthPointResponse> getUserGrowth(String groupBy) {
        String normGroupBy = groupBy != null ? groupBy.trim().toLowerCase() : "month";
        List<Object[]> rawList;

        switch (normGroupBy) {
            case "day":
                rawList = userRepository.getDailyUserGrowth();
                break;
            case "year":
                rawList = userRepository.getYearlyUserGrowth();
                break;
            case "month":
            default:
                rawList = userRepository.getMonthlyUserGrowth();
                break;
        }

        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        return rawList.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            Integer day = ((Number) row[2]).intValue();
            Long count = ((Number) row[3]).longValue();

            String period;
            if ("day".equals(normGroupBy)) {
                period = String.format("%04d-%02d-%02d", year, month, day);
            } else if ("year".equals(normGroupBy)) {
                period = String.format("%04d", year);
            } else {
                period = String.format("%04d-%02d", year, month);
            }

            return UserGrowthPointResponse.builder()
                    .period(period)
                    .newStudentsCount(count)
                    .build();
        }).collect(Collectors.toList());
    }
}
