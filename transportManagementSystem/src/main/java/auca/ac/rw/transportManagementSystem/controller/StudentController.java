package auca.ac.rw.transportManagementSystem.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.model.StudentStatus;
import auca.ac.rw.transportManagementSystem.repository.ScheduleRepository;
import auca.ac.rw.transportManagementSystem.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, 
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveStudent(@RequestBody Student student) {
        String response = studentService.saveStudent(student);
        if (response.startsWith("Student saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/assignParent")
    public ResponseEntity<String> assignParent(@RequestParam int studentId, 
                                                @RequestParam UUID parentId) {
        String response = studentService.assignParent(studentId, parentId);
        if (response.equals("Parent assigned successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/assignBus")
    public ResponseEntity<String> assignBus(@RequestParam int studentId, 
                                            @RequestParam int busId) {
        String response = studentService.assignBus(studentId, busId);
        if (response.equals("Bus assigned successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStudentStatus(@RequestParam int studentId, @RequestParam StudentStatus status) {
        String response = studentService.updateStudentStatus(studentId, status);
        if (response.equals("Student status updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // This endpoint must come before /{id} to avoid path matching conflicts
    @GetMapping("/me/info")
    public ResponseEntity<?> getMyInfo() {
        try {
            // Get current authenticated user
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            String email = userDetails.getUsername();

            Optional<Student> studentOpt;
            try {
                studentOpt = studentService.getStudentByEmail(email);
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                     jakarta.persistence.NonUniqueResultException e) {
                // Handle duplicate students
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Multiple student accounts found with this email. Please contact administrator.");
            }
            
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
            }

            Student student = studentOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("student", student);

            // Get bus info if assigned
            if (student.getBus() != null) {
                Map<String, Object> busInfo = new HashMap<>();
                busInfo.put("id", student.getBus().getId());
                busInfo.put("plateNumber", student.getBus().getPlateNumber());
                busInfo.put("capacity", student.getBus().getCapacity());

                // Get driver info if assigned
                if (student.getBus().getDriver() != null) {
                    Map<String, Object> driverInfo = new HashMap<>();
                    driverInfo.put("driverId", student.getBus().getDriver().getDriverId());
                    driverInfo.put("name", student.getBus().getDriver().getName());
                    driverInfo.put("email", student.getBus().getDriver().getEmail());
                    driverInfo.put("phoneNumber", student.getBus().getDriver().getPhoneNumber());
                    busInfo.put("driver", driverInfo);
                }

                // Get schedules for this bus
                List<Map<String, Object>> schedules = scheduleRepository.findByBus_Id(student.getBus().getId())
                        .stream()
                        .map(schedule -> {
                            Map<String, Object> scheduleMap = new HashMap<>();
                            scheduleMap.put("id", schedule.getId());
                            scheduleMap.put("dayOfWeek", schedule.getDayOfWeek());
                            scheduleMap.put("departureTime", schedule.getDepartureTime() != null ? schedule.getDepartureTime().toString() : null);
                            scheduleMap.put("arrivalTime", schedule.getArrivalTime() != null ? schedule.getArrivalTime().toString() : null);
                            if (schedule.getRoute() != null) {
                                Map<String, Object> routeInfo = new HashMap<>();
                                routeInfo.put("routeId", schedule.getRoute().getRouteId());
                                routeInfo.put("routeName", schedule.getRoute().getRouteName());
                                scheduleMap.put("route", routeInfo);
                            }
                            return scheduleMap;
                        })
                        .toList();
                busInfo.put("schedules", schedules);

                response.put("bus", busInfo);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable int id) {
        Optional<Student> student = studentService.getStudentById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<List<Student>> getStudentsByClass(@PathVariable String className) {
        List<Student> students = studentService.getStudentsByClass(className);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Student>> getStudentsByStatus(@PathVariable StudentStatus status) {
        List<Student> students = studentService.getStudentsByStatus(status);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Student>> getStudentsByParent(@PathVariable UUID parentId) {
        List<Student> students = studentService.getStudentsByParent(parentId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/bus/{busId}")
    public ResponseEntity<List<Student>> getStudentsByBus(@PathVariable int busId) {
        List<Student> students = studentService.getStudentsByBus(busId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/pickup/{pickUpPoint}")
    public ResponseEntity<List<Student>> getStudentsByPickUpPoint(@PathVariable String pickUpPoint) {
        List<Student> students = studentService.getStudentsByPickUpPoint(pickUpPoint);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/dropoff/{dropOffPoint}")
    public ResponseEntity<List<Student>> getStudentsByDropOffPoint(@PathVariable String dropOffPoint) {
        List<Student> students = studentService.getStudentsByDropOffPoint(dropOffPoint);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String name) {
        List<Student> students = studentService.searchStudentsByName(name);
        return ResponseEntity.ok(students);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStudent(@PathVariable int id, 
                                                 @RequestBody Student student) {
        try {
            if (student == null) {
                return ResponseEntity.badRequest().body("Student data is required");
            }
            
            String response = studentService.updateStudent(id, student);
            if (response.equals("Student updated successfully")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating student: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable int id) {
        String response = studentService.deleteStudent(id);
        if (response.equals("Student deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Student>> getAllStudentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Student> students = studentService.getAllStudents(page, size, sortBy, sortDir);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/status/{status}/paginated")
    public ResponseEntity<Page<Student>> getStudentsByStatusPaginated(
            @PathVariable StudentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Student> students = studentService.getStudentsByStatus(status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/search/paginated")
    public ResponseEntity<Page<Student>> searchStudentsPaginated(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Student> students = studentService.searchStudents(searchTerm, page, size, sortBy, sortDir);
        return ResponseEntity.ok(students);
    }

    // Get students by location code with pagination (searches in hierarchy)
    @GetMapping("/location/{locationCode}/paginated")
    public ResponseEntity<Page<Student>> getStudentsByLocationCodePaginated(
            @PathVariable String locationCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Student> students = studentService.getStudentsByLocationCode(locationCode, page, size, sortBy, sortDir);
        return ResponseEntity.ok(students);
    }

    // Get students by location code without pagination (searches in hierarchy)
    @GetMapping("/location/{locationCode}/list")
    public ResponseEntity<List<Student>> getStudentsByLocationCodeList(@PathVariable String locationCode) {
        List<Student> students = studentService.getStudentsByLocationCode(locationCode);
        return ResponseEntity.ok(students);
    }
}