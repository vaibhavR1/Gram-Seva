package com.gramseva.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_number", nullable = false, unique = true, length = 60)
    private String propertyNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "panchayat_id")
    private Panchayat panchayat;

    @Column(name = "property_type", nullable = false, length = 40)
    private String propertyType; // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, OPEN_PLOT

    @Column(name = "construction_area_sqft")
    private Double constructionAreaSqFt;

    @Column(name = "plot_area_sqft")
    private Double plotAreaSqFt;

    @Column(name = "ward_number", nullable = false, length = 20)
    private String wardNumber;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "annual_tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal annualTaxAmount;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, UNDER_VERIFICATION, DEMOLISHED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Property() {
    }

    public Property(String propertyNumber, Citizen owner, Panchayat panchayat, String propertyType,
                    Double constructionAreaSqFt, Double plotAreaSqFt, String wardNumber,
                    String address, BigDecimal annualTaxAmount, String status) {
        this.propertyNumber = propertyNumber;
        this.owner = owner;
        this.panchayat = panchayat;
        this.propertyType = propertyType;
        this.constructionAreaSqFt = constructionAreaSqFt;
        this.plotAreaSqFt = plotAreaSqFt;
        this.wardNumber = wardNumber;
        this.address = address;
        this.annualTaxAmount = annualTaxAmount;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPropertyNumber() {
        return propertyNumber;
    }

    public void setPropertyNumber(String propertyNumber) {
        this.propertyNumber = propertyNumber;
    }

    public Citizen getOwner() {
        return owner;
    }

    public void setOwner(Citizen owner) {
        this.owner = owner;
    }

    public Panchayat getPanchayat() {
        return panchayat;
    }

    public void setPanchayat(Panchayat panchayat) {
        this.panchayat = panchayat;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public Double getConstructionAreaSqFt() {
        return constructionAreaSqFt;
    }

    public void setConstructionAreaSqFt(Double constructionAreaSqFt) {
        this.constructionAreaSqFt = constructionAreaSqFt;
    }

    public Double getPlotAreaSqFt() {
        return plotAreaSqFt;
    }

    public void setPlotAreaSqFt(Double plotAreaSqFt) {
        this.plotAreaSqFt = plotAreaSqFt;
    }

    public String getWardNumber() {
        return wardNumber;
    }

    public void setWardNumber(String wardNumber) {
        this.wardNumber = wardNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getAnnualTaxAmount() {
        return annualTaxAmount;
    }

    public void setAnnualTaxAmount(BigDecimal annualTaxAmount) {
        this.annualTaxAmount = annualTaxAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
