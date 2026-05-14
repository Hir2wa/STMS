package auca.ac.rw.transportManagementSystem.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.model.OtpToken;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByEmailAndPurposeAndCodeAndUsedAtIsNullOrderByCreatedAtDesc(
            String email, OtpPurpose purpose, String code);
}

