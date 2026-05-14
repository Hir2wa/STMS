package auca.ac.rw.transportManagementSystem.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import auca.ac.rw.transportManagementSystem.model.Location;
import auca.ac.rw.transportManagementSystem.model.Route;
import auca.ac.rw.transportManagementSystem.repository.LocationRepository;
import auca.ac.rw.transportManagementSystem.repository.RouteRepository;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private LocationRepository locationRepository;

    public String saveRoute(Route route) {
        if (route == null) {
            return "Route cannot be null";
        }

        if (route.getRouteName() == null || route.getRouteName().trim().isEmpty()) {
            return "Route name is required";
        }

        if (route.getStartPoint() == null || route.getStartPoint().trim().isEmpty()) {
            return "Start point is required";
        }

        if (route.getEndPoint() == null || route.getEndPoint().trim().isEmpty()) {
            return "End point is required";
        }

        if (routeRepository.existsByRouteName(route.getRouteName())) {
            return "Route with this name already exists";
        }

        try {
            routeRepository.save(route);
            return "Route saved successfully";
        } catch (Exception e) {
            return "Failed to save route: " + e.getMessage();
        }
    }

    public String addLocationToRoute(int routeId, String locationCode) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return "Location code is required";
        }

        Optional<Route> routeOptional = routeRepository.findById(routeId);
        if (!routeOptional.isPresent()) {
            return "Route not found";
        }

        Optional<Location> locationOptional = locationRepository.findByCode(locationCode);
        if (!locationOptional.isPresent()) {
            return "Location not found";
        }

        Route route = routeOptional.get();
        Location location = locationOptional.get();

        if (route.getLocations().contains(location)) {
            return "Location already added to this route";
        }

        route.getLocations().add(location);

        try {
            routeRepository.save(route);
            return "Location added to route successfully";
        } catch (Exception e) {
            return "Failed to add location: " + e.getMessage();
        }
    }

    public String removeLocationFromRoute(int routeId, String locationCode) {
        if (locationCode == null || locationCode.trim().isEmpty()) {
            return "Location code is required";
        }

        Optional<Route> routeOptional = routeRepository.findById(routeId);
        if (!routeOptional.isPresent()) {
            return "Route not found";
        }

        Optional<Location> locationOptional = locationRepository.findByCode(locationCode);
        if (!locationOptional.isPresent()) {
            return "Location not found";
        }

        Route route = routeOptional.get();
        Location location = locationOptional.get();

        if (!route.getLocations().contains(location)) {
            return "Location not found in this route";
        }

        route.getLocations().remove(location);

        try {
            routeRepository.save(route);
            return "Location removed from route successfully";
        } catch (Exception e) {
            return "Failed to remove location: " + e.getMessage();
        }
    }

    public Optional<Route> getRouteById(int id) {
        return routeRepository.findById(id);
    }

    public Optional<Route> getRouteByName(String routeName) {
        if (routeName == null || routeName.trim().isEmpty()) {
            return Optional.empty();
        }
        return routeRepository.findByRouteName(routeName);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public List<Route> getRoutesByStartPoint(String startPoint) {
        return routeRepository.findByStartPoint(startPoint);
    }

    public List<Route> getRoutesByEndPoint(String endPoint) {
        return routeRepository.findByEndPoint(endPoint);
    }

    public List<Route> searchRoutesByName(String name) {
        return routeRepository.findByRouteNameContainingIgnoreCase(name);
    }

    public String updateRoute(int id, Route updatedRoute) {
        Optional<Route> existingRouteOptional = routeRepository.findById(id);
        if (!existingRouteOptional.isPresent()) {
            return "Route not found";
        }

        Route route = existingRouteOptional.get();

        if (updatedRoute.getRouteName() != null && !updatedRoute.getRouteName().trim().isEmpty()) {
            if (!route.getRouteName().equals(updatedRoute.getRouteName()) &&
                routeRepository.existsByRouteName(updatedRoute.getRouteName())) {
                return "Route name already exists";
            }
            route.setRouteName(updatedRoute.getRouteName());
        }

        if (updatedRoute.getStartPoint() != null && !updatedRoute.getStartPoint().trim().isEmpty()) {
            route.setStartPoint(updatedRoute.getStartPoint());
        }

        if (updatedRoute.getEndPoint() != null && !updatedRoute.getEndPoint().trim().isEmpty()) {
            route.setEndPoint(updatedRoute.getEndPoint());
        }

        if (updatedRoute.getDistance() != null) {
            route.setDistance(updatedRoute.getDistance());
        }

        try {
            routeRepository.save(route);
            return "Route updated successfully";
        } catch (Exception e) {
            return "Failed to update route: " + e.getMessage();
        }
    }

    public String deleteRoute(int id) {
        Optional<Route> routeOptional = routeRepository.findById(id);
        if (!routeOptional.isPresent()) {
            return "Route not found";
        }

        Route route = routeOptional.get();
        if (!route.getBuses().isEmpty()) {
            return "Can not delete route with assigned buses";
        }

        try {
            routeRepository.deleteById(id);
            return "Route deleted successfully";
        } catch (Exception e) {
            return "Failed to delete route: " + e.getMessage();
        }
    }

    public boolean existsByRouteName(String routeName) {
        return routeRepository.existsByRouteName(routeName);
    }

    // Pagination methods
    public Page<Route> getAllRoutes(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return routeRepository.findAll(pageable);
    }

    public Page<Route> searchRoutes(String searchTerm, int page, int size, String sortBy, String sortDir) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String term = searchTerm.trim();
        // Search across routeName, startPoint, and endPoint
        Page<Route> nameResults = routeRepository.findByRouteNameContainingIgnoreCase(term, pageable);
        if (nameResults.hasContent()) {
            return nameResults;
        }
        Page<Route> startResults = routeRepository.findByStartPointContainingIgnoreCase(term, pageable);
        if (startResults.hasContent()) {
            return startResults;
        }
        return routeRepository.findByEndPointContainingIgnoreCase(term, pageable);
    }
}