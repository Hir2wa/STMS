package auca.ac.rw.transportManagementSystem.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import auca.ac.rw.transportManagementSystem.model.Route;
import auca.ac.rw.transportManagementSystem.service.RouteService;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveRoute(@RequestBody Route route) {
        String response = routeService.saveRoute(route);
        if (response.equals("Route saved successfully")) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/addLocation")
    public ResponseEntity<String> addLocationToRoute(@RequestParam int routeId, @RequestParam String locationCode) {
        String response = routeService.addLocationToRoute(routeId, locationCode);
        if (response.equals("Location added to route successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/removeLocation")
    public ResponseEntity<String> removeLocationFromRoute(@RequestParam int routeId,  @RequestParam String locationCode) {
        String response = routeService.removeLocationFromRoute(routeId, locationCode);
        if (response.equals("Location removed from route successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRouteById(@PathVariable int id) {
        Optional<Route> route = routeService.getRouteById(id);
        if (route.isPresent()) {
            return ResponseEntity.ok(route.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found");
        }
    }

    @GetMapping("/name/{routeName}")
    public ResponseEntity<?> getRouteByName(@PathVariable String routeName) {
        Optional<Route> route = routeService.getRouteByName(routeName);
        if (route.isPresent()) {
            return ResponseEntity.ok(route.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Route>> getAllRoutes() {
        List<Route> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/start/{startPoint}")
    public ResponseEntity<List<Route>> getRoutesByStartPoint(@PathVariable String startPoint) {
        List<Route> routes = routeService.getRoutesByStartPoint(startPoint);
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/end/{endPoint}")
    public ResponseEntity<List<Route>> getRoutesByEndPoint(@PathVariable String endPoint) {
        List<Route> routes = routeService.getRoutesByEndPoint(endPoint);
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Route>> searchRoutes(@RequestParam String name) {
        List<Route> routes = routeService.searchRoutesByName(name);
        return ResponseEntity.ok(routes);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateRoute(@PathVariable int id, 
                                               @RequestBody Route route) {
        String response = routeService.updateRoute(id, route);
        if (response.equals("Route updated successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoute(@PathVariable int id) {
        String response = routeService.deleteRoute(id);
        if (response.equals("Route deleted successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/exists/{routeName}")
    public ResponseEntity<Boolean> checkExists(@PathVariable String routeName) {
        boolean exists = routeService.existsByRouteName(routeName);
        return ResponseEntity.ok(exists);
    }

    // Pagination endpoints
    @GetMapping("/allPaginated")
    public ResponseEntity<Page<Route>> getAllRoutesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "routeName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Route> routes = routeService.getAllRoutes(page, size, sortBy, sortDir);
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/search/paginated")
    public ResponseEntity<Page<Route>> searchRoutesPaginated(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "routeName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Page<Route> routes = routeService.searchRoutes(searchTerm, page, size, sortBy, sortDir);
        return ResponseEntity.ok(routes);
    }
}