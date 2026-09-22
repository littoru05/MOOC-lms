package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lms.lms_backend.dto.revenue.CourseRevenueRawDto;
import com.lms.lms_backend.dto.revenue.CourseRevenueResponse;
import com.lms.lms_backend.dto.revenue.InstructorRevenueSummaryResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartPointResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartRawDto;
import com.lms.lms_backend.dto.revenue.RevenueSummaryRawDto;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.OrderItemRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RevenueServiceTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RevenueService revenueService;

    private User instructor;

    @BeforeEach
    void setUp() {
        instructor = User.builder()
                .id(10L)
                .email("instructor@lms.com")
                .fullName("TS. Nguyen Van A")
                .role(Role.ROLE_INSTRUCTOR)
                .build();
    }

    @Test
    @DisplayName("Lấy tổng quan doanh thu: Tính chính xác thu nhập thực nhận = tổng gộp * (1 - hoa hồng)")
    void getSummary_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        RevenueSummaryRawDto raw = new RevenueSummaryRawDto(
                15L,
                new BigDecimal("10000000"), // 10,000,000 VND
                12L
        );
        when(orderItemRepository.getRevenueSummaryByInstructor(10L)).thenReturn(raw);

        InstructorRevenueSummaryResponse summary = revenueService.getSummary("instructor@lms.com");

        assertNotNull(summary);
        assertEquals(15L, summary.getTotalCoursesSold());
        // 10,000,000 * (1 - 0.20) = 8,000,000 VND
        assertEquals(new BigDecimal("8000000"), summary.getTotalNetRevenue());
        assertEquals(new BigDecimal("0.20"), summary.getPlatformCommissionRate());
        assertEquals(12L, summary.getTotalStudentsCount());
    }

    @Test
    @DisplayName("Lấy tổng quan doanh thu khi chưa bán được khóa học nào: Trả về số liệu 0 an toàn")
    void getSummary_ZeroSales_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));
        when(orderItemRepository.getRevenueSummaryByInstructor(10L)).thenReturn(new RevenueSummaryRawDto(0L, BigDecimal.ZERO, 0L));

        InstructorRevenueSummaryResponse summary = revenueService.getSummary("instructor@lms.com");

        assertNotNull(summary);
        assertEquals(0L, summary.getTotalCoursesSold());
        assertEquals(BigDecimal.ZERO, summary.getTotalNetRevenue());
        assertEquals(0L, summary.getTotalStudentsCount());
    }

    @Test
    @DisplayName("Lấy dữ liệu biểu đồ theo Tháng: Format period yyyy-MM và tính thu nhập thực nhận")
    void getChartData_GroupByMonth_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        List<RevenueChartRawDto> rawPoints = List.of(
                new RevenueChartRawDto(2026, 8, 1, new BigDecimal("5000000"), 5L),
                new RevenueChartRawDto(2026, 9, 1, new BigDecimal("10000000"), 10L)
        );
        when(orderItemRepository.getMonthlyRevenueChartData(eq(10L), any(), any())).thenReturn(rawPoints);

        List<RevenueChartPointResponse> chart = revenueService.getChartData("instructor@lms.com", "month", null, null);

        assertNotNull(chart);
        assertEquals(2, chart.size());

        assertEquals("2026-08", chart.get(0).getPeriod());
        assertEquals(new BigDecimal("4000000"), chart.get(0).getNetRevenue());
        assertEquals(5L, chart.get(0).getOrdersCount());

        assertEquals("2026-09", chart.get(1).getPeriod());
        assertEquals(new BigDecimal("8000000"), chart.get(1).getNetRevenue());
    }

    @Test
    @DisplayName("Lấy dữ liệu biểu đồ theo Ngày: Format period yyyy-MM-dd")
    void getChartData_GroupByDay_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        List<RevenueChartRawDto> rawPoints = List.of(
                new RevenueChartRawDto(2026, 9, 18, new BigDecimal("2000000"), 2L)
        );
        when(orderItemRepository.getDailyRevenueChartData(eq(10L), any(), any())).thenReturn(rawPoints);

        List<RevenueChartPointResponse> chart = revenueService.getChartData("instructor@lms.com", "day", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 18));

        assertNotNull(chart);
        assertEquals(1, chart.size());
        assertEquals("2026-09-18", chart.get(0).getPeriod());
        assertEquals(new BigDecimal("1600000"), chart.get(0).getNetRevenue());
    }

    @Test
    @DisplayName("Lấy doanh thu theo từng khóa học: Tính thu nhập thực nhận cho mỗi khóa học")
    void getCourseRevenue_Success() {
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        List<CourseRevenueRawDto> rawCourses = List.of(
                new CourseRevenueRawDto(1L, "React Fullstack", "react-fullstack", "/thumb1.png", new BigDecimal("1000000"), 8L, new BigDecimal("8000000")),
                new CourseRevenueRawDto(2L, "Spring Boot Microservices", "spring-boot", "/thumb2.png", new BigDecimal("1200000"), 3L, new BigDecimal("3600000"))
        );
        when(orderItemRepository.getCourseRevenueByInstructor(10L)).thenReturn(rawCourses);

        List<CourseRevenueResponse> result = revenueService.getCourseRevenue("instructor@lms.com");

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("React Fullstack", result.get(0).getCourseTitle());
        assertEquals(new BigDecimal("6400000"), result.get(0).getNetRevenue());

        assertEquals("Spring Boot Microservices", result.get(1).getCourseTitle());
        assertEquals(new BigDecimal("2880000"), result.get(1).getNetRevenue());
    }

    @Test
    @DisplayName("Báo lỗi khi giảng viên không tồn tại trong hệ thống")
    void getSummary_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("notfound@lms.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> revenueService.getSummary("notfound@lms.com"));
    }
}
