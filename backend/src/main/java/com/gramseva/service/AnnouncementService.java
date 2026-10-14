package com.gramseva.service;

import com.gramseva.entity.Announcement;
import com.gramseva.entity.User;
import com.gramseva.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findActiveNotices(LocalDate.now());
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @Transactional
    public Announcement createAnnouncement(Announcement announcement, User author) {
        announcement.setPublishedBy(author);
        if (announcement.getPublishDate() == null) {
            announcement.setPublishDate(LocalDate.now());
        }
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
