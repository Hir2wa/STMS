package auca.ac.rw.transportManagementSystem.controller;

import auca.ac.rw.transportManagementSystem.config.JwtService;
import auca.ac.rw.transportManagementSystem.dto.AuthRequest;
import auca.ac.rw.transportManagementSystem.dto.AuthResponse;
import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            // Step 1: Verify username and password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
            
            if (!authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Authentication failed");
            }

            // Step 2: Check if OTP is provided (2FA verification)
            if (authRequest.getOtp() != null && !authRequest.getOtp().trim().isEmpty()) {
                // Verify OTP
                boolean otpValid = otpService.verifyLoginOtp(authRequest.getUsername(), authRequest.getOtp());
                if (!otpValid) {
                    return ResponseEntity.status(401).body("Invalid or expired OTP");
                }
                // OTP is valid, generate token
                String token = jwtService.generateToken(authRequest.getUsername());
                return ResponseEntity.ok(new AuthResponse(token));
            } else {
                // Step 3: Send OTP for 2FA
                try {
                    otpService.sendPasswordOtp(authRequest.getUsername(), OtpPurpose.LOGIN_2FA);
                    return ResponseEntity.ok(Map.of(
                        "requiresOtp", true,
                        "message", "OTP sent to your email. Please enter the OTP to complete login."
                    ));
                } catch (Exception e) {
                    return ResponseEntity.status(500).body("Failed to send OTP: " + e.getMessage());
                }
            }
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            // Handle duplicate users issue
            return ResponseEntity.status(500).body("Multiple accounts found with this email. Please contact administrator to resolve duplicate accounts.");
        } catch (jakarta.persistence.NonUniqueResultException e) {
            // Handle duplicate users issue
            return ResponseEntity.status(500).body("Multiple accounts found with this email. Please contact administrator to resolve duplicate accounts.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred during authentication: " + e.getMessage());
        }
    }
}
