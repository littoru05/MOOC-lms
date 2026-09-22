package com.lms.lms_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryRawDto;
import com.lms.lms_backend.dto.admin.revenue.CategoryRevenueRawDto;
import com.lms.lms_backend.dto.admin.revenue.InstructorRankingRawDto;
import com.lms.lms_backend.dto.admin.revenue.TopCourseRawDto;
import com.lms.lms_backend.dto.revenue.RevenueChartRawDto;
import com.lms.lms_backend.entity.OrderItem;

@Repository
public interface AdminRevenueRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT new com.lms.lms_backend.dto.admin.revenue.AdminRevenueSummaryRawDto(" +
           "    COALESCE(SUM(oi.price), 0), " +
           "    COUNT(DISTINCT o.id), " +
           "    COUNT(DISTINCT o.user.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED")
    AdminRevenueSummaryRawDto getAdminRevenueSummary();

    @Query("SELECT new com.lms.lms_backend.dto.revenue.RevenueChartRawDto(" +
           "    year(COALESCE(o.paidAt, o.createdAt)), " +
           "    month(COALESCE(o.paidAt, o.createdAt)), " +
           "    day(COALESCE(o.paidAt, o.createdAt)), " +
           "    SUM(oi.price), " +
           "    COUNT(DISTINCT o.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "  AND (:from IS NULL OR COALESCE(o.paidAt, o.createdAt) >= :from) " +
           "  AND (:to IS NULL OR COALESCE(o.paidAt, o.createdAt) <= :to) " +
           "GROUP BY year(COALESCE(o.paidAt, o.createdAt)), " +
           "         month(COALESCE(o.paidAt, o.createdAt)), " +
           "         day(COALESCE(o.paidAt, o.createdAt)) " +
           "ORDER BY year(COALESCE(o.paidAt, o.createdAt)) ASC, " +
           "         month(COALESCE(o.paidAt, o.createdAt)) ASC, " +
           "         day(COALESCE(o.paidAt, o.createdAt)) ASC")
    List<RevenueChartRawDto> getAdminDailyRevenueChartData(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT new com.lms.lms_backend.dto.revenue.RevenueChartRawDto(" +
           "    year(COALESCE(o.paidAt, o.createdAt)), " +
           "    month(COALESCE(o.paidAt, o.createdAt)), " +
           "    1, " +
           "    SUM(oi.price), " +
           "    COUNT(DISTINCT o.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "  AND (:from IS NULL OR COALESCE(o.paidAt, o.createdAt) >= :from) " +
           "  AND (:to IS NULL OR COALESCE(o.paidAt, o.createdAt) <= :to) " +
           "GROUP BY year(COALESCE(o.paidAt, o.createdAt)), " +
           "         month(COALESCE(o.paidAt, o.createdAt)) " +
           "ORDER BY year(COALESCE(o.paidAt, o.createdAt)) ASC, " +
           "         month(COALESCE(o.paidAt, o.createdAt)) ASC")
    List<RevenueChartRawDto> getAdminMonthlyRevenueChartData(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT new com.lms.lms_backend.dto.revenue.RevenueChartRawDto(" +
           "    year(COALESCE(o.paidAt, o.createdAt)), " +
           "    1, " +
           "    1, " +
           "    SUM(oi.price), " +
           "    COUNT(DISTINCT o.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "  AND (:from IS NULL OR COALESCE(o.paidAt, o.createdAt) >= :from) " +
           "  AND (:to IS NULL OR COALESCE(o.paidAt, o.createdAt) <= :to) " +
           "GROUP BY year(COALESCE(o.paidAt, o.createdAt)) " +
           "ORDER BY year(COALESCE(o.paidAt, o.createdAt)) ASC")
    List<RevenueChartRawDto> getAdminYearlyRevenueChartData(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT new com.lms.lms_backend.dto.admin.revenue.InstructorRankingRawDto(" +
           "    inst.id, " +
           "    inst.fullName, " +
           "    inst.avatarUrl, " +
           "    SUM(oi.price), " +
           "    COUNT(oi.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.course c " +
           "JOIN c.instructor inst " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "GROUP BY inst.id, inst.fullName, inst.avatarUrl " +
           "ORDER BY SUM(oi.price) DESC")
    List<InstructorRankingRawDto> getInstructorRevenueRanking();

    @Query("SELECT new com.lms.lms_backend.dto.admin.revenue.TopCourseRawDto(" +
           "    c.id, " +
           "    c.title, " +
           "    c.thumbnailUrl, " +
           "    inst.fullName, " +
           "    COUNT(oi.id), " +
           "    SUM(oi.price)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.course c " +
           "JOIN c.instructor inst " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "GROUP BY c.id, c.title, c.thumbnailUrl, inst.fullName " +
           "ORDER BY SUM(oi.price) DESC")
    List<TopCourseRawDto> getTopCoursesRevenue(Pageable pageable);

    @Query("SELECT new com.lms.lms_backend.dto.admin.revenue.CategoryRevenueRawDto(" +
           "    cat.id, " +
           "    cat.name, " +
           "    SUM(oi.price), " +
           "    COUNT(oi.id)" +
           ") " +
           "FROM OrderItem oi " +
           "JOIN oi.course c " +
           "JOIN c.category cat " +
           "JOIN oi.order o " +
           "WHERE o.status = com.lms.lms_backend.entity.OrderStatus.COMPLETED " +
           "GROUP BY cat.id, cat.name " +
           "ORDER BY SUM(oi.price) DESC")
    List<CategoryRevenueRawDto> getCategoryRevenue();
}
