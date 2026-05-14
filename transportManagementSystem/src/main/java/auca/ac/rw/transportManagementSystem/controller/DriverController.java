package auca.ac.rw.transportManagementSystem.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.Driver;
import auca.ac.rw.transportManagementSystem.model.Schedule;
import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.repository.BusRepository;
import auca.ac.rw.transportManagementSystem.repository.ScheduleRepository;
import auca.ac.rw.transportManagementSystem.repository.StudentRepository;
import auca.ac.rw.transportManagementSystem.service.DriverService;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, 
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveDriver(@RequestBody Driver driver) {
        String response = driverService.saveDriver(driver);
        if (response.startsWith("Driver saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // Specific endpoints must come before parameterized ones
    @GetMapping("/me/stats")
    public ResponseEntity<?> getDriverStats() {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null || !(principal instanceof UserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }

            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername();

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email not found in token");
            }

            Optional<Driver> driverOpt = driverService.getDriverByEmail(email);
            if (driverOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "schedulesCount", 0,
                    "studentsCount", 0,
                    "message", "Driver not found or not assigned to a bus"
                ));
            }

            Driver driver = driverOpt.get();
            Optional<Bus> busOpt = busRepository.findByDriverDriverId(driver.getDriverId());
            
            if (busOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "schedulesCount", 0,
                    "studentsCount", 0,
                    "message", "No bus assigned"
                ));
            }

            Bus bus = busOpt.get();
            int schedulesCount = scheduleRepository.findByBus_Id(bus.getId()).size();
            int studentsCount = studentRepository.findByBusId(bus.getId()).size();

            return ResponseEntity.ok(Map.of(
                "schedulesCount", schedulesCount,
                "studentsCount", studentsCount
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching stats: " + e.getMessage()));
        }
    }

    @GetMapping("/me/students")
    public ResponseEntity<?> getMyStudents() {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null || !(principal instanceof UserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }

            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername();

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email not found in token");
            }

            Optional<Driver> driverOpt = driverService.getDriverByEmail(email);
            if (driverOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            Driver driver = driverOpt.get();
            Optional<Bus> busOpt = busRepository.findByDriverDriverId(driver.getDriverId());
            
            if (busOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            Bus bus = busOpt.get();
            List<Student> students = studentRepository.findByBusId(bus.getId());

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching students: " + e.getMessage());
        }
    }

    @GetMapping("/me/schedules")
    public ResponseEntity<?> getMySchedules() {
        try {
            // Get current authenticated user
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null || !(principal instanceof UserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }

            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername();

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email not found in token");
            }

            Optional<Driver> driverOpt = driverService.getDriverByEmail(email);
            if (driverOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "bus", null,
                    "schedules", Collections.emptyList(),
                    "message", "Driver not found"
                ));
            }

            Driver driver = driverOpt.get();
            Optional<Bus> busOpt = busRepository.findByDriverDriverId(driver.getDriverId());
            
            if (busOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "bus", null,
                    "schedules", Collections.emptyList(),
                    "message", "No bus assigned to this driver"
                ));
            }

            Bus bus = busOpt.get();
            List<Schedule> schedules = scheduleRepository.findByBus_Id(bus.getId());

            // Return both bus info and schedules
            Map<String, Object> response = new HashMap<>();
            response.put("bus", bus);
            response.put("schedules", schedules);
            response.put("message", schedules.isEmpty() ? "No schedules found for this bus" : "Schedules retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching schedules: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Driver>> searchDrivers(@RequestParam String name) {
        List<Driver> drivers = driverService.searchDriversByName(name);
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/experience/{minYears}")
    public ResponseEntity<List<Driver>> getDriversByExperience(@PathVariable int minYears) {
        List<Driver> drivers = driverService.getDriversByExperience(minYears);
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/license/{licenseNumber}")
    public ResponseEntity<?> getDriverByLicenseNumber(@PathVariable String licenseNumber) {
        Optional<Driver> driver = driverService.getDriverByLicenseNumber(licenseNumber);
        if (driver.isPresent()) {
            return ResponseEntity.ok(driver.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Driver not found");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriverById(@PathVariable int id) {
        Optional<Driver> driver = driverService.getDriverById(id);
        if (driver.isPresent()) {
            return ResponseEntity.ok(driver.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Driver not found");
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateDriver(@PathVariable int id, 
                                                @RequestBody Driver driver) {
        String response = driverService.updateDriver(id, driver);
        if (response.equals("Driver updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDriver(@PathVariable int id) {
        String response = driverService.deleteDriver(id);
        if (response.equals("Driver deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/exists/{licenseNumber}")
    public ResponseEntity<Boolean> checkExists(@PathVariable String licenseNumber) {
        boolean exists = driverService.existsByLicenseNumber(licenseNumber);
        return ResponseEntity.ok(exists);
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Driver>> getAllDriversPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Driver> drivers = driverService.getAllDrivers(page, size, sortBy, sortDir);
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/search/paginated")
    public ResponseEntity<Page<Driver>> searchDriversPaginated(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Driver> drivers = driverService.searchDrivers(searchTerm, page, size, sortBy, sortDir);
        return ResponseEntity.ok(drivers);
    }
}