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
}
