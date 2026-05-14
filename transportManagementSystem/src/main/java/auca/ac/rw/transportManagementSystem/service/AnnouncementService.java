package auca.ac.rw.transportManagementSystem.service;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import auca.ac.rw.transportManagementSystem.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public String saveAnnouncement(Announcement announcement) {
        announcement.setCreatedAt(LocalDateTime.now());
        try {
            announcementRepository.save(announcement);
            return "Announcement saved successfully";
        } catch (Exception e) {
            return "Error saving announcement: " + e.getMessage();
        }
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public List<Announcement> getAnnouncementsForUser(String userEmail, String userRole) {
        // Get announcements that are:
        // 1. Targeted to ALL
        // 2. Targeted to the user's role (DRIVER, STUDENT, etc.)
        // 3. Specifically targeted to this user's email
        return announcementRepository.findAnnouncementsForUser(userEmail, userRole);
    }

    // Pagination methods
    public Page<Announcement> getAllAnnouncements(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return announcementRepository.findAll(pageable);
    }

    public Page<Announcement> getAnnouncementsByTargetAudience(String targetAudience, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return announcementRepository.findByTargetAudience(targetAudience, pageable);
    }

    public Page<Announcement> searchAnnouncements(String searchTerm, int page, int size, String sortBy, String sortDir) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String term = searchTerm.trim();
        // Search across title and message
        Page<Announcement> titleResults = announcementRepository.findByTitleContainingIgnoreCase(term, pageable);
        if (titleResults.hasContent()) {
            return titleResults;
        }
        return announcementRepository.findByMessageContainingIgnoreCase(term, pageable);
    }
}
