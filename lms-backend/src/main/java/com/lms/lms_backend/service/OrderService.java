package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.order.OrderItemResponse;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentService enrollmentService;

    @Transactional
    public OrderResponse checkout(String userEmail) {
        return checkout(userEmail, "QR_CODE");
    }

    @Transactional
    public OrderResponse checkout(String userEmail, String paymentMethod) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Validate paymentMethod (chỉ nhận QR_CODE hoặc CARD, mặc định QR_CODE)
        String normalizedMethod = (paymentMethod != null && !paymentMethod.isBlank())
                ? paymentMethod.trim().toUpperCase()
                : "QR_CODE";

        if (!"QR_CODE".equals(normalizedMethod) && !"CARD".equals(normalizedMethod)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ! Chỉ chấp nhận QR_CODE hoặc CARD.");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByAddedAtDesc(user.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng của bạn đang trống, không thể thanh toán!");
        }

        // 1. Double-check validation từng item trong giỏ hàng
        for (CartItem item : cartItems) {
            Course course = item.getCourse();
            if (course == null || course.getStatus() != CourseStatus.PUBLISHED) {
                throw new RuntimeException("Khóa học '" + (course != null ? course.getTitle() : "không xác định") + "' không còn khả dụng để mua!");
            }
            if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
                throw new RuntimeException("Bạn đã sở hữu khóa học '" + course.getTitle() + "' rồi!");
            }
        }

        // 2. Tính tổng tiền đơn hàng
        BigDecimal totalAmount = cartItems.stream()
                .map(ci -> ci.getCourse().getPrice() != null ? ci.getCourse().getPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Tạo mã đơn hàng duy nhất
        String orderCode = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        // 4. Tạo Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .totalAmount(totalAmount)
                .status(OrderStatus.COMPLETED)
                .paymentMethod(normalizedMethod)
                .paidAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 5. Tạo OrderItems và ghi danh cho từng khóa học
        for (CartItem item : cartItems) {
            Course course = item.getCourse();
            BigDecimal itemPrice = course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO;

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .course(course)
                    .price(itemPrice)
                    .build();

            orderItemRepository.save(orderItem);
            savedOrder.getItems().add(orderItem);

            // Ghi danh tự động vào khóa học
            enrollmentService.enrollCourseFromOrder(user, course);
        }

        // 6. Xóa giỏ hàng sau khi checkout thành công
        cartItemRepository.deleteByUserId(user.getId());

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này!");
        }

        return mapToResponse(order);
    }

    public OrderResponse mapToResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .courseId(item.getCourse().getId())
                        .courseTitle(item.getCourse().getTitle())
                        .courseSlug(item.getCourse().getSlug())
                        .courseThumbnailUrl(item.getCourse().getThumbnailUrl())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .userId(o.getUser().getId())
                .userEmail(o.getUser().getEmail())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .paymentMethod(o.getPaymentMethod())
                .createdAt(o.getCreatedAt())
                .paidAt(o.getPaidAt())
                .items(itemResponses)
                .build();
    }
}
