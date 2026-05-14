package auca.ac.rw.transportManagementSystem.dto;

import auca.ac.rw.transportManagementSystem.model.OtpPurpose;

public class PasswordOtpRequest {
    private String email;
    private OtpPurpose purpose;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }
}

