package auca.ac.rw.transportManagementSystem.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.service.OtpService;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordController {
    private static final Logger log = LoggerFactory.getLogger(PasswordController.class);

    @Autowired
    private OtpService otpService;

    @PostMapping("/otp/request")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, Object> requestMap) {
        log.info("=== OTP REQUEST ENDPOINT CALLED ===");
        log.info("Request body: {}", requestMap);
        
        try {
            // Extract email
            String email = null;
            if (requestMap.get("email") != null) {
                email = requestMap.get("email").toString().trim();
            }
            
            if (email == null || email.isEmpty()) {
                log.error("Email is missing in request");
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email is required"));
            }
            
            // Extract and convert purpose
            OtpPurpose purpose = OtpPurpose.PASSWORD_RESET; // default
            Object purposeObj = requestMap.get("purpose");
            
            if (purposeObj != null) {
                if (purposeObj instanceof String) {
                    try {
                        purpose = OtpPurpose.valueOf(((String) purposeObj).toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.error("Invalid purpose value: {}", purposeObj);
                        return ResponseEntity.badRequest().body(Map.of(
                            "success", false, 
                            "error", "Invalid purpose: " + purposeObj + ". Must be PASSWORD_SETUP or PASSWORD_RESET"
                        ));
                    }
                } else if (purposeObj instanceof OtpPurpose) {
                    purpose = (OtpPurpose) purposeObj;
                }
            }
            
            log.info("Processing OTP request for email: {}, purpose: {}", email, purpose);
            
            // Normalize email before passing to service
            String normalizedEmail = email.trim().toLowerCase();
            log.info("Normalized email: {}", normalizedEmail);
            
            otpService.sendPasswordOtp(normalizedEmail, purpose);
            log.info("✅ OTP request processed successfully");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent successfully to " + normalizedEmail
            ));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IllegalStateException e) {
            log.error("Configuration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "hint", "Please check email configuration in application.properties"
            ));
        } catch (RuntimeException e) {
            log.error("Runtime error sending OTP: {}", e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace for debugging
            // Check if it's a wrapped exception from EmailService
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Email")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", errorMsg,
                    "hint", "Please check your email configuration and Gmail App Password settings"
                ));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to send OTP: " + errorMsg
            ));
        } catch (Exception e) {
            log.error("Unexpected error sending OTP: {}", e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to send OTP: " + e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/otp/confirm")
    public ResponseEntity<?> confirmOtp(@RequestBody Map<String, Object> requestMap) {
        log.info("=== OTP CONFIRMATION ENDPOINT CALLED ===");
        log.info("Request body: {}", requestMap);
        
        try {
            // Extract required fields
            String email = requestMap.get("email") != null ? requestMap.get("email").toString().trim() : null;
            String otp = requestMap.get("otp") != null ? requestMap.get("otp").toString().trim() : null;
            String newPassword = requestMap.get("newPassword") != null ? requestMap.get("newPassword").toString().trim() : null;
            Object purposeObj = requestMap.get("purpose");
            
            log.info("Request email: {}, purpose: {}", email, purposeObj);
            
            // Validate required fields
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Email is required"));
            }
            if (otp == null || otp.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "OTP is required"));
            }
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "New password is required"));
            }
            
            // Extract and convert purpose
            OtpPurpose purpose = OtpPurpose.PASSWORD_RESET; // default
            if (purposeObj != null) {
                if (purposeObj instanceof String) {
                    try {
                        purpose = OtpPurpose.valueOf(((String) purposeObj).toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.error("Invalid purpose value: {}", purposeObj);
                        return ResponseEntity.badRequest().body(Map.of(
                            "success", false, 
                            "error", "Invalid purpose: " + purposeObj + ". Must be PASSWORD_SETUP or PASSWORD_RESET"
                        ));
                    }
                } else if (purposeObj instanceof OtpPurpose) {
                    purpose = (OtpPurpose) purposeObj;
                }
            }
            
            log.info("Processing OTP confirmation for email: {}, purpose: {}", email, purpose);
            
            otpService.confirmPasswordOtpAndSetPassword(email.toLowerCase(), otp, newPassword, purpose);
            
            log.info("✅ Password updated successfully");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password updated successfully"
            ));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (RuntimeException e) {
            log.error("Runtime error confirming OTP: {}", e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to update password: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error confirming OTP: {}", e.getMessage(), e);
            e.printStackTrace(); // Print full stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to update password: " + e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        log.info("=== EMAIL TEST ENDPOINT CALLED ===");
        String testEmail = request.get("email");
        if (testEmail == null || testEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Email is required"
            ));
        }
        
        try {
            // Send a test OTP to verify email configuration
            otpService.sendPasswordOtp(testEmail.trim().toLowerCase(), OtpPurpose.PASSWORD_SETUP);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test email sent successfully to " + testEmail + ". Check your inbox!"
            ));
        } catch (Exception e) {
            log.error("Test email failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to send test email: " + e.getMessage(),
                "hint", "Make sure you've configured spring.mail.password in application.properties with your Gmail App Password"
            ));
        }
    }
}

