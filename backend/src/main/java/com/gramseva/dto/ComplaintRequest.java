package com.gramseva.dto;

import jakarta.validation.constraints.NotBlank;

public class ComplaintRequest {

    @NotBlank(message = "Category is required")
    private String category; // WATER_SUPPLY, STREET_LIGHT, SANITATION_DRAINAGE, ROAD_REPAIR, PROPERTY_TAX, OTHER

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Ward number is required")
    private String wardNumber;

    private String photoUrl;
    private String priority = "MEDIUM";

    public ComplaintRequest() {
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWardNumber() {
        return wardNumber;
    }

    public void setWardNumber(String wardNumber) {
        this.wardNumber = wardNumber;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
