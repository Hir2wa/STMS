package auca.ac.rw.transportManagementSystem.repository;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import auca.ac.rw.transportManagementSystem.model.AnnouncementReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementReplyRepository extends JpaRepository<AnnouncementReply, Integer> {
    List<AnnouncementReply> findByAnnouncementOrderByCreatedAtAsc(Announcement announcement);
    List<AnnouncementReply> findByAnnouncementIdOrderByCreatedAtAsc(int announcementId);
    List<AnnouncementReply> findByUserUserId(java.util.UUID userId);
}


