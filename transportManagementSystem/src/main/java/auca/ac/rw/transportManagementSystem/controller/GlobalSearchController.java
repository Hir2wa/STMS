package auca.ac.rw.transportManagementSystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Announcement;
import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.Driver;
import auca.ac.rw.transportManagementSystem.model.Route;
import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.service.AnnouncementService;
import auca.ac.rw.transportManagementSystem.service.BusService;
import auca.ac.rw.transportManagementSystem.service.DriverService;
import auca.ac.rw.transportManagementSystem.service.RouteService;
import auca.ac.rw.transportManagementSystem.service.StudentService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GlobalSearchController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private BusService busService;

    @Autowired
    private DriverService driverService;

    @Autowired
    private RouteService routeService;

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> globalSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (query == null || query.trim().isEmpty()) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("students", Page.empty());
            emptyResult.put("buses", Page.empty());
            emptyResult.put("drivers", Page.empty());
            emptyResult.put("routes", Page.empty());
            emptyResult.put("announcements", Page.empty());
            return ResponseEntity.ok(emptyResult);
        }

        String searchTerm = query.trim();

        Map<String, Object> results = new HashMap<>();
        
        // Search across all entities
        try {
            Page<Student> students = studentService.searchStudents(searchTerm, page, size, "name", "asc");
            results.put("students", students);
        } catch (Exception e) {
            results.put("students", Page.empty());
        }

        try {
            Page<Bus> buses = busService.searchBuses(searchTerm, page, size, "plateNumber", "asc");
            results.put("buses", buses);
        } catch (Exception e) {
            results.put("buses", Page.empty());
        }

        try {
            Page<Driver> drivers = driverService.searchDrivers(searchTerm, page, size, "name", "asc");
            results.put("drivers", drivers);
        } catch (Exception e) {
            results.put("drivers", Page.empty());
        }

        try {
            Page<Route> routes = routeService.searchRoutes(searchTerm, page, size, "routeName", "asc");
            results.put("routes", routes);
        } catch (Exception e) {
            results.put("routes", Page.empty());
        }

        try {
            Page<Announcement> announcements = announcementService.searchAnnouncements(searchTerm, page, size, "createdAt", "desc");
            results.put("announcements", announcements);
        } catch (Exception e) {
            results.put("announcements", Page.empty());
        }

        return ResponseEntity.ok(results);
    }
}

