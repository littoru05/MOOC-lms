package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import com.lms.lms_backend.dto.admin.revenue.AdminRevenueChartPointResponse;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryRawDto;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryResponse;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueRawDto;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueResponse;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingRawDto;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingResponse;
import com.lms.lms_backend.dto.admin.revenue.TopCourseRawDto;
import com.lms.lms_backend.dto.admin.revenue.TopCourseResponse;
import com.lms.lms_backend.dto.admin.revenue.UserGrowthPointResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartRawDto;
import com.lms.lms_backend.repository.AdminRevenueRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminRevenueServiceTest {

    @Mock
    private AdminRevenueRepository adminRevenueRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminRevenueService adminRevenueService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminRevenueService, "platformCommissionRate", new BigDecimal("0.20"));
    }

    @Test
    @DisplayName("Admin Tổng quan Doanh thu: tính đúng doanh thu gộp, hoa hồng sàn 20%, chi trả giảng viên 80%")
    void getOverview_Success() {
        AdminRevenueSummaryRawDto raw = new AdminRevenueSummaryRawDto(
                new BigDecimal("10000000"), // 10 triệu
                15L, // 15 đơn hàng
                12L  // 12 học viên
        );

        when(adminRevenueRepository.getAdminRevenueSummary()).thenReturn(raw);

        AdminRevenueSummaryResponse response = adminRevenueService.getOverview();

        assertNotNull(response);
        assertEquals(new BigDecimal("10000000"), response.getTotalGrossRevenue());
        assertEquals(new BigDecimal("2000000"), response.getTotalPlatformCommission()); // 20%
        assertEquals(new BigDecimal("8000000"), response.getTotalInstructorPayout()); // 80%
        assertEquals(15L, response.getTotalOrdersCount());
        assertEquals(12L, response.getTotalStudentsCount());
        assertEquals(new BigDecimal("0.20"), response.getPlatformCommissionRate());
    }

    @Test
    @DisplayName("Biểu đồ doanh thu Admin theo tháng: tính đúng hoa hồng và chi trả theo từng mốc thời gian")
    void getChartData_Monthly_Success() {
        List<RevenueChartRawDto> rawPoints = List.of(
                new RevenueChartRawDto(2026, 8, 1, new BigDecimal("5000000"), 8L),
                new RevenueChartRawDto(2026, 9, 1, new BigDecimal("8000000"), 12L)
        );

        when(adminRevenueRepository.getAdminMonthlyRevenueChartData(any(), any())).thenReturn(rawPoints);

        List<AdminRevenueChartPointResponse> result = adminRevenueService.getChartData(
                "month", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 9, 30)
        );

        assertNotNull(result);
        assertEquals(2, result.size());

        AdminRevenueChartPointResponse p1 = result.get(0);
        assertEquals("2026-08", p1.getPeriod());
        assertEquals(new BigDecimal("5000000"), p1.getGrossRevenue());
        assertEquals(new BigDecimal("1000000"), p1.getPlatformCommission());
        assertEquals(new BigDecimal("4000000"), p1.getInstructorPayout());
        assertEquals(8L, p1.getOrdersCount());

        AdminRevenueChartPointResponse p2 = result.get(1);
        assertEquals("2026-09", p2.getPeriod());
        assertEquals(new BigDecimal("8000000"), p2.getGrossRevenue());
        assertEquals(new BigDecimal("1600000"), p2.getPlatformCommission());
        assertEquals(new BigDecimal("6400000"), p2.getInstructorPayout());
        assertEquals(12L, p2.getOrdersCount());
    }

    @Test
    @DisplayName("Xếp hạng Giảng viên theo Doanh thu: tính đúng doanh thu thực nhận và sắp xếp theo doanh thu")
    void getInstructorRanking_Success() {
        List<InstructorRankingRawDto> rawRankings = List.of(
                new InstructorRankingRawDto(1L, "TS. Nam", "avatar1.png", new BigDecimal("10000000"), 20L),
                new InstructorRankingRawDto(2L, "ThS. Hoa", "avatar2.png", new BigDecimal("5000000"), 10L)
        );

        when(adminRevenueRepository.getInstructorRevenueRanking()).thenReturn(rawRankings);

        List<InstructorRankingResponse> result = adminRevenueService.getInstructorRanking();

        assertNotNull(result);
        assertEquals(2, result.size());

        InstructorRankingResponse r1 = result.get(0);
        assertEquals(1L, r1.getInstructorId());
        assertEquals("TS. Nam", r1.getInstructorName());
        assertEquals(new BigDecimal("10000000"), r1.getTotalGrossRevenue());
        assertEquals(new BigDecimal("8000000"), r1.getTotalRevenue()); // 80% net
        assertEquals(20L, r1.getCoursesSoldCount());

        InstructorRankingResponse r2 = result.get(1);
        assertEquals(2L, r2.getInstructorId());
        assertEquals("ThS. Hoa", r2.getInstructorName());
        assertEquals(new BigDecimal("5000000"), r2.getTotalGrossRevenue());
        assertEquals(new BigDecimal("4000000"), r2.getTotalRevenue());
        assertEquals(10L, r2.getCoursesSoldCount());
    }

    @Test
    @DisplayName("Top khóa học bán chạy nhất: trả về đúng số lượng khóa học theo limit")
    void getTopCourses_Success() {
        List<TopCourseRawDto> rawCourses = List.of(
                new TopCourseRawDto(101L, "Spring Boot 3", "thumb1.jpg", "TS. Nam", 15L, new BigDecimal("7500000")),
                new TopCourseRawDto(102L, "React 19", "thumb2.jpg", "ThS. Hoa", 10L, new BigDecimal("5000000"))
        );

        when(adminRevenueRepository.getTopCoursesRevenue(PageRequest.of(0, 10))).thenReturn(rawCourses);

        List<TopCourseResponse> result = adminRevenueService.getTopCourses(10);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(101L, result.get(0).getCourseId());
        assertEquals("Spring Boot 3", result.get(0).getTitle());
        assertEquals(15L, result.get(0).getTotalSold());
        assertEquals(new BigDecimal("7500000"), result.get(0).getTotalRevenue());
    }

    @Test
    @DisplayName("Doanh thu theo danh mục: gom nhóm và tính đúng doanh thu từng danh mục")
    void getCategoryRevenue_Success() {
        List<CategoryRevenueRawDto> rawCategories = List.of(
                new CategoryRevenueRawDto(1L, "Lập trình Web", new BigDecimal("12000000"), 25L),
                new CategoryRevenueRawDto(2L, "Trí tuệ nhân tạo", new BigDecimal("8000000"), 15L)
        );

        when(adminRevenueRepository.getCategoryRevenue()).thenReturn(rawCategories);

        List<CategoryRevenueResponse> result = adminRevenueService.getCategoryRevenue();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Lập trình Web", result.get(0).getCategoryName());
        assertEquals(new BigDecimal("12000000"), result.get(0).getTotalRevenue());
        assertEquals(25L, result.get(0).getCoursesSoldCount());
    }

    @Test
    @DisplayName("Tăng trưởng học viên mới: gom nhóm số học viên mới theo tháng")
    void getUserGrowth_Success() {
        List<Object[]> rawGrowth = List.of(
                new Object[]{2026, 8, 1, 20L},
                new Object[]{2026, 9, 1, 35L}
        );

        when(userRepository.getMonthlyUserGrowth()).thenReturn(rawGrowth);

        List<UserGrowthPointResponse> result = adminRevenueService.getUserGrowth("month");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("2026-08", result.get(0).getPeriod());
        assertEquals(20L, result.get(0).getNewStudentsCount());
        assertEquals("2026-09", result.get(1).getPeriod());
        assertEquals(35L, result.get(1).getNewStudentsCount());
    }
}
