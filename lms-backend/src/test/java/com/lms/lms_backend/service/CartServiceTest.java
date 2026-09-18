package com.lms.lms_backend.service;

import java.math.BigDecimal;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lms.lms_backend.dto.cart.AddToCartRequest;
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

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private CartService cartService;

    private User student;
    private User instructor;
    private Course paidCourse;
    private Course freeCourse;
    private Course draftCourse;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@lms.com")
                .fullName("Học viên Nguyễn")
                .role(Role.ROLE_STUDENT)
                .build();

        instructor = User.builder()
                .id(2L)
                .email("instructor@lms.com")
                .fullName("Giảng viên Trần")
                .role(Role.ROLE_INSTRUCTOR)
                .build();

        paidCourse = Course.builder()
                .id(10L)
                .title("Khóa học Lập trình Web Fullstack")
                .slug("khoa-hoc-web-fullstack")
                .price(new BigDecimal("499000"))
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .build();

        freeCourse = Course.builder()
                .id(11L)
                .title("Khóa học Miễn phí")
                .slug("khoa-hoc-mien-phi")
                .price(BigDecimal.ZERO)
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .build();

        draftCourse = Course.builder()
                .id(12L)
                .title("Khóa học Bản nháp")
                .slug("khoa-hoc-ban-nhap")
                .price(new BigDecimal("299000"))
                .status(CourseStatus.DRAFT)
                .instructor(instructor)
                .build();
    }

    @Test
    @DisplayName("Học viên thêm khóa học có phí vào giỏ hàng thành công")
    void addToCart_Success() {
        AddToCartRequest req = new AddToCartRequest(10L);

        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(paidCourse));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);
        when(cartItemRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);

        CartItem savedItem = CartItem.builder()
                .id(100L)
                .user(student)
                .course(paidCourse)
                .build();

        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of(savedItem));

        CartResponse res = cartService.addToCart(req, "student@lms.com");

        assertNotNull(res);
        assertEquals(1, res.getTotalItems());
        assertEquals(new BigDecimal("499000"), res.getTotalPrice());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Chặn tài khoản Giảng viên hoặc Admin thêm vào giỏ hàng")
    void addToCart_NonStudent_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest(10L);
        when(userRepository.findByEmail("instructor@lms.com")).thenReturn(Optional.of(instructor));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(req, "instructor@lms.com")
        );

        assertTrue(ex.getMessage().contains("Chỉ tài khoản học viên"));
    }

    @Test
    @DisplayName("Chặn thêm khóa học miễn phí vào giỏ hàng")
    void addToCart_FreeCourse_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest(11L);
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(11L)).thenReturn(Optional.of(freeCourse));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(req, "student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Khóa học miễn phí không cần thêm vào giỏ"));
    }

    @Test
    @DisplayName("Chặn thêm khóa học chưa được phát hành công khai (DRAFT)")
    void addToCart_UnpublishedCourse_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest(12L);
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(12L)).thenReturn(Optional.of(draftCourse));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(req, "student@lms.com")
        );

        assertTrue(ex.getMessage().contains("chưa được phát hành"));
    }

    @Test
    @DisplayName("Chặn thêm khóa học đã sở hữu / ghi danh rồi")
    void addToCart_AlreadyEnrolled_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest(10L);
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(paidCourse));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(req, "student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Bạn đã sở hữu khóa học này"));
    }

    @Test
    @DisplayName("Chặn thêm khóa học đã có sẵn trong giỏ hàng")
    void addToCart_AlreadyInCart_ThrowsException() {
        AddToCartRequest req = new AddToCartRequest(10L);
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(paidCourse));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(false);
        when(cartItemRepository.existsByUserIdAndCourseId(1L, 10L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(req, "student@lms.com")
        );

        assertTrue(ex.getMessage().contains("Khóa học đã có trong giỏ hàng"));
    }

    @Test
    @DisplayName("Xóa khóa học khỏi giỏ hàng")
    void removeFromCart_Success() {
        when(userRepository.findByEmail("student@lms.com")).thenReturn(Optional.of(student));
        when(cartItemRepository.findByUserIdOrderByAddedAtDesc(1L)).thenReturn(List.of());

        CartResponse res = cartService.removeFromCart(10L, "student@lms.com");

        assertNotNull(res);
        assertEquals(0, res.getTotalItems());
        verify(cartItemRepository, times(1)).deleteByUserIdAndCourseId(1L, 10L);
    }
}
