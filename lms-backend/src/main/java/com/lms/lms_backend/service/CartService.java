package com.lms.lms_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.cart.AddToCartRequest;
import com.lms.lms_backend.dto.cart.CartItemResponse;
import com.lms.lms_backend.dto.cart.CartResponse;
import com.lms.lms_backend.entity.CartItem;
import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;
import com.lms.lms_backend.entity.Role;
import com.lms.lms_backend.entity.User;
import com.lms.lms_backend.repository.CartItemRepository;
import com.lms.lms_backend.repository.CourseRepository;
import com.lms.lms_backend.repository.EnrollmentRepository;
import com.lms.lms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(String userEmail) {
        User user = getUser(userEmail);
        return buildCartResponse(user.getId());
    }

    @Transactional
    public CartResponse addToCart(AddToCartRequest request, String userEmail) {
        User user = getUser(userEmail);
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new RuntimeException("Chỉ tài khoản học viên mới có thể sử dụng giỏ hàng!");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại với ID: " + request.getCourseId()));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new RuntimeException("Khóa học chưa được phát hành công khai!");
        }

        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Khóa học miễn phí không cần thêm vào giỏ hàng, bạn có thể ghi danh trực tiếp!");
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Bạn đã sở hữu khóa học này rồi!");
        }

        if (cartItemRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Khóa học đã có trong giỏ hàng của bạn!");
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .course(course)
                .build();

        cartItemRepository.save(cartItem);

        return buildCartResponse(user.getId());
    }

    @Transactional
    public CartResponse removeFromCart(Long courseId, String userEmail) {
        User user = getUser(userEmail);
        cartItemRepository.deleteByUserIdAndCourseId(user.getId(), courseId);
        return buildCartResponse(user.getId());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
    }

    private CartResponse buildCartResponse(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByAddedAtDesc(userId);

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .courseId(item.getCourse().getId())
                        .courseTitle(item.getCourse().getTitle())
                        .courseSlug(item.getCourse().getSlug())
                        .thumbnailUrl(item.getCourse().getThumbnailUrl())
                        .instructorName(item.getCourse().getInstructor() != null ? item.getCourse().getInstructor().getFullName() : null)
                        .price(item.getCourse().getPrice() != null ? item.getCourse().getPrice() : BigDecimal.ZERO)
                        .addedAt(item.getAddedAt())
                        .build())
                .collect(Collectors.toList());

        BigDecimal totalPrice = itemResponses.stream()
                .map(CartItemResponse::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(itemResponses)
                .totalPrice(totalPrice)
                .totalItems(itemResponses.size())
                .build();
    }
}
