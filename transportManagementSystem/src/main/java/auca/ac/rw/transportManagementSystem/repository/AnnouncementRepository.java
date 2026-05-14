package auca.ac.rw.transportManagementSystem.repository;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {
    List<Announcement> findByTargetAudience(String targetAudience);
    
    Page<Announcement> findByTargetAudience(String targetAudience, Pageable pageable);
    
    // Find announcements for a specific user (by email)
    List<Announcement> findByRecipientEmail(String recipientEmail);
    
    // Find announcements for specific roles
    List<Announcement> findByTargetAudienceIn(List<String> targetAudiences);
    
    // Custom query: Find announcements for a specific user OR their role OR all
    @Query("SELECT a FROM Announcement a WHERE " +
           "a.recipientEmail = :userEmail OR " +
           "a.targetAudience = 'ALL' OR " +
           "a.targetAudience = :userRole")
    List<Announcement> findAnnouncementsForUser(@Param("userEmail") String userEmail, @Param("userRole") String userRole);
    
    Page<Announcement> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    Page<Announcement> findByMessageContainingIgnoreCase(String message, Pageable pageable);
}
