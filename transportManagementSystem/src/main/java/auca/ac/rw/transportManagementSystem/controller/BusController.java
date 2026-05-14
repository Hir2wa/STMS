package auca.ac.rw.transportManagementSystem.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.EStatus;
import auca.ac.rw.transportManagementSystem.service.BusService;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    @Autowired
    private BusService busService;

    // Keep this flexible to avoid 415 (Unsupported Media Type) from strict content-type matching
    @PostMapping(value = "/save")
    public ResponseEntity<String> saveBus(@RequestBody Bus bus) {
        String response = busService.saveBus(bus);
        if (response.equals("Bus saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/assignDriver")
    public ResponseEntity<String> assignDriver(@RequestParam int busId, @RequestParam int driverId) {
        String response = busService.assignDriver(busId, driverId);
        if (response.equals("Driver assigned successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

     @PutMapping("/assignRoute")
    public ResponseEntity<String> assignRoute(@RequestParam int busId, @RequestParam int routeId) {
        String response = busService.assignRoute(busId, routeId);
        if (response.equals("Route assigned successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStatus(@RequestParam int busId, @RequestParam EStatus status) {
        String response = busService.updateStatus(busId, status);
        if (response.equals("Status updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/removeDriver")
    public ResponseEntity<String> removeDriver(@RequestParam int busId) {
        String response = busService.removeDriver(busId);
        if (response.equals("Driver removed successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/removeRoute")
    public ResponseEntity<String> removeRoute(@RequestParam int busId) {
        String response = busService.removeRoute(busId);
        if (response.equals("Route removed successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/getById")
    public ResponseEntity<?> getBusById(@RequestParam int id) {
        Optional<Bus> bus = busService.getBusById(id);
        if (bus.isPresent()) {
            return ResponseEntity.ok(bus.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bus not found");
        }
    }

    @GetMapping("/getByPlate")
    public ResponseEntity<?> getBusByPlateNumber(@RequestParam String plateNumber) {
        Optional<Bus> bus = busService.getBusByPlateNumber(plateNumber);
        if (bus.isPresent()) {
            return ResponseEntity.ok(bus.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bus not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Bus>> getAllBuses() {
        List<Bus> buses = busService.getAllBuses();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/byStatus")
    public ResponseEntity<List<Bus>> getBusesByStatus(@RequestParam EStatus status) {
        List<Bus> buses = busService.getBusesByStatus(status);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/byRoute")
    public ResponseEntity<List<Bus>> getBusesByRoute(@RequestParam int routeId) {
        List<Bus> buses = busService.getBusesByRoute(routeId);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/byCapacity")
    public ResponseEntity<List<Bus>> getBusesByCapacity(@RequestParam int minCapacity) {
        List<Bus> buses = busService.getBusesByCapacity(minCapacity);
        return ResponseEntity.ok(buses);
    }

    // Keep this flexible to avoid 415 (Unsupported Media Type) from strict content-type matching
    @PutMapping(value = "/update")
    public ResponseEntity<String> updateBus(@RequestParam int id, @RequestBody Bus bus) {
        String response = busService.updateBus(id, bus);
        if (response.equals("Bus updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

     @DeleteMapping("/delete")
    public ResponseEntity<String> deleteBus(@RequestParam int id) {
        String response = busService.deleteBus(id);
        if (response.equals("Bus deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Bus>> getAllBusesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "plateNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Bus> buses = busService.getAllBuses(page, size, sortBy, sortDir);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/byStatus/paginated")
    public ResponseEntity<Page<Bus>> getBusesByStatusPaginated(
            @RequestParam EStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "plateNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Bus> buses = busService.getBusesByStatus(status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/search/paginated")
    public ResponseEntity<Page<Bus>> searchBusesPaginated(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "plateNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Bus> buses = busService.searchBuses(searchTerm, page, size, sortBy, sortDir);
        return ResponseEntity.ok(buses);
    }
}