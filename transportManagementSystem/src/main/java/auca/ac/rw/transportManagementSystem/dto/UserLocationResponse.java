package auca.ac.rw.transportManagementSystem.dto;

import java.util.UUID;

import auca.ac.rw.transportManagementSystem.model.Gender;
import auca.ac.rw.transportManagementSystem.model.Role;

public class UserLocationResponse {
    private UUID userId;
    private String fullNames;
    private String email;
    private String phoneNumber;
    private Gender gender;
    private Role role;
    private LocationHierarchyResponse location;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFullNames() {
        return fullNames;
    }

    public void setFullNames(String fullNames) {
        this.fullNames = fullNames;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocationHierarchyResponse getLocation() {
        return location;
    }

    public void setLocation(LocationHierarchyResponse location) {
        this.location = location;
    }
}

