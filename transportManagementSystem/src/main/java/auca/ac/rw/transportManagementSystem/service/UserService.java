package auca.ac.rw.transportManagementSystem.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import auca.ac.rw.transportManagementSystem.dto.LocationHierarchyResponse;
import auca.ac.rw.transportManagementSystem.dto.UserLocationResponse;
import auca.ac.rw.transportManagementSystem.model.AnnouncementReply;
import auca.ac.rw.transportManagementSystem.model.Elocation;
import auca.ac.rw.transportManagementSystem.model.Gender;
import auca.ac.rw.transportManagementSystem.model.Location;
import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.AnnouncementReplyRepository;
import auca.ac.rw.transportManagementSystem.repository.LocationRepository;
import auca.ac.rw.transportManagementSystem.repository.StudentRepository;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private LocationService locationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AnnouncementReplyRepository announcementReplyRepository;

    public String saveUser(User user) {
        if (user == null) {
            return "User cannot be null";
        }

        if (user.getFullNames() == null || user.getFullNames().trim().isEmpty()) {
            return "Full names are required";
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return "Email is required";
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return "Password is required";
        }

        String normalizedEmail = user.getEmail().trim().toLowerCase();
        
        // Check for duplicate email (case-insensitive)
        if (userRepository.existsByEmail(normalizedEmail)) {
            return "User with this email already exists";
        }

        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        try {
            userRepository.save(user);
            return "User saved successfully";
        } catch (Exception e) {
            return "Failed to save user: " + e.getMessage();
        }
    }

    public String saveUserWithLocation(User user, String locationCode) {
        if (user == null) {
            return "User cannot be null";
        }

        if (user.getFullNames() == null || user.getFullNames().trim().isEmpty()) {
            return "Full names are required";
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return "Email is required";
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return "Password is required";
        }

        String normalizedEmail = user.getEmail().trim().toLowerCase();
        
        // Check for duplicate email
        if (userRepository.existsByEmail(normalizedEmail)) {
            return "User with this email already exists";
        }

        if (locationCode != null && !locationCode.trim().isEmpty()) {
            Optional<Location> locationOptional = locationRepository.findByCode(locationCode);
            if (!locationOptional.isPresent()) {
                return "Location not found";
            }
            user.setLocation(locationOptional.get());
        }

        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        try {
            userRepository.save(user);
            return "User saved successfully";
        } catch (DataIntegrityViolationException e) {
            return "User with this email already exists (database constraint violation)";
        } catch (Exception e) {
            return "Failed to save user: " + e.getMessage();
        }
    }

    public String assignLocation(UUID userId, String locationCode) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return "Location code is required";
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return "User not found";
        }

        Optional<Location> locationOptional = locationRepository.findByCode(locationCode);
        if (!locationOptional.isPresent()) {
            return "Location not found";
        }

        User user = userOptional.get();
        user.setLocation(locationOptional.get());

        try {
            userRepository.save(user);
            return "Location assigned successfully";
        } catch (Exception e) {
            return "Failed to assign location: " + e.getMessage();
        }
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        try {
            return userRepository.findByEmail(normalizedEmail);
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                 jakarta.persistence.NonUniqueResultException e) {
            // Handle duplicate users - use first one (oldest by userId)
            log.warn("Multiple users found with email: {}. Using first result (oldest by userId).", normalizedEmail);
            List<User> users = userRepository.findByEmailList(normalizedEmail);
            if (!users.isEmpty()) {
                User firstUser = users.get(0);
                log.info("Selected user ID: {} for email: {}", firstUser.getUserId(), normalizedEmail);
                return Optional.of(firstUser);
            }
            return Optional.empty();
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByGender(Gender gender) {
        return userRepository.findByGender(gender);
    }

    public List<User> getUsersByLocation(String locationCode) {
        return userRepository.findByLocationCode(locationCode);
    }

    // Get users by location code with pagination (searches in hierarchy)
    public Page<User> getUsersByLocationCode(String locationCode, int page, int size, String sortBy, String sortDir) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByLocationCodeInHierarchy(locationCode, pageable);
    }

    // Get users by location code without pagination (searches in hierarchy)
    public List<User> getUsersByLocationCode(String locationCode) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.findByLocationCodeInHierarchy(locationCode);
    }

    public List<User> searchUsersByName(String name) {
        return userRepository.findByFullNamesContainingIgnoreCase(name);
    }

    public List<UserLocationResponse> searchUsersByNameWithLocation(String name) {
        List<User> users = userRepository.findByFullNamesContainingIgnoreCase(name);
        return users.stream()
                .map(this::toUserLocationResponse)
                .collect(Collectors.toList());
    }

    private UserLocationResponse toUserLocationResponse(User user) {
        UserLocationResponse response = new UserLocationResponse();
        response.setUserId(user.getUserId());
        response.setFullNames(user.getFullNames());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setGender(user.getGender());
        response.setRole(user.getRole());

        response.setLocation(buildLocationHierarchy(user.getLocation()));
        return response;
    }

    private LocationHierarchyResponse buildLocationHierarchy(Location location) {
        LocationHierarchyResponse hierarchy = new LocationHierarchyResponse();

        Location current = location;
        while (current != null) {
            Elocation type = current.getType();
            if (type != null) {
                switch (type) {
                    case PROVINCE:
                        hierarchy.setProvince(current.getName());
                        break;
                    case DISTRICT:
                        hierarchy.setDistrict(current.getName());
                        break;
                    case SECTOR:
                        hierarchy.setSector(current.getName());
                        break;
                    case CELL:
                        hierarchy.setCell(current.getName());
                        break;
                    case VILLAGE:
                        hierarchy.setVillage(current.getName());
                        break;
                    default:
                        break;
                }
            }
            current = current.getParent();
        }

        return hierarchy;
    }

    public String updateUser(UUID id, User updatedUser) {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (!existingUserOptional.isPresent()) {
            return "User not found";
        }

        User user = existingUserOptional.get();

        if (updatedUser.getFullNames() != null && !updatedUser.getFullNames().trim().isEmpty()) {
            user.setFullNames(updatedUser.getFullNames());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().trim().isEmpty()) {
            String normalizedNewEmail = updatedUser.getEmail().trim().toLowerCase();
            String normalizedOldEmail = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "";
            
            if (!normalizedOldEmail.equals(normalizedNewEmail) &&
                userRepository.existsByEmail(normalizedNewEmail)) {
                return "Email already exists";
            }
            user.setEmail(normalizedNewEmail);
        }

        if (updatedUser.getPhoneNumber() != null && !updatedUser.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getGender() != null) {
            user.setGender(updatedUser.getGender());
        }

        if (updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }

        try {
            userRepository.save(user);
            return "User updated successfully";
        } catch (Exception e) {
            return "Failed to update user: " + e.getMessage();
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public String deleteUser(UUID id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            return "User not found";
        }

        try {
            User user = userOptional.get();
            
            // 1. Remove user as parent from all students (set parent to null)
            List<Student> studentsWithParent = studentRepository.findByParentUserId(id);
            for (Student student : studentsWithParent) {
                student.setParent(null);
                studentRepository.save(student);
            }
            
            // 2. Remove user from all announcement replies (set user to null)
            List<AnnouncementReply> repliesWithUser = announcementReplyRepository.findByUserUserId(id);
            for (AnnouncementReply reply : repliesWithUser) {
                reply.setUser(null);
                announcementReplyRepository.save(reply);
            }
            
            // 3. Clear location relationship (optional, but good practice)
            user.setLocation(null);
            userRepository.save(user);
            
            // 4. Now delete the user
            userRepository.deleteById(id);
            
            return "User deleted successfully. " + 
                   (studentsWithParent.size() > 0 ? studentsWithParent.size() + " student(s) had their parent reference removed. " : "") +
                   (repliesWithUser.size() > 0 ? repliesWithUser.size() + " announcement reply(ies) had their user reference removed. " : "");
        } catch (Exception e) {
            return "Failed to delete user: " + e.getMessage();
        }
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Get users by province code with pagination and sorting
    public Page<User> getUsersByProvinceCode(String provinceCode, int page, int size, String sortBy, String sortDir) {
        if (provinceCode == null || provinceCode.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByProvinceCode(provinceCode, pageable);
    }

    // Get users by province code without pagination
    public List<User> getUsersByProvinceCode(String provinceCode) {
        if (provinceCode == null || provinceCode.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.findByProvinceCode(provinceCode);
    }

    // Get users by province name with pagination and sorting
    public Page<User> getUsersByProvinceName(String provinceName, int page, int size, String sortBy, String sortDir) {
        if (provinceName == null || provinceName.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByProvinceName(provinceName, pageable);
    }

    // Get users by province name without pagination
    public List<User> getUsersByProvinceName(String provinceName) {
        if (provinceName == null || provinceName.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.findByProvinceName(provinceName);
    }

    // Get province from a user (traverse location hierarchy)
    public Optional<Location> getProvinceFromUser(UUID userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent() || userOptional.get().getLocation() == null) {
            return Optional.empty();
        }
        
        Location location = userOptional.get().getLocation();
        return locationService.findProvinceFromLocation(location);
    }

    // Get province from a user by user email
    public Optional<Location> getProvinceFromUserByEmail(String email) {
        Optional<User> userOptional = getUserByEmail(email); // Use getUserByEmail which handles duplicates
        if (!userOptional.isPresent() || userOptional.get().getLocation() == null) {
            return Optional.empty();
        }
        
        Location location = userOptional.get().getLocation();
        return locationService.findProvinceFromLocation(location);
    }

    // Check if users exist for a province code
    public boolean existsByProvinceCode(String provinceCode) {
        if (provinceCode == null || provinceCode.trim().isEmpty()) {
            return false;
        }
        return userRepository.existsByProvinceCode(provinceCode);
    }

    // Check if users exist for a province name
    public boolean existsByProvinceName(String provinceName) {
        if (provinceName == null || provinceName.trim().isEmpty()) {
            return false;
        }
        return userRepository.existsByProvinceName(provinceName);
    }

    // Get all users with pagination and sorting
    public Page<User> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findAll(pageable);
    }

    // Get users by role with pagination and sorting
    public Page<User> getUsersByRole(Role role, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByRole(role, pageable);
    }

    // Get users by gender with pagination and sorting
    public Page<User> getUsersByGender(Gender gender, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByGender(gender, pageable);
    }

    // Search users by name with pagination and sorting
    public Page<User> searchUsersByName(String name, int page, int size, String sortBy, String sortDir) {
        if (name == null || name.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findByFullNamesContainingIgnoreCase(name, pageable);
    }

    // Clean up duplicate users - keeps the first one found, deletes the rest
    @org.springframework.transaction.annotation.Transactional
    public String cleanupDuplicateUsers() {
        try {
            List<User> allUsers = userRepository.findAll();
            int duplicatesRemoved = 0;
            
            // Group users by normalized email (case-insensitive)
            java.util.Map<String, List<User>> emailGroups = allUsers.stream()
                .filter(u -> u.getEmail() != null)
                .collect(Collectors.groupingBy(u -> u.getEmail().trim().toLowerCase()));
            
            // For each email group with more than one user, keep the first and delete the rest
            for (java.util.Map.Entry<String, List<User>> entry : emailGroups.entrySet()) {
                List<User> usersWithSameEmail = entry.getValue();
                if (usersWithSameEmail.size() > 1) {
                    // Keep the first user (oldest by userId or creation order)
                    User keepUser = usersWithSameEmail.get(0);
                    
                    // Delete the rest
                    for (int i = 1; i < usersWithSameEmail.size(); i++) {
                        userRepository.delete(usersWithSameEmail.get(i));
                        duplicatesRemoved++;
                    }
                }
            }
            
            if (duplicatesRemoved > 0) {
                return "Cleanup completed. Removed " + duplicatesRemoved + " duplicate user(s).";
            } else {
                return "No duplicate users found.";
            }
        } catch (Exception e) {
            return "Failed to cleanup duplicate users: " + e.getMessage();
        }
    }
}