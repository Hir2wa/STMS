package auca.ac.rw.transportManagementSystem.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.model.OtpToken;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.OtpTokenRepository;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;

@Service
public class OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final SecureRandom RNG = new SecureRandom();

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void sendPasswordOtp(String email, OtpPurpose purpose) {
        log.info("=== OTP REQUEST RECEIVED ===");
        log.info("Email: {}", email);
        log.info("Purpose: {}", purpose);
        
        if (email == null || email.trim().isEmpty()) {
            log.error("Email is required but was null or empty");
            throw new IllegalArgumentException("Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase();
        log.info("Normalized email: {}", normalizedEmail);

        // Try to find user with normalized email
        Optional<User> userOptional;
        try {
            userOptional = userRepository.findByEmail(normalizedEmail);
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                 jakarta.persistence.NonUniqueResultException e) {
            // Handle duplicate users - use first one
            log.warn("Multiple users found with email: {}. Using first result (oldest by userId).", normalizedEmail);
            List<User> users = userRepository.findByEmailList(normalizedEmail);
            if (!users.isEmpty()) {
                userOptional = Optional.of(users.get(0));
                log.info("Selected user ID: {} for email: {}", userOptional.get().getUserId(), normalizedEmail);
            } else {
                userOptional = Optional.empty();
            }
        }
        
        if (!userOptional.isPresent()) {
            // Try to find with original email (case-sensitive) in case normalization didn't match
            log.warn("User not found with normalized email: {}. Checking all users...", normalizedEmail);
            
            // Log all users for debugging (only in development)
            List<User> allUsers = userRepository.findAll();
            log.info("Total users in database: {}", allUsers.size());
            for (User u : allUsers) {
                if (u.getEmail() != null && u.getEmail().toLowerCase().equals(normalizedEmail)) {
                    log.warn("Found user with different case: {} -> {}", u.getEmail(), normalizedEmail);
                }
            }
            
            log.error("User not found for email: {} (normalized: {})", email, normalizedEmail);
            throw new IllegalArgumentException("User not found with email: " + email + ". Please check your email address or contact administrator.");
        }
        
        User user = userOptional.get();
        log.info("User found: {} (ID: {}, Email: {})", user.getFullNames(), user.getUserId(), user.getEmail());

        String otp = generateSixDigitOtp();
        log.info("Generated OTP: {}", otp);

        OtpToken token = new OtpToken();
        token.setEmail(normalizedEmail);
        token.setPurpose(purpose);
        token.setCode(otp);
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plus(OTP_TTL));
        token.setUsedAt(null);
        
        try {
            OtpToken savedToken = otpTokenRepository.save(token);
            log.info("OTP token saved to database. ID: {}, Expires at: {}", savedToken.getId(), savedToken.getExpiresAt());
        } catch (org.springframework.dao.DataIntegrityViolationException dbEx) {
            log.error("❌ Database constraint violation when saving OTP token: {}", dbEx.getMessage(), dbEx);
            throw new RuntimeException("Failed to save OTP token due to database constraint: " + dbEx.getMessage(), dbEx);
        } catch (Exception dbEx) {
            log.error("❌ Failed to save OTP token to database: {}", dbEx.getMessage(), dbEx);
            dbEx.printStackTrace();
            throw new RuntimeException("Failed to save OTP token: " + dbEx.getMessage(), dbEx);
        }

        String subject;
        String purposeText;
        if (purpose == OtpPurpose.PASSWORD_SETUP) {
            subject = "Set your password";
            purposeText = "Password Setup";
        } else if (purpose == OtpPurpose.PASSWORD_RESET) {
            subject = "Reset your password";
            purposeText = "Password Reset";
        } else {
            subject = "Login Verification Code";
            purposeText = "Two-Factor Authentication";
        }
        
        String body = "Hello " + user.getFullNames() + ",\n\n"
                + "Your OTP code is: " + otp + "\n"
                + "This code expires in 5 minutes.\n\n"
                + "Email: " + user.getEmail() + "\n"
                + "Purpose: " + purposeText + "\n\n"
                + "If you did not request this OTP, please ignore this email.\n\n"
                + "Best regards,\n"
                + "Transport Management System";

        log.info("Attempting to send OTP email...");
        try {
            emailService.sendPlainText(normalizedEmail, subject, body);
            log.info("✅ OTP email sent successfully to {}", normalizedEmail);
        } catch (IllegalStateException e) {
            log.error("❌ Email configuration error: {}", e.getMessage());
            // Don't throw - OTP is saved, user can see it in logs or contact admin
            throw new IllegalStateException("Email service not configured. Please contact administrator. OTP code: " + otp, e);
        } catch (RuntimeException e) {
            log.error("❌ Failed to send OTP email to {}: {}", normalizedEmail, e.getMessage(), e);
            // OTP is already saved in database, so user could potentially use it if they see it in logs
            // But we should still throw the exception so the API returns an error
            throw new RuntimeException("OTP generated and saved (code: " + otp + "), but failed to send email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending OTP email to {}: {}", normalizedEmail, e.getMessage(), e);
            e.printStackTrace();
            throw new RuntimeException("Unexpected error sending OTP email: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void confirmPasswordOtpAndSetPassword(String email, String otp, String newPassword, OtpPurpose purpose) {
        log.info("=== OTP CONFIRMATION REQUEST ===");
        log.info("Email: {}", email);
        log.info("Purpose: {}", purpose);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (otp == null || otp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP is required");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedOtp = otp.trim();
        log.info("Normalized email: {}, OTP: {}", normalizedEmail, normalizedOtp);

        OtpToken token = otpTokenRepository
                .findTopByEmailAndPurposeAndCodeAndUsedAtIsNullOrderByCreatedAtDesc(normalizedEmail, purpose, normalizedOtp)
                .orElseThrow(() -> {
                    log.error("Invalid OTP: email={}, otp={}, purpose={}", normalizedEmail, normalizedOtp, purpose);
                    return new IllegalArgumentException("Invalid OTP");
                });

        log.info("OTP token found. Created at: {}, Expires at: {}", token.getCreatedAt(), token.getExpiresAt());

        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(Instant.now())) {
            log.error("OTP expired. Expires at: {}, Current time: {}", token.getExpiresAt(), Instant.now());
            throw new IllegalArgumentException("OTP expired");
        }

        Optional<User> userOptional;
        try {
            userOptional = userRepository.findByEmail(normalizedEmail);
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                 jakarta.persistence.NonUniqueResultException e) {
            // Handle duplicate users - use first one
            log.warn("Multiple users found with email: {}. Using first result (oldest by userId).", normalizedEmail);
            List<User> users = userRepository.findByEmailList(normalizedEmail);
            if (!users.isEmpty()) {
                userOptional = Optional.of(users.get(0));
                log.info("Selected user ID: {} for email: {}", userOptional.get().getUserId(), normalizedEmail);
            } else {
                userOptional = Optional.empty();
            }
        }
        
        User user = userOptional.orElseThrow(() -> {
            log.error("User not found for email: {}", normalizedEmail);
            return new IllegalArgumentException("User not found");
        });

        log.info("Updating password for user: {}", user.getFullNames());
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        otpTokenRepository.save(token);
        log.info("✅ Password updated successfully. OTP marked as used.");
    }

    @Transactional
    public boolean verifyLoginOtp(String email, String otp) {
        log.info("=== LOGIN OTP VERIFICATION ===");
        log.info("Email: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (otp == null || otp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP is required");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedOtp = otp.trim();
        log.info("Normalized email: {}, OTP: {}", normalizedEmail, normalizedOtp);

        OtpToken token = otpTokenRepository
                .findTopByEmailAndPurposeAndCodeAndUsedAtIsNullOrderByCreatedAtDesc(normalizedEmail, OtpPurpose.LOGIN_2FA, normalizedOtp)
                .orElse(null);

        if (token == null) {
            log.error("Invalid OTP: email={}, otp={}", normalizedEmail, normalizedOtp);
            return false;
        }

        log.info("OTP token found. Created at: {}, Expires at: {}", token.getCreatedAt(), token.getExpiresAt());

        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(Instant.now())) {
            log.error("OTP expired. Expires at: {}, Current time: {}", token.getExpiresAt(), Instant.now());
            return false;
        }

        // Mark OTP as used
        token.setUsedAt(Instant.now());
        otpTokenRepository.save(token);
        log.info("✅ Login OTP verified successfully. OTP marked as used.");
        return true;
    }

    private String generateSixDigitOtp() {
        int value = RNG.nextInt(1_000_000); // 0..999999
        return String.format("%06d", value);
    }
}

