package auca.ac.rw.transportManagementSystem.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Elocation;
import auca.ac.rw.transportManagementSystem.model.Location;
import auca.ac.rw.transportManagementSystem.service.LocationService;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveProvince(@RequestBody Location location) {
        String response = locationService.saveProvince(location);
        if (response.equals("Province saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/saveChild", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveChildren(@RequestParam String parentCode, @RequestBody Location location) {
        try {
            if (parentCode == null || parentCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Parent code is required");
            }
            
            if (location == null) {
                return ResponseEntity.badRequest().body("Location data is required");
            }
            
            String response = locationService.saveChildren(parentCode.trim(), location);
            if (response.contains("successfully")) {
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving location: " + e.getMessage());
        }
    }

    @GetMapping("/getLocation")
    public ResponseEntity<?> getLocation(@RequestParam String code) {
        Optional<Location> location = locationService.getLocation(code);
        if (location.isPresent()) {
            return ResponseEntity.ok(location.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Location not found");
        }
    }

    @GetMapping("/getProvinceNameBySector")
    public ResponseEntity<String> getProvinceNameBySector(@RequestParam String code) {
        String response = locationService.getProvinceBySector(code);
        if (response.equals("No location found") || response.contains("no parent")
                || response.contains("no province")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<Location>> getAllLocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Location> locations = locationService.getAllLocations(page, size, sortBy, sortDir);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Page<Location>> getLocationsByType(
            @PathVariable Elocation type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Location> locations = locationService.getLocationsByType(type, page, size, sortBy, sortDir);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/roots")
    public ResponseEntity<Page<Location>> getRootLocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Location> locations = locationService.getRootLocations(page, size, sortBy, sortDir);
        return ResponseEntity.ok(locations);
    }

    // Convenience endpoint for combo-boxes (non-paginated)
    @GetMapping("/roots/list")
    public ResponseEntity<List<Location>> getRootLocationsList() {
        return ResponseEntity.ok(locationService.getRootLocations());
    }

    @GetMapping("/{code}/children")
    public ResponseEntity<Page<Location>> getChildren(
            @PathVariable String code,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Location> children = locationService.getChildrenByParentCode(code, page, size, sortBy, sortDir);
        return ResponseEntity.ok(children);
    }

    // Convenience endpoint for combo-boxes (non-paginated)
    @GetMapping("/{code}/children/list")
    public ResponseEntity<List<Location>> getChildrenList(@PathVariable String code) {
        return ResponseEntity.ok(locationService.getChildrenByParentCode(code));
    }

    @PutMapping(value = "/{code}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateLocation(@PathVariable String code,
            @RequestBody Location location) {
        String response = locationService.updateLocation(code, location);
        if (response.equals("Location updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<String> deleteLocation(@PathVariable String code) {
        String response = locationService.deleteLocation(code);
        if (response.equals("Location deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Location>> searchLocations(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Location> locations = locationService.searchLocationsByName(name, page, size, sortBy, sortDir);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/exists/{code}")
    public ResponseEntity<Boolean> checkExists(@PathVariable String code) {
        boolean exists = locationService.existsByCode(code);
        return ResponseEntity.ok(exists);
    }

    // Get all provinces that have users
    @GetMapping("/provinces/with-users")
    public ResponseEntity<?> getProvincesWithUsers(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(required = false, defaultValue = "false") boolean paginated) {
        if (paginated) {
            Page<Location> provinces = locationService.getProvincesWithUsers(page, size, sortBy, sortDir);
            return ResponseEntity.ok(provinces);
        } else {
            List<Location> provinces = locationService.getProvincesWithUsers();
            return ResponseEntity.ok(provinces);
        }
    }
}