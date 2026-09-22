package com.lms.lms_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Certificate;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateCode(String certificateCode);
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    boolean existsByEnrollmentId(Long enrollmentId);

    @org.springframework.data.jpa.repository.Query("SELECT c.enrollment.id, c.finalScore FROM Certificate c " +
           "WHERE c.enrollment.id IN :enrollmentIds")
    java.util.List<Object[]> findFinalScoresByEnrollmentIds(@org.springframework.data.repository.query.Param("enrollmentIds") java.util.List<Long> enrollmentIds);
}
