package com.lms.lms_backend.specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.lms.lms_backend.entity.Course;
import com.lms.lms_backend.entity.CourseStatus;

import jakarta.persistence.criteria.Predicate;

public class CourseSpecification {

    public static Specification<Course> filterPublishedCourses(
            String priceType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Long categoryId,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Chỉ lấy khóa học PUBLISHED
            predicates.add(cb.equal(root.get("status"), CourseStatus.PUBLISHED));

            // 2. Lọc theo priceType ("free" | "paid")
            if ("free".equalsIgnoreCase(priceType)) {
                predicates.add(cb.or(
                    cb.isNull(root.get("price")),
                    cb.equal(root.get("price"), BigDecimal.ZERO)
                ));
            } else if ("paid".equalsIgnoreCase(priceType)) {
                predicates.add(cb.and(
                    cb.isNotNull(root.get("price")),
                    cb.greaterThan(root.get("price"), BigDecimal.ZERO)
                ));
            }

            // 3. Lọc theo minPrice
            if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) >= 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            // 4. Lọc theo maxPrice
            if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) >= 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // 5. Lọc theo categoryId
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 6. Lọc theo search (title hoặc description)
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
