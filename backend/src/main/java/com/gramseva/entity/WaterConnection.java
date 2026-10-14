package com.gramseva.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_connections")
public class WaterConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "connection_number", nullable = false, unique = true, length = 60)
    private String connectionNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id")
    private Property property;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "panchayat_id")
    private Panchayat panchayat;

    @Column(name = "connection_type", nullable = false, length = 30)
    private String connectionType = "DOMESTIC"; // DOMESTIC, COMMERCIAL, COMMUNITY

    @Column(name = "pipe_size_mm")
    private Integer pipeSizeMm = 15; // standard 1/2 inch = 15mm

    @Column(name = "monthly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyRate;

    @Column(name = "meter_number", length = 50)
    private String meterNumber;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, DISCONNECTED

    @Column(name = "installed_date")
    private LocalDate installedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WaterConnection() {
    }

    public WaterConnection(String connectionNumber, Property property, Citizen citizen, Panchayat panchayat,
                           String connectionType, Integer pipeSizeMm, BigDecimal monthlyRate,
                           String meterNumber, String status, LocalDate installedDate) {
        this.connectionNumber = connectionNumber;
        this.property = property;
        this.citizen = citizen;
        this.panchayat = panchayat;
        this.connectionType = connectionType;
        this.pipeSizeMm = pipeSizeMm;
        this.monthlyRate = monthlyRate;
        this.meterNumber = meterNumber;
        this.status = status;
        this.installedDate = installedDate;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConnectionNumber() {
        return connectionNumber;
    }

    public void setConnectionNumber(String connectionNumber) {
        this.connectionNumber = connectionNumber;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public Citizen getCitizen() {
        return citizen;
    }

    public void setCitizen(Citizen citizen) {
        this.citizen = citizen;
    }

    public Panchayat getPanchayat() {
        return panchayat;
    }

    public void setPanchayat(Panchayat panchayat) {
        this.panchayat = panchayat;
    }

    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }

    public Integer getPipeSizeMm() {
        return pipeSizeMm;
    }

    public void setPipeSizeMm(Integer pipeSizeMm) {
        this.pipeSizeMm = pipeSizeMm;
    }

    public BigDecimal getMonthlyRate() {
        return monthlyRate;
    }

    public void setMonthlyRate(BigDecimal monthlyRate) {
        this.monthlyRate = monthlyRate;
    }

    public String getMeterNumber() {
        return meterNumber;
    }

    public void setMeterNumber(String meterNumber) {
        this.meterNumber = meterNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getInstalledDate() {
        return installedDate;
    }

    public void setInstalledDate(LocalDate installedDate) {
        this.installedDate = installedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
