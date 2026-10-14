package com.gramseva.repository;

import com.gramseva.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveTrueOrderByPublishDateDesc();

    @Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.expiryDate IS NULL OR a.expiryDate >= :today) ORDER BY a.publishDate DESC")
    List<Announcement> findActiveNotices(LocalDate today);

    List<Announcement> findByCategoryAndActiveTrue(String category);
}
