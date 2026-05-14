package auca.ac.rw.transportManagementSystem.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.Location;
import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.model.StudentStatus;
import auca.ac.rw.transportManagementSystem.model.OtpPurpose;
import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.BusRepository;
import auca.ac.rw.transportManagementSystem.repository.LocationRepository;
import auca.ac.rw.transportManagementSystem.repository.StudentRepository;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;

@Service
public class StudentService {
    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Transactional
    public String saveStudent(Student student) {
        if (student == null) {
            return "Student cannot be null";
        }

        if (student.getName() == null || student.getName().trim().isEmpty()) {
            return "Student name is required";
        }

        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            return "Student email is required";
        }

        if (student.getClassName() == null || student.getClassName().trim().isEmpty()) {
            return "Class name is required";
        }

        // Default status if missing
        if (student.getStatus() == null) {
            student.setStatus(StudentStatus.ABSENT);
        }

        // Require a location (village) for student registration
        if (student.getLocation() == null || student.getLocation().getCode() == null
                || student.getLocation().getCode().trim().isEmpty()) {
            return "Student location is required";
        }

        Optional<Location> locationOpt = locationRepository.findByCode(student.getLocation().getCode());
        if (!locationOpt.isPresent()) {
            return "Location not found";
        }
        student.setLocation(locationOpt.get());

