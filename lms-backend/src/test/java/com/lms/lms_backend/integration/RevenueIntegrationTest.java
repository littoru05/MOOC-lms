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

import com.lms.lms_backend.dto.revenue.CourseRevenueResponse;
import com.lms.lms_backend.dto.revenue.InstructorRevenueSummaryResponse;
import com.lms.lms_backend.dto.revenue.RevenueChartPointResponse;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Order;
import com.lms.lms_backend.entity.OrderItem;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.OrderItemRepository;
import com.lms.lms_backend.repository.OrderRepository;
import com.lms.lms_backend.repository.UserRepository;
import com.lms.lms_backend.service.RevenueService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RevenueIntegrationTest {

    @Autowired
    private RevenueService revenueService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    private User instructor;
    private User student1;
    private User student2;
    private Course courseA;
    private Course courseB;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(User.builder()
                .email("rev_instructor@lms.com")
                .password("hashed_pass")
                .fullName("Giang Vien Rev")
                .role(Role.ROLE_INSTRUCTOR)
                .build());

        student1 = userRepository.save(User.builder()
                .email("rev_student1@lms.com")
                .password("hashed_pass")
                .fullName("Hoc Vien 1")
                .role(Role.ROLE_STUDENT)
                .build());

        student2 = userRepository.save(User.builder()
                .email("rev_student2@lms.com")
                .password("hashed_pass")
                .fullName("Hoc Vien 2")
                .role(Role.ROLE_STUDENT)
                .build());

        courseA = courseRepository.save(Course.builder()
                .title("Khoa hoc Spring Boot")
                .slug("khoa-hoc-spring-boot-" + System.currentTimeMillis())
                .price(new BigDecimal("1000000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .build());

        courseB = courseRepository.save(Course.builder()
                .title("Khoa hoc React JS")
                .slug("khoa-hoc-react-js-" + System.currentTimeMillis())
                .price(new BigDecimal("500000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .build());

        // Order 1: student1 buys courseA (COMPLETED)
        Order order1 = orderRepository.save(Order.builder()
                .orderCode("ORD-REV-1")
                .user(student1)
                .totalAmount(new BigDecimal("1000000"))
                .status(OrderStatus.COMPLETED)
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now().minusDays(1))
                .paidAt(LocalDateTime.now().minusDays(1))
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order1)
                .course(courseA)
                .price(new BigDecimal("1000000"))
                .build());

        // Order 2: student2 buys courseA and courseB (COMPLETED)
        Order order2 = orderRepository.save(Order.builder()
                .orderCode("ORD-REV-2")
                .user(student2)
                .totalAmount(new BigDecimal("1500000"))
                .status(OrderStatus.COMPLETED)
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now())
                .paidAt(LocalDateTime.now())
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order2)
                .course(courseA)
                .price(new BigDecimal("1000000"))
                .build());

        orderItemRepository.save(OrderItem.builder()
                .order(order2)
                .course(courseB)
                .price(new BigDecimal("500000"))
                .build());
    }

    @Test
    @DisplayName("Tích hợp tính toán tóm tắt doanh thu thực tế qua JPQL")
    void testGetSummaryIntegration() {
        InstructorRevenueSummaryResponse summary = revenueService.getSummary("rev_instructor@lms.com");

        assertNotNull(summary);
        assertEquals(3L, summary.getTotalCoursesSold()); // 2 for courseA + 1 for courseB
        assertEquals(2L, summary.getTotalStudentsCount()); // student1 and student2
        // net = 2,500,000 * 0.8 = 2,000,000
        assertEquals(new BigDecimal("2000000"), summary.getTotalNetRevenue());
    }

    @Test
    @DisplayName("Tích hợp biểu đồ doanh thu theo tháng")
    void testGetChartDataIntegration() {
        List<RevenueChartPointResponse> chart = revenueService.getChartData("rev_instructor@lms.com", "month", null, null);

        assertNotNull(chart);
        assertFalse(chart.isEmpty());
        RevenueChartPointResponse point = chart.get(0);
        assertEquals(new BigDecimal("2000000"), point.getNetRevenue());
        assertEquals(3L, point.getOrdersCount());
    }

    @Test
    @DisplayName("Tích hợp thống kê doanh thu theo từng khóa học")
    void testGetCourseRevenueIntegration() {
        List<CourseRevenueResponse> courses = revenueService.getCourseRevenue("rev_instructor@lms.com");

        assertNotNull(courses);
        assertEquals(2, courses.size());

        // Khóa A: 2 lượt bán, net 1,600,000
        CourseRevenueResponse first = courses.get(0);
        assertEquals(courseA.getId(), first.getCourseId());
        assertEquals(2L, first.getTotalSold());
        assertEquals(new BigDecimal("1600000"), first.getNetRevenue());

        // Khóa B: 1 lượt bán, net 400,000
        CourseRevenueResponse second = courses.get(1);
        assertEquals(courseB.getId(), second.getCourseId());
        assertEquals(1L, second.getTotalSold());
        assertEquals(new BigDecimal("400000"), second.getNetRevenue());
    }
}
