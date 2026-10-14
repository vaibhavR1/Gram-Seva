package com.gramseva.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizens")
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "panchayat_id")
    private Panchayat panchayat;

    @Column(name = "aadhar_masked", length = 20)
    private String aadharMasked;

    @Column(name = "ration_card_number", length = 40)
    private String rationCardNumber;

    @Column(name = "ward_number", nullable = false, length = 20)
    private String wardNumber;

    @Column(name = "house_number", length = 30)
    private String houseNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 80)
    private String occupation;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Citizen() {
    }

    public Citizen(User user, Panchayat panchayat, String aadharMasked, String rationCardNumber,
                   String wardNumber, String houseNumber, String address, String gender,
                   LocalDate dateOfBirth, String occupation) {
        this.user = user;
        this.panchayat = panchayat;
        this.aadharMasked = aadharMasked;
        this.rationCardNumber = rationCardNumber;
        this.wardNumber = wardNumber;
        this.houseNumber = houseNumber;
        this.address = address;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.occupation = occupation;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Panchayat getPanchayat() {
        return panchayat;
    }

    public void setPanchayat(Panchayat panchayat) {
        this.panchayat = panchayat;
    }

    public String getAadharMasked() {
        return aadharMasked;
    }

    public void setAadharMasked(String aadharMasked) {
        this.aadharMasked = aadharMasked;
    }

    public String getRationCardNumber() {
        return rationCardNumber;
    }

    public void setRationCardNumber(String rationCardNumber) {
        this.rationCardNumber = rationCardNumber;
    }

    public String getWardNumber() {
        return wardNumber;
    }

    public void setWardNumber(String wardNumber) {
        this.wardNumber = wardNumber;
    }

    public String getHouseNumber() {
        return houseNumber;
    }

    public void setHouseNumber(String houseNumber) {
        this.houseNumber = houseNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
