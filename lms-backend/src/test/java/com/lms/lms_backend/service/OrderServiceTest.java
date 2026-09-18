package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lms.lms_backend.dto.order.OrderResponse;
import com.lms.lms_backend.entity.CartItem;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Order;
import com.lms.lms_backend.entity.OrderItem;
import com.lms.lms_backend.entity.OrderStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CartItemRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.OrderItemRepository;
import com.lms.lms_backend.repository.OrderRepository;
import com.lms.lms_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentService enrollmentService;

    @InjectMocks
    private OrderService orderService;

    private User student;
    private Course course1;
    private Course course2;
    private CartItem cartItem1;
    private CartItem cartItem2;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Trần Văn Học Viên")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        course1 = Course.builder()
                .id(10L)
                .title("Khóa học Java Spring Boot")
                .slug("java-spring-boot")
                .price(new BigDecimal("500000"))
                .status(CourseStatus.PUBLISHED)
                .build();

        course2 = Course.builder()
                .id(20L)
                .title("Khóa học React Native")
                .slug("react-native")
                .price(new BigDecimal("300000"))
                .status(CourseStatus.PUBLISHED)
                .build();

        cartItem1 = CartItem.builder()
                .id(100L)
                .user(student)
                .course(course1)
                .addedAt(LocalDateTime.now())
                .build();

        cartItem2 = CartItem.builder()
                .id(101L)
                .user(student)
                .course(course2)
                .addedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Thanh toán giỏ hàng thành công: tạo Order, OrderItems, ghi danh và xóa giỏ hàng")
    void checkout_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of(cartItem1, cartItem2));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 20L)).thenReturn(false);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(999L);
            return o;
        });

        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> {
            OrderItem item = invocation.getArgument(0);
            item.setId(1001L);
            return item;
        });

        OrderResponse response = orderService.checkout("student@lms.com");

        assertNotNull(response);
        assertEquals(999L, response.getId());
        assertEquals(new BigDecimal("800000"), response.getTotalAmount());
        assertEquals(OrderStatus.COMPLETED, response.getStatus());
        assertEquals("QR_CODE", response.getPaymentMethod());
        assertEquals(2, response.getItems().size());

        verify(enrollmentService, times(1)).enrollCourseFromOrder(eq(student), eq(course1));
        verify(enrollmentService, times(1)).enrollCourseFromOrder(eq(student), eq(course2));
        verify(cartItemRepository, times(1)).deleteByUserId(1L);
    }

    @Test
    @DisplayName("Thanh toán thành công với phương thức CARD (Thẻ)")
    void checkout_WithCard_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of(cartItem1));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(888L);
            return o;
        });

        OrderResponse response = orderService.checkout("student@lms.com", "CARD");

        assertNotNull(response);
        assertEquals("CARD", response.getPaymentMethod());
        assertEquals(OrderStatus.COMPLETED, response.getStatus());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi phương thức thanh toán không hợp lệ")
    void checkout_InvalidPaymentMethod_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                orderService.checkout("student@lms.com", "BITCOIN")
        );

        assertTrue(ex.getMessage().contains("Phương thức thanh toán không hợp lệ"));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi giỏ hàng trống")
    void checkout_EmptyCart_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                orderService.checkout("student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Giỏ hàng của bạn đang trống"));
        verify(orderRepository, never()).save(any());
        verify(enrollmentService, never()).enrollCourseFromOrder(any(), any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi có khóa học trong giỏ không còn PUBLISHED (chưa/hủy xuất bản)")
    void checkout_CourseNotPublished_ThrowsException() {
        course2.setStatus(CourseStatus.DRAFT);

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of(cartItem1, cartItem2));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                orderService.checkout("student@lms.com")
        );

        assertTrue(ex.getMessage().contains("không còn khả dụng để mua"));
        verify(orderRepository, never()).save(any());
        verify(enrollmentService, never()).enrollCourseFromOrder(any(), any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi học viên đã sở hữu khóa học trong giỏ")
    void checkout_AlreadyEnrolled_ThrowsException() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of(cartItem1, cartItem2));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                orderService.checkout("student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Bạn đã sở hữu khóa học"));
        verify(orderRepository, never()).save(any());
        verify(enrollmentService, never()).enrollCourseFromOrder(any(), any());
    }

    @Test
    @DisplayName("Lấy danh sách lịch sử đơn hàng của học viên")
    void getMyOrders_Success() {
        Order sampleOrder = Order.builder()
                .id(1L)
                .orderCode("ORD-123456")
                .user(student)
                .totalAmount(new BigDecimal("500000"))
                .status(OrderStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(sampleOrder));

        List<OrderResponse> orders = orderService.getMyOrders("student@lms.com");

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("ORD-123456", orders.get(0).getOrderCode());
    }

    @Test
    @DisplayName("Xem chi tiết đơn hàng: thành công khi là chủ sở hữu")
    void getOrderById_Owner_Success() {
        Order sampleOrder = Order.builder()
                .id(1L)
                .orderCode("ORD-123456")
                .user(student)
                .totalAmount(new BigDecimal("500000"))
                .status(OrderStatus.COMPLETED)
                .items(new ArrayList<>())
                .build();

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        OrderResponse response = orderService.getOrderById(1L, "student@lms.com");

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    @DisplayName("Xem chi tiết đơn hàng: từ chối khi không phải chủ sở hữu và không phải Admin")
    void getOrderById_NotOwner_ThrowsException() {
        User otherUser = User.builder().id(2L).email("other@lms.com").role(Role.ROLE_STUDENT).build();
        Order sampleOrder = Order.builder()
                .id(1L)
                .user(otherUser)
                .build();

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                orderService.getOrderById(1L, "student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Bạn không có quyền xem đơn hàng"));
    }
}
