package com.gramseva.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_supply_schedules")
public class WaterSupplySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_number", nullable = false, length = 20)
    private String wardNumber;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;

    @Column(name = "morning_time_range", length = 50)
    private String morningTimeRange; // e.g. 06:00 AM - 08:30 AM

    @Column(name = "evening_time_range", length = 50)
    private String eveningTimeRange; // e.g. 05:30 PM - 07:30 PM

    @Column(nullable = false, length = 30)
    private String status = "REGULAR"; // REGULAR, DELAYED, INTERRUPTED, MAINTENANCE

    @Column(name = "notice_message", length = 500)
    private String noticeMessage;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "updated_by_id")
    private User updatedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WaterSupplySchedule() {
    }

    public WaterSupplySchedule(String wardNumber, String areaName, String morningTimeRange,
                               String eveningTimeRange, String status, String noticeMessage,
                               LocalDate effectiveDate, User updatedBy) {
        this.wardNumber = wardNumber;
        this.areaName = areaName;
        this.morningTimeRange = morningTimeRange;
        this.eveningTimeRange = eveningTimeRange;
        this.status = status;
        this.noticeMessage = noticeMessage;
        this.effectiveDate = effectiveDate;
        this.updatedBy = updatedBy;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWardNumber() {
        return wardNumber;
    }

    public void setWardNumber(String wardNumber) {
        this.wardNumber = wardNumber;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public String getMorningTimeRange() {
        return morningTimeRange;
    }

    public void setMorningTimeRange(String morningTimeRange) {
        this.morningTimeRange = morningTimeRange;
    }

    public String getEveningTimeRange() {
        return eveningTimeRange;
    }

    public void setEveningTimeRange(String eveningTimeRange) {
        this.eveningTimeRange = eveningTimeRange;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNoticeMessage() {
        return noticeMessage;
    }

    public void setNoticeMessage(String noticeMessage) {
        this.noticeMessage = noticeMessage;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
