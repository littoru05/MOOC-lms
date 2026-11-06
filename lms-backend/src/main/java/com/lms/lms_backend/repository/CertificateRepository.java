package com.lms.lms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Certificate;
import com.lms.lms_backend.entity.CertificateStatus;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long>, JpaSpecificationExecutor<Certificate> {
    Optional<Certificate> findByCertificateCode(String certificateCode);
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    boolean existsByEnrollmentId(Long enrollmentId);

    long countByStatus(CertificateStatus status);

    @Query("SELECT c.enrollment.id, c.finalScore FROM Certificate c " +
           "WHERE c.enrollment.id IN :enrollmentIds")
    List<Object[]> findFinalScoresByEnrollmentIds(@Param("enrollmentIds") List<Long> enrollmentIds);

    @Query("SELECT c FROM Certificate c WHERE c.enrollment.user.id = :userId ORDER BY c.issuedAt DESC")
    List<Certificate> findByStudentUserIdOrderByIssuedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.enrollment.user.id = :userId")
    long countByStudentUserId(@Param("userId") Long userId);
}
