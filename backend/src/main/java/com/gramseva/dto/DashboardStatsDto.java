package com.gramseva.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private long totalCitizens;
    private long totalProperties;
    private long totalWaterConnections;
    private long totalBills;
    private long paidBills;
    private long pendingBills;
    private BigDecimal totalDemand;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;
    private long totalComplaints;
    private long resolvedComplaints;
    private long activeComplaints;
    private long activeAnnouncements;

    public DashboardStatsDto() {
    }

    public long getTotalCitizens() {
        return totalCitizens;
    }

    public void setTotalCitizens(long totalCitizens) {
        this.totalCitizens = totalCitizens;
    }

    public long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public long getTotalWaterConnections() {
        return totalWaterConnections;
    }

    public void setTotalWaterConnections(long totalWaterConnections) {
        this.totalWaterConnections = totalWaterConnections;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public long getPaidBills() {
        return paidBills;
    }

    public void setPaidBills(long paidBills) {
        this.paidBills = paidBills;
    }

    public long getPendingBills() {
        return pendingBills;
    }

    public void setPendingBills(long pendingBills) {
        this.pendingBills = pendingBills;
    }

    public BigDecimal getTotalDemand() {
        return totalDemand;
    }

    public void setTotalDemand(BigDecimal totalDemand) {
        this.totalDemand = totalDemand;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public BigDecimal getTotalOutstanding() {
        return totalOutstanding;
    }

    public void setTotalOutstanding(BigDecimal totalOutstanding) {
        this.totalOutstanding = totalOutstanding;
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getActiveComplaints() {
        return activeComplaints;
    }

    public void setActiveComplaints(long activeComplaints) {
        this.activeComplaints = activeComplaints;
    }

    public long getActiveAnnouncements() {
        return activeAnnouncements;
    }

    public void setActiveAnnouncements(long activeAnnouncements) {
        this.activeAnnouncements = activeAnnouncements;
    }
}
