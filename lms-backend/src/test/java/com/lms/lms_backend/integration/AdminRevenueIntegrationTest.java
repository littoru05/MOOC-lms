package com.lms.lms_backend.integration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.admin.revenue.AdminRevenueChartPointResponse;
import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryResponse;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueResponse;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingResponse;
import com.lms.lms_backend.dto.admin.revenue.TopCourseResponse;
import com.lms.lms_backend.dto.admin.revenue.UserGrowthPointResponse;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Order;
import com.lms.lms_backend.entity.OrderItem;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CategoryRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.OrderItemRepository;
import com.lms.lms_backend.repository.OrderRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.AdminRevenueService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdminRevenueIntegrationTest {

    @Autowired
    private AdminRevenueService adminRevenueService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    private User instructorA;
    private User instructorB;
    private User student1;
    private User student2;
    private Category catWeb;
    private Category catAI;
    private Course course1;
    private Course course2;

    @BeforeEach
    void setUp() {
        catWeb = categoryRepository.save(Category.builder()
                .name("Lập trình Web")
                .slug("lap-trinh-web-" + System.currentTimeMillis())
                .build());

        catAI = categoryRepository.save(Category.builder()
                .name("Trí tuệ nhân tạo")
                .slug("tri-tue-nhan-tao-" + System.currentTimeMillis())
                .build());

        instructorA = userRepository.save(User.builder()
                .email("admin_test_instA@lms.com")
                .password("hashed_pass")
                .fullName("Giảng viên A")
                .role(Role.ROLE_INSTRUCTOR)
                .build());

        instructorB = userRepository.save(User.builder()
                .email("admin_test_instB@lms.com")
                .password("hashed_pass")
                .fullName("Giảng viên B")
                .role(Role.ROLE_INSTRUCTOR)
                .build());

        student1 = userRepository.save(User.builder()
                .email("admin_test_stu1@lms.com")
                .password("hashed_pass")
                .fullName("Học viên 1")
                .role(Role.ROLE_STUDENT)
                .build());

        student2 = userRepository.save(User.builder()
                .email("admin_test_stu2@lms.com")
                .password("hashed_pass")
                .fullName("Học viên 2")
                .role(Role.ROLE_STUDENT)
                .build());

        course1 = courseRepository.save(Course.builder()
                .title("Khóa học Fullstack Web")
                .slug("khoa-hoc-fullstack-web-" + System.currentTimeMillis())
                .price(new BigDecimal("1000000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructorA)
                .category(catWeb)
                .build());

        course2 = courseRepository.save(Course.builder()
                .title("Khóa học Machine Learning")
                .slug("khoa-hoc-machine-learning-" + System.currentTimeMillis())
                .price(new BigDecimal("2000000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructorB)
                .category(catAI)
                .build());

        // Order 1: Student 1 buys course1 (1,000,000)
        Order order1 = orderRepository.save(Order.builder()
                .orderCode("ORD-ADM-1")
                .user(student1)
                .totalAmount(new BigDecimal("1000000"))
                .status(OrderStatus.COMPLETED)
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now().minusDays(1))
                .paidAt(LocalDateTime.now().minusDays(1))
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order1)
                .course(course1)
                .price(new BigDecimal("1000000"))
                .build());

        // Order 2: Student 2 buys course1 and course2 (3,000,000)
        Order order2 = orderRepository.save(Order.builder()
                .orderCode("ORD-ADM-2")
                .user(student2)
                .totalAmount(new BigDecimal("3000000"))
                .status(OrderStatus.COMPLETED)
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now())
                .paidAt(LocalDateTime.now())
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order2)
                .course(course1)
                .price(new BigDecimal("1000000"))
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order2)
                .course(course2)
                .price(new BigDecimal("2000000"))
                .build());
    }

    @Test
    @DisplayName("Admin Tích hợp: Thống kê tổng quan toàn sàn")
    void testGetOverviewIntegration() {
        AdminRevenueSummaryResponse overview = adminRevenueService.getOverview();

        assertNotNull(overview);
        // Total gross: 1,000,000 + 1,000,000 + 2,000,000 = 4,000,000
        assertEquals(new BigDecimal("4000000"), overview.getTotalGrossRevenue());
        // Platform commission (20%): 800,000
        assertEquals(new BigDecimal("800000"), overview.getTotalPlatformCommission());
        // Instructor payout (80%): 3,200,000
        assertEquals(new BigDecimal("3200000"), overview.getTotalInstructorPayout());
        assertEquals(2L, overview.getTotalOrdersCount());
        assertEquals(2L, overview.getTotalStudentsCount());
    }

    @Test
    @DisplayName("Admin Tích hợp: Biểu đồ doanh thu toàn sàn")
    void testGetChartDataIntegration() {
        List<AdminRevenueChartPointResponse> chart = adminRevenueService.getChartData("month", null, null);

        assertNotNull(chart);
        assertFalse(chart.isEmpty());
        AdminRevenueChartPointResponse point = chart.get(0);
        assertEquals(new BigDecimal("4000000"), point.getGrossRevenue());
        assertEquals(new BigDecimal("800000"), point.getPlatformCommission());
        assertEquals(new BigDecimal("3200000"), point.getInstructorPayout());
    }

    @Test
    @DisplayName("Admin Tích hợp: Xếp hạng doanh thu giảng viên")
    void testGetInstructorRankingsIntegration() {
        List<InstructorRankingResponse> rankings = adminRevenueService.getInstructorRanking();

        assertNotNull(rankings);
        assertFalse(rankings.isEmpty());
        // Instructor A: 2 sold * 1,000,000 * 0.8 = 1,600,000 net, 2,000,000 gross
        // Instructor B: 1 sold * 2,000,000 * 0.8 = 1,600,000 net, 2,000,000 gross
        assertEquals(2, rankings.size());
    }

    @Test
    @DisplayName("Admin Tích hợp: Top khóa học bán chạy")
    void testGetTopCoursesIntegration() {
        List<TopCourseResponse> topCourses = adminRevenueService.getTopCourses(10);

        assertNotNull(topCourses);
        assertEquals(2, topCourses.size());

        // Both generated 2,000,000 gross, course1 sold 2, course2 sold 1
        TopCourseResponse first = topCourses.get(0);
        assertEquals(new BigDecimal("2000000"), first.getTotalRevenue());
    }

    @Test
    @DisplayName("Admin Tích hợp: Phân bổ doanh thu theo danh mục")
    void testGetCategoryRevenueIntegration() {
        List<CategoryRevenueResponse> categories = adminRevenueService.getCategoryRevenue();

        assertNotNull(categories);
        assertEquals(2, categories.size());
    }

    @Test
    @DisplayName("Admin Tích hợp: Tăng trưởng người dùng")
    void testGetUserGrowthIntegration() {
        List<UserGrowthPointResponse> growth = adminRevenueService.getUserGrowth("month");

        assertNotNull(growth);
        assertFalse(growth.isEmpty());
    }
}
