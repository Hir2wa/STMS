package auca.ac.rw.transportManagementSystem.controller;

import auca.ac.rw.transportManagementSystem.config.JwtService;
import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequestMapping("/oauth")
public class OAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/success")
    public String googleOAuthSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            if (oauth2User == null) {
                return "redirect:http://localhost:5173/login?error=oauth_failed";
            }

            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");

            if (email == null || email.trim().isEmpty()) {
                return "redirect:http://localhost:5173/login?error=no_email";
            }

            String normalizedEmail = email.trim().toLowerCase();

            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update user info from Google
                if (name != null && !name.trim().isEmpty()) {
                    user.setFullNames(name);
                }
                userRepository.save(user);
            } else {
                // Create new user from Google OAuth
                user = new User();
                user.setEmail(normalizedEmail);
                user.setFullNames(name != null ? name : "Google User");
                user.setRole(Role.STUDENT); 
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                userRepository.save(user);
            }

            // Generate JWT token
            String token = jwtService.generateToken(normalizedEmail);

            // Redirect to frontend with token
            return "redirect:http://localhost:5173/oauth/callback?token=" + token + "&email=" + normalizedEmail;
        } catch (Exception e) {
            return "redirect:http://localhost:5173/login?error=oauth_error";
        }
    }

    @GetMapping("/failure")
    public String googleOAuthFailure() {
        return "redirect:http://localhost:5173/login?error=oauth_failed";
    }
}

