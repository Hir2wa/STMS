package auca.ac.rw.transportManagementSystem.controller;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import auca.ac.rw.transportManagementSystem.model.AnnouncementReply;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;
import auca.ac.rw.transportManagementSystem.service.AnnouncementReplyService;
import auca.ac.rw.transportManagementSystem.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private AnnouncementReplyService announcementReplyService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/save")
    public ResponseEntity<String> saveAnnouncement(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementService.saveAnnouncement(announcement));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyAnnouncements() {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null || !(principal instanceof UserDetails)) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername();

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(400).body("Email not found in token");
            }

            Optional<User> userOpt;
            try {
                userOpt = userRepository.findByEmail(email);
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                     jakarta.persistence.NonUniqueResultException e) {
                // Handle duplicate users - use first one
                org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AnnouncementController.class);
                log.warn("Multiple users found with email: {}. Using first result.", email);
                java.util.List<User> users = userRepository.findByEmailList(email);
                if (!users.isEmpty()) {
                    userOpt = Optional.of(users.get(0));
                } else {
                    userOpt = Optional.empty();
                }
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            User user = userOpt.get();
            List<Announcement> announcements = announcementService.getAnnouncementsForUser(email, user.getRole().name());

            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching announcements: " + e.getMessage());
        }
    }

    @PostMapping("/{announcementId}/replies")
    public ResponseEntity<?> saveReply(
            @PathVariable int announcementId,
            @RequestBody ReplyRequest replyRequest) {
        try {
            // Get current authenticated user
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            
            Optional<User> userOpt;
            try {
                userOpt = userRepository.findByEmail(email);
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                     jakarta.persistence.NonUniqueResultException e) {
                // Handle duplicate users - use first one
                org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AnnouncementController.class);
                log.warn("Multiple users found with email: {}. Using first result.", email);
                java.util.List<User> users = userRepository.findByEmailList(email);
                if (!users.isEmpty()) {
                    userOpt = Optional.of(users.get(0));
                } else {
                    userOpt = Optional.empty();
                }
            }
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            User user = userOpt.get();
            // Check if user is STUDENT or DRIVER
            if (user.getRole() != auca.ac.rw.transportManagementSystem.model.Role.STUDENT && 
                user.getRole() != auca.ac.rw.transportManagementSystem.model.Role.DRIVER) {
                return ResponseEntity.status(403).body("Only students and drivers can reply to announcements");
            }

            String result = announcementReplyService.saveReply(announcementId, user.getUserId(), replyRequest.getMessage());
            if (result.startsWith("Error")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{announcementId}/replies")
    public ResponseEntity<List<AnnouncementReply>> getReplies(@PathVariable int announcementId) {
        return ResponseEntity.ok(announcementReplyService.getRepliesByAnnouncementId(announcementId));
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Announcement>> getAllAnnouncementsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<Announcement> announcements = announcementService.getAllAnnouncements(page, size, sortBy, sortDir);
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/targetAudience/{targetAudience}/paginated")
    public ResponseEntity<Page<Announcement>> getAnnouncementsByTargetAudiencePaginated(
            @PathVariable String targetAudience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<Announcement> announcements = announcementService.getAnnouncementsByTargetAudience(targetAudience, page, size, sortBy, sortDir);
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/search/paginated")
    public ResponseEntity<Page<Announcement>> searchAnnouncementsPaginated(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<Announcement> announcements = announcementService.searchAnnouncements(searchTerm, page, size, sortBy, sortDir);
        return ResponseEntity.ok(announcements);
    }

    // Inner class for request body
    public static class ReplyRequest {
        private String message;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
