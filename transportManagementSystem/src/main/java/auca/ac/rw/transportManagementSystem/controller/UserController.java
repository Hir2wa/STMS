package auca.ac.rw.transportManagementSystem.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Gender;
import auca.ac.rw.transportManagementSystem.model.Location;
import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.dto.UserLocationResponse;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, 
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveUser(@RequestBody User user) {
        String response = userService.saveUser(user);
        if (response.equals("User saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/saveWithLocation", consumes = MediaType.APPLICATION_JSON_VALUE, 
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveUserWithLocation(@RequestBody User user, 
                                                        @RequestParam String locationCode) {
        String response = userService.saveUserWithLocation(user, locationCode);
        if (response.equals("User saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/assignLocation")
    public ResponseEntity<String> assignLocation(@RequestParam UUID userId, 
                                                  @RequestParam String locationCode) {
        String response = userService.assignLocation(userId, locationCode);
        if (response.equals("Location assigned successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/allPaginated")
    public ResponseEntity<Page<User>> getAllUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullNames") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<User> users = userService.getAllUsers(page, size, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/gender/{gender}")
    public ResponseEntity<List<User>> getUsersByGender(@PathVariable Gender gender) {
        List<User> users = userService.getUsersByGender(gender);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/location/{locationCode}")
    public ResponseEntity<List<User>> getUsersByLocation(@PathVariable String locationCode) {
        List<User> users = userService.getUsersByLocation(locationCode);
        return ResponseEntity.ok(users);
    }

    // Get users by location code with pagination (searches in hierarchy)
    @GetMapping("/location/{locationCode}/paginated")
    public ResponseEntity<Page<User>> getUsersByLocationCodePaginated(
            @PathVariable String locationCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullNames") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<User> users = userService.getUsersByLocationCode(locationCode, page, size, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    // Get users by location code without pagination (searches in hierarchy)
    @GetMapping("/location/{locationCode}/list")
    public ResponseEntity<List<User>> getUsersByLocationCodeList(@PathVariable String locationCode) {
        List<User> users = userService.getUsersByLocationCode(locationCode);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserLocationResponse>> searchUsers(@RequestParam String name) {
        List<UserLocationResponse> users = userService.searchUsersByNameWithLocation(name);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestParam String id, 
                                          @RequestBody User user) {
        UUID userId = UUID.fromString(id);
        String response = userService.updateUser(userId, user);  
        if (response.equals("User updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteUser(@RequestParam String id) {
        UUID userId = UUID.fromString(id);
        String response = userService.deleteUser(userId);  
        if (response.equals("User deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> checkExists(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    // Get users by province code
    @GetMapping("/province/code/{provinceCode}")
    public ResponseEntity<?> getUsersByProvinceCode(
            @PathVariable String provinceCode,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "fullNames") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(required = false, defaultValue = "false") boolean paginated) {
        if (paginated) {
            Page<User> users = userService.getUsersByProvinceCode(provinceCode, page, size, sortBy, sortDir);
            return ResponseEntity.ok(users);
        } else {
            List<User> users = userService.getUsersByProvinceCode(provinceCode);
            return ResponseEntity.ok(users);
        }
    }

    // Get users by province name
    @GetMapping("/province/name/{provinceName}")
    public ResponseEntity<?> getUsersByProvinceName(
            @PathVariable String provinceName,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "fullNames") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(required = false, defaultValue = "false") boolean paginated) {
        if (paginated) {
            Page<User> users = userService.getUsersByProvinceName(provinceName, page, size, sortBy, sortDir);
            return ResponseEntity.ok(users);
        } else {
            List<User> users = userService.getUsersByProvinceName(provinceName);
            return ResponseEntity.ok(users);
        }
    }

    // Get province from a user by user ID
    @GetMapping("/{userId}/province")
    public ResponseEntity<?> getProvinceFromUser(@PathVariable UUID userId) {
        Optional<Location> province = userService.getProvinceFromUser(userId);
        if (province.isPresent()) {
            return ResponseEntity.ok(province.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found or user has no location assigned");
        }
    }

    // Get province from a user by email
    @GetMapping("/email/{email}/province")
    public ResponseEntity<?> getProvinceFromUserByEmail(@PathVariable String email) {
        Optional<Location> province = userService.getProvinceFromUserByEmail(email);
        if (province.isPresent()) {
            return ResponseEntity.ok(province.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found or user has no location assigned");
        }
    }

    // Check if users exist for a province code
    @GetMapping("/province/code/{provinceCode}/exists")
    public ResponseEntity<Boolean> checkExistsByProvinceCode(@PathVariable String provinceCode) {
        boolean exists = userService.existsByProvinceCode(provinceCode);
        return ResponseEntity.ok(exists);
    }

    // Check if users exist for a province name
    @GetMapping("/province/name/{provinceName}/exists")
    public ResponseEntity<Boolean> checkExistsByProvinceName(@PathVariable String provinceName) {
        boolean exists = userService.existsByProvinceName(provinceName);
        return ResponseEntity.ok(exists);
    }

    // Get users by role with pagination
    @GetMapping("/role/{role}/paginated")
    public ResponseEntity<Page<User>> getUsersByRolePaginated(
            @PathVariable Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullNames") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<User> users = userService.getUsersByRole(role, page, size, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    // Get users by gender with pagination
    @GetMapping("/gender/{gender}/paginated")
    public ResponseEntity<Page<User>> getUsersByGenderPaginated(
            @PathVariable Gender gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullNames") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<User> users = userService.getUsersByGender(gender, page, size, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    // Search users by name with pagination
    @GetMapping("/search/paginated")
    public ResponseEntity<Page<User>> searchUsersPaginated(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullNames") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<User> users = userService.searchUsersByName(name, page, size, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    // Cleanup duplicate users endpoint
    @PostMapping("/cleanup-duplicates")
    public ResponseEntity<String> cleanupDuplicateUsers() {
        String response = userService.cleanupDuplicateUsers();
        return ResponseEntity.ok(response);
    }
}