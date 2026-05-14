package auca.ac.rw.transportManagementSystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "announcement_replies")
public class AnnouncementReply {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @ManyToOne
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}