        try {
            String normalizedEmail = student.getEmail().trim().toLowerCase();

            // Check if student with this email already exists
            Optional<Student> existingStudent = studentRepository.findByEmail(normalizedEmail);
            if (existingStudent.isPresent()) {
                return "Student with this email already exists";
            }

            // Check if user with this email already exists
            if (userRepository.existsByEmail(normalizedEmail)) {
                return "User with this email already exists";
            }

            // Create login account for student
            User user = new User();
            user.setFullNames(student.getName());
            user.setEmail(normalizedEmail);
            user.setRole(Role.STUDENT);
            user.setLocation(student.getLocation());

            // Temporary random password; user will set a real one via OTP
            String tempPassword = UUID.randomUUID().toString();
            user.setPassword(passwordEncoder.encode(tempPassword));
            
            try {
                userRepository.save(user);
            } catch (DataIntegrityViolationException e) {
                // Database constraint violation (e.g., unique constraint on email)
                return "User with this email already exists (database constraint violation)";
            }

            // Store normalized email on the student record
            student.setEmail(normalizedEmail);
            
            try {
                studentRepository.save(student);
            } catch (DataIntegrityViolationException e) {
                // If student save fails due to constraint, rollback user creation
                userRepository.delete(user);
                return "Student with this email already exists (database constraint violation)";
            }

            // Send OTP for password setup (valid 5 minutes)
            try {
                otpService.sendPasswordOtp(normalizedEmail, OtpPurpose.PASSWORD_SETUP);
                return "Student saved successfully. OTP sent to " + normalizedEmail;
            } catch (Exception emailException) {
                // Student is saved, but email failed - return warning
                return "Student saved successfully, but failed to send OTP email: " + emailException.getMessage() + ". Please configure email settings.";
            }
        } catch (DataIntegrityViolationException e) {
            // Catch any database constraint violations
            return "Student or user with this email already exists. Please use a different email.";
        } catch (Exception e) {
            return "Failed to save student: " + e.getMessage();
        }
    }
    
    public String assignParent(int studentId, UUID parentId) {
        if (parentId == null) {
            return "Parent ID is required";
        }

        Optional<Student> studentOptional = studentRepository.findById(studentId);
        if (!studentOptional.isPresent()) {
            return "Student not found";
        }

        Optional<User> parentOptional = userRepository.findById(parentId);
        if (!parentOptional.isPresent()) {
            return "Parent not found";
        }

        Student student = studentOptional.get();
        student.setParent(parentOptional.get());

        try {
            studentRepository.save(student);
            return "Parent assigned successfully";
        } catch (Exception e) {
            return "Failed to assign parent: " + e.getMessage();
        }
    }

    public String assignBus(int studentId, int busId) {
        Optional<Student> studentOptional = studentRepository.findById(studentId);
        if (!studentOptional.isPresent()) {
            return "Student not found";
        }

        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Student student = studentOptional.get();
        student.setBus(busOptional.get());

        try {
            studentRepository.save(student);
            return "Bus assigned successfully";
        } catch (Exception e) {
            return "Failed to assign bus: " + e.getMessage();
        }
    }

    public String updateStudentStatus(int studentId, StudentStatus status) {
        if (status == null) {
            return "Status cannot be null";
        }

        Optional<Student> studentOptional = studentRepository.findById(studentId);
        if (!studentOptional.isPresent()) {
            return "Student not found";
        }

        Student student = studentOptional.get();
        student.setStatus(status);

        try {
            studentRepository.save(student);
            return "Student status updated successfully";
        } catch (Exception e) {
            return "Failed to update status: " + e.getMessage();
        }
    }

    public Optional<Student> getStudentById(int id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        try {
            return studentRepository.findByEmail(normalizedEmail);
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                 jakarta.persistence.NonUniqueResultException e) {
            // Handle duplicate students - use first one (oldest by id)
            log.warn("Multiple students found with email: {}. Using first result (oldest by id).", normalizedEmail);
            List<Student> students = studentRepository.findByEmailList(normalizedEmail);
            if (!students.isEmpty()) {
                Student firstStudent = students.get(0);
                log.info("Selected student ID: {} for email: {}", firstStudent.getId(), normalizedEmail);
                return Optional.of(firstStudent);
            }
            return Optional.empty();
        }
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className);
    }

    public List<Student> getStudentsByStatus(StudentStatus status) {
        return studentRepository.findByStatus(status);
    }

    public List<Student> getStudentsByParent(UUID parentId) {
        return studentRepository.findByParentUserId(parentId);
    }

    public List<Student> getStudentsByBus(int busId) {
        return studentRepository.findByBusId(busId);
    }

    public List<Student> getStudentsByPickUpPoint(String pickUpPoint) {
        return studentRepository.findByPickUpPoint(pickUpPoint);
    }

    public List<Student> getStudentsByDropOffPoint(String dropOffPoint) {
        return studentRepository.findByDropOffPoint(dropOffPoint);
    }

    public List<Student> searchStudentsByName(String name) {
        return studentRepository.findByNameContainingIgnoreCase(name);
    }

    // Get students by location code with pagination (searches in hierarchy)
    public Page<Student> getStudentsByLocationCode(String locationCode, int page, int size, String sortBy, String sortDir) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findByLocationCodeInHierarchy(locationCode, pageable);
    }

    // Get students by location code without pagination (searches in hierarchy)
    public List<Student> getStudentsByLocationCode(String locationCode) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return List.of();
        }
        return studentRepository.findByLocationCodeInHierarchy(locationCode);
    }

    @Transactional
    public String updateStudent(int id, Student updatedStudent) {
        Optional<Student> existingStudentOptional = studentRepository.findById(id);
        if (!existingStudentOptional.isPresent()) {
            return "Student not found";
        }

        Student student = existingStudentOptional.get();
        String oldEmail = student.getEmail();

        if (updatedStudent.getName() != null && !updatedStudent.getName().trim().isEmpty()) {
            student.setName(updatedStudent.getName());
        }

        if (updatedStudent.getClassName() != null && !updatedStudent.getClassName().trim().isEmpty()) {
            student.setClassName(updatedStudent.getClassName());
        }

        if (updatedStudent.getPickUpPoint() != null) {
            student.setPickUpPoint(updatedStudent.getPickUpPoint());
        }

        if (updatedStudent.getDropOffPoint() != null) {
            student.setDropOffPoint(updatedStudent.getDropOffPoint());
        }

        if (updatedStudent.getStatus() != null) {
            student.setStatus(updatedStudent.getStatus());
        }

        if (updatedStudent.getLocation() != null && updatedStudent.getLocation().getCode() != null
                && !updatedStudent.getLocation().getCode().trim().isEmpty()) {
            Optional<Location> locationOpt = locationRepository.findByCode(updatedStudent.getLocation().getCode());
            if (!locationOpt.isPresent()) {
                return "Location not found";
            }
            student.setLocation(locationOpt.get());
        }

        // Handle email update - but email should not be changed for students
        // If email is provided and different, check if it's already taken
        if (updatedStudent.getEmail() != null && !updatedStudent.getEmail().trim().isEmpty()) {
            String newEmail = updatedStudent.getEmail().trim().toLowerCase();
            if (!newEmail.equals(oldEmail)) {
                // Email change is not allowed for students to prevent issues
                // But if it's the same email (normalized), allow it
                if (userRepository.existsByEmail(newEmail) && !newEmail.equals(oldEmail)) {
                    return "Email already exists. Email cannot be changed for existing students.";
                }
            }
        }

        try {
            studentRepository.save(student);
            return "Student updated successfully";
        } catch (Exception e) {
            return "Failed to update student: " + e.getMessage();
        }
    }

    @Transactional
    public String deleteStudent(int id) {
        Optional<Student> studentOptional = studentRepository.findById(id);
        if (!studentOptional.isPresent()) {
            return "Student not found";
        }

        Student student = studentOptional.get();
        String email = student.getEmail();

        try {
            // Delete the student record first
            studentRepository.deleteById(id);
            
            // Also delete the associated User record if it exists
            if (email != null && !email.trim().isEmpty()) {
                Optional<User> userOptional = userRepository.findByEmail(email.trim().toLowerCase());
                if (userOptional.isPresent()) {
                    userRepository.delete(userOptional.get());
                }
            }
            
            return "Student deleted successfully";
        } catch (Exception e) {
            return "Failed to delete student: " + e.getMessage();
        }
    }

    // Pagination methods
    public Page<Student> getAllStudents(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findAll(pageable);
    }

    public Page<Student> getStudentsByStatus(StudentStatus status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findByStatus(status, pageable);
    }

    public Page<Student> searchStudents(String searchTerm, int page, int size, String sortBy, String sortDir) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String term = searchTerm.trim();
        // Search across name, email, and className
        if (term.contains("@")) {
            return studentRepository.findByEmailContainingIgnoreCase(term, pageable);
        } else {
            // Try name first, then className
            Page<Student> nameResults = studentRepository.findByNameContainingIgnoreCase(term, pageable);
            if (nameResults.hasContent()) {
                return nameResults;
            }
            return studentRepository.findByClassNameContainingIgnoreCase(term, pageable);
        }
    }
}