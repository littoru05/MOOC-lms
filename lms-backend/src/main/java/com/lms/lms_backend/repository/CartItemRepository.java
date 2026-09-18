package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdOrderByAddedAtDesc(Long userId);
    Optional<CartItem> findByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    void deleteByUserIdAndCourseId(Long userId, Long courseId);
    void deleteByUserId(Long userId);
    long countByUserId(Long userId);
}
