package auca.ac.rw.transportManagementSystem.service;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import auca.ac.rw.transportManagementSystem.model.AnnouncementReply;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.AnnouncementReplyRepository;
import auca.ac.rw.transportManagementSystem.repository.AnnouncementRepository;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AnnouncementReplyService {

    @Autowired
    private AnnouncementReplyRepository announcementReplyRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    public String saveReply(int announcementId, UUID userId, String message) {
        try {
            Optional<Announcement> announcementOpt = announcementRepository.findById(announcementId);
            if (announcementOpt.isEmpty()) {
                return "Error: Announcement not found";
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return "Error: User not found";
            }

            AnnouncementReply reply = new AnnouncementReply();
            reply.setAnnouncement(announcementOpt.get());
            reply.setUser(userOpt.get());
            reply.setMessage(message);
            reply.setCreatedAt(LocalDateTime.now());

            announcementReplyRepository.save(reply);
            return "Reply saved successfully";
        } catch (Exception e) {
            return "Error saving reply: " + e.getMessage();
        }
    }

    public List<AnnouncementReply> getRepliesByAnnouncementId(int announcementId) {
        return announcementReplyRepository.findByAnnouncementIdOrderByCreatedAtAsc(announcementId);
    }
}


