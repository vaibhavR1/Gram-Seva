package com.gramseva.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "panchayats")
public class Panchayat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String taluka;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "pin_code", nullable = false, length = 10)
    private String pinCode;

    @Column(name = "office_address", length = 255)
    private String officeAddress;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 25)
    private String contactPhone;

    @Column(name = "sarpanch_name", length = 120)
    private String sarpanchName;

    @Column(name = "village_population")
    private Integer villagePopulation;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Panchayat() {
    }

    public Panchayat(String name, String taluka, String district, String state, String pinCode,
                     String officeAddress, String contactEmail, String contactPhone,
                     String sarpanchName, Integer villagePopulation) {
        this.name = name;
        this.taluka = taluka;
        this.district = district;
        this.state = state;
        this.pinCode = pinCode;
        this.officeAddress = officeAddress;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.sarpanchName = sarpanchName;
        this.villagePopulation = villagePopulation;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTaluka() {
        return taluka;
    }

    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public String getOfficeAddress() {
        return officeAddress;
    }

    public void setOfficeAddress(String officeAddress) {
        this.officeAddress = officeAddress;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getSarpanchName() {
        return sarpanchName;
    }

    public void setSarpanchName(String sarpanchName) {
        this.sarpanchName = sarpanchName;
    }

    public Integer getVillagePopulation() {
        return villagePopulation;
    }

    public void setVillagePopulation(Integer villagePopulation) {
        this.villagePopulation = villagePopulation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
