package com.lms.lms_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @org.springframework.data.jpa.repository.Query("SELECT year(u.createdAt), month(u.createdAt), day(u.createdAt), COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.role = com.lms.lms_backend.entity.Role.ROLE_STUDENT " +
           "GROUP BY year(u.createdAt), month(u.createdAt), day(u.createdAt) " +
           "ORDER BY year(u.createdAt) ASC, month(u.createdAt) ASC, day(u.createdAt) ASC")
    java.util.List<Object[]> getDailyUserGrowth();

    @org.springframework.data.jpa.repository.Query("SELECT year(u.createdAt), month(u.createdAt), 1, COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.role = com.lms.lms_backend.entity.Role.ROLE_STUDENT " +
           "GROUP BY year(u.createdAt), month(u.createdAt) " +
           "ORDER BY year(u.createdAt) ASC, month(u.createdAt) ASC")
    java.util.List<Object[]> getMonthlyUserGrowth();

    @org.springframework.data.jpa.repository.Query("SELECT year(u.createdAt), 1, 1, COUNT(u.id) " +
           "FROM User u " +
           "WHERE u.role = com.lms.lms_backend.entity.Role.ROLE_STUDENT " +
           "GROUP BY year(u.createdAt) " +
           "ORDER BY year(u.createdAt) ASC")
    java.util.List<Object[]> getYearlyUserGrowth();
}
