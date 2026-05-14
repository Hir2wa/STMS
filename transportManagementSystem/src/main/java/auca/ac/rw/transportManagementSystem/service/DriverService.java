package auca.ac.rw.transportManagementSystem.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import auca.ac.rw.transportManagementSystem.model.Driver;
import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.DriverRepository;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Transactional
    public String saveDriver(Driver driver) {
        if (driver == null) {
            return "Driver cannot be null";
        }

        if (driver.getName() == null || driver.getName().trim().isEmpty()) {
            return "Driver name is required";
        }

        if (driver.getEmail() == null || driver.getEmail().trim().isEmpty()) {
            return "Driver email is required";
        }

        if (driver.getLicenseNumber() == null || driver.getLicenseNumber().trim().isEmpty()) {
            return "License number is required";
        }

        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            return "Driver with this license number already exists";
        }

        String normalizedEmail = driver.getEmail().trim().toLowerCase();

        if (driverRepository.existsByEmail(normalizedEmail)) {
            return "Driver with this email already exists";
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            return "User with this email already exists";
        }

        try {
            // Create login account for driver
            User user = new User();
            user.setFullNames(driver.getName());
            user.setEmail(normalizedEmail);
            user.setPhoneNumber(driver.getPhoneNumber());
            user.setRole(Role.DRIVER);

            // Temporary random password; user will set a real one via OTP
            String tempPassword = UUID.randomUUID().toString();
            user.setPassword(passwordEncoder.encode(tempPassword));
            
            try {
                userRepository.save(user);
            } catch (DataIntegrityViolationException e) {
                return "User with this email already exists (database constraint violation)";
            }

            // Save driver record (store normalized email)
            driver.setEmail(normalizedEmail);
            
            try {
                driverRepository.save(driver);
            } catch (DataIntegrityViolationException e) {
                // If driver save fails due to constraint, rollback user creation
                userRepository.delete(user);
                return "Driver with this email already exists (database constraint violation)";
            }

            // Send OTP for password setup (valid 5 minutes)
            try {
                otpService.sendPasswordOtp(normalizedEmail, OtpPurpose.PASSWORD_SETUP);
                return "Driver saved successfully. OTP sent to " + normalizedEmail;
            } catch (Exception emailException) {
                // Driver is saved, but email failed - return warning
                return "Driver saved successfully, but failed to send OTP email: " + emailException.getMessage() + ". Please configure email settings.";
            }
        } catch (DataIntegrityViolationException e) {
            return "Driver or user with this email already exists. Please use a different email.";
        } catch (Exception e) {
            return "Failed to save driver: " + e.getMessage();
        }
    }

    public Optional<Driver> getDriverById(int id) {
        return driverRepository.findById(id);
    }

    public Optional<Driver> getDriverByLicenseNumber(String licenseNumber) {
        if (licenseNumber == null || licenseNumber.trim().isEmpty()) {
            return Optional.empty();
        }
        return driverRepository.findByLicenseNumber(licenseNumber);
    }

    public Optional<Driver> getDriverByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return driverRepository.findByEmail(email.trim().toLowerCase());
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getDriversByExperience(int minYears) {
        return driverRepository.findByExperienceYearsGreaterThanEqual(minYears);
    }

    public List<Driver> searchDriversByName(String name) {
        return driverRepository.findByNameContainingIgnoreCase(name);
    }

    public String updateDriver(int id, Driver updatedDriver) {
        Optional<Driver> existingDriverOptional = driverRepository.findById(id);
        if (!existingDriverOptional.isPresent()) {
            return "Driver not found";
        }

        Driver driver = existingDriverOptional.get();

        if (updatedDriver.getName() != null && !updatedDriver.getName().trim().isEmpty()) {
            driver.setName(updatedDriver.getName());
        }

        if (updatedDriver.getLicenseNumber() != null && !updatedDriver.getLicenseNumber().trim().isEmpty()) {
            if (!driver.getLicenseNumber().equals(updatedDriver.getLicenseNumber()) &&
                driverRepository.existsByLicenseNumber(updatedDriver.getLicenseNumber())) {
                return "License number already exists";
            }
            driver.setLicenseNumber(updatedDriver.getLicenseNumber());
        }

        if (updatedDriver.getEmail() != null && !updatedDriver.getEmail().trim().isEmpty()) {
            String newEmail = updatedDriver.getEmail().trim().toLowerCase();
            if (driver.getEmail() == null || !driver.getEmail().equalsIgnoreCase(newEmail)) {
                if (driverRepository.existsByEmail(newEmail)) {
                    return "Driver email already exists";
                }
                if (userRepository.existsByEmail(newEmail)) {
                    return "User with this email already exists";
                }
                driver.setEmail(newEmail);
            }
        }

        if (updatedDriver.getPhoneNumber() != null && !updatedDriver.getPhoneNumber().trim().isEmpty()) {
            driver.setPhoneNumber(updatedDriver.getPhoneNumber());
        }

        if (updatedDriver.getExperienceYears() > 0) {
            driver.setExperienceYears(updatedDriver.getExperienceYears());
        }

        try {
            driverRepository.save(driver);
            return "Driver updated successfully";
        } catch (Exception e) {
            return "Failed to update driver: " + e.getMessage();
        }
    }

    public String deleteDriver(int id) {
        Optional<Driver> driverOptional = driverRepository.findById(id);
        if (!driverOptional.isPresent()) {
            return "Driver not found";
        }

        Driver driver = driverOptional.get();
        if (driver.getBus() != null) {
            return "Cannot delete driver assigned to a bus";
        }

        try {
            driverRepository.deleteById(id);
            return "Driver deleted successfully";
        } catch (Exception e) {
            return "Failed to delete driver: " + e.getMessage();
        }
    }

    public boolean existsByLicenseNumber(String licenseNumber) {
        return driverRepository.existsByLicenseNumber(licenseNumber);
    }

    // Pagination methods
    public Page<Driver> getAllDrivers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return driverRepository.findAll(pageable);
    }

    public Page<Driver> searchDrivers(String searchTerm, int page, int size, String sortBy, String sortDir) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String term = searchTerm.trim();
        // Search across name, email, and licenseNumber
        if (term.contains("@")) {
            return driverRepository.findByEmailContainingIgnoreCase(term, pageable);
        } else if (term.matches(".*[A-Z].*")) {
            // Likely license number if contains uppercase
            return driverRepository.findByLicenseNumberContainingIgnoreCase(term, pageable);
        } else {
            return driverRepository.findByNameContainingIgnoreCase(term, pageable);
        }
    }
}