package auca.ac.rw.transportManagementSystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String title;
    private String message;
    
    // Target: ALL, DRIVER, STUDENT, or specific user email
    private String targetAudience;
    
    // Specific recipient email (null means role-based targeting)
    private String recipientEmail;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
