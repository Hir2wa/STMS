package auca.ac.rw.transportManagementSystem.controller;

import auca.ac.rw.transportManagementSystem.model.Schedule;
import auca.ac.rw.transportManagementSystem.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/save")
    public ResponseEntity<?> saveSchedule(@RequestBody Schedule schedule) {
        try {
            Schedule saved = scheduleService.saveSchedule(schedule);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving schedule");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @GetMapping("/bus/{busId}")
    public ResponseEntity<List<Schedule>> getByBus(@PathVariable int busId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByBus(busId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        Optional<Schedule> schedule = scheduleService.getScheduleById(id);
        return schedule.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Schedule not found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable int id, @RequestBody Schedule schedule) {
        try {
            Schedule updated = scheduleService.updateSchedule(id, schedule);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating schedule");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable int id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok("Schedule deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting schedule");
        }
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Schedule>> getAllSchedulesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dayOfWeek") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Schedule> schedules = scheduleService.getAllSchedules(page, size, sortBy, sortDir);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/bus/{busId}/paginated")
    public ResponseEntity<Page<Schedule>> getSchedulesByBusPaginated(
            @PathVariable int busId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dayOfWeek") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Schedule> schedules = scheduleService.getSchedulesByBus(busId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(schedules);
    }
}
