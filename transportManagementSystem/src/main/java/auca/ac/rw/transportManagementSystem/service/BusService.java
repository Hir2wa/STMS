package auca.ac.rw.transportManagementSystem.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.Driver;
import auca.ac.rw.transportManagementSystem.model.Route;
import auca.ac.rw.transportManagementSystem.model.EStatus;
import auca.ac.rw.transportManagementSystem.repository.BusRepository;
import auca.ac.rw.transportManagementSystem.repository.DriverRepository;
import auca.ac.rw.transportManagementSystem.repository.RouteRepository;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RouteRepository routeRepository;

    public String saveBus(Bus bus) {
        if (bus == null) {
            return "Bus cannot be null";
        }

        if (bus.getPlateNumber() == null || bus.getPlateNumber().trim().isEmpty()) {
            return "Plate number is required";
        }

        if (bus.getCapacity() <= 0) {
            return "Capacity must be greater than zero";
        }

        if (busRepository.existsByPlateNumber(bus.getPlateNumber())) {
            return "Bus with this plate number already exists";
        }

        try {
            busRepository.save(bus);
            return "Bus saved successfully";
        } catch (Exception e) {
            return "Failed to save bus: " + e.getMessage();
        }
    }

    public String assignDriver(int busId, int driverId) {
        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Optional<Driver> driverOptional = driverRepository.findById(driverId);
        if (!driverOptional.isPresent()) {
            return "Driver not found";
        }

        Optional<Bus> existingBus = busRepository.findByDriverDriverId(driverId);
        if (existingBus.isPresent() && existingBus.get().getId() != busId) {
            return "Driver is already assigned to another bus";
        }

        Bus bus = busOptional.get();
        bus.setDriver(driverOptional.get());

        try {
            busRepository.save(bus);
            return "Driver assigned successfully";
        } catch (Exception e) {
            return "Failed to assign driver: " + e.getMessage();
        }
    }

    public String assignRoute(int busId, int routeId) {
        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Optional<Route> routeOptional = routeRepository.findById(routeId);
        if (!routeOptional.isPresent()) {
            return "Route not found";
        }

        Bus bus = busOptional.get();
        bus.setRoute(routeOptional.get());

        try {
            busRepository.save(bus);
            return "Route assigned successfully";
        } catch (Exception e) {
            return "Failed to assign route: " + e.getMessage();
        }
    }

    public String updateStatus(int busId, EStatus status) {
        if (status == null) {
            return "Status cannot be null";
        }

        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Bus bus = busOptional.get();
        bus.setStatus(status);

        try {
            busRepository.save(bus);
            return "Status updated successfully";
        } catch (Exception e) {
            return "Failed to update status: " + e.getMessage();
        }
    }

    public Optional<Bus> getBusById(int id) {
        return busRepository.findById(id);
    }

    public Optional<Bus> getBusByPlateNumber(String plateNumber) {
        if (plateNumber == null || plateNumber.trim().isEmpty()) {
            return Optional.empty();
        }
        return busRepository.findByPlateNumber(plateNumber);
    }

    public List<Bus> getAllBuses() {
        // Use custom query to ensure driver is eagerly fetched
        return busRepository.findAllWithDriver();
    }

    public List<Bus> getBusesByStatus(EStatus status) {
        return busRepository.findByStatus(status);
    }

    public List<Bus> getBusesByRoute(int routeId) {
        return busRepository.findByRouteRouteId(routeId);
    }

    public List<Bus> getBusesByCapacity(int minCapacity) {
        return busRepository.findByCapacityGreaterThanEqual(minCapacity);
    }

    public String updateBus(int id, Bus updatedBus) {
        Optional<Bus> existingBusOptional = busRepository.findById(id);
        if (!existingBusOptional.isPresent()) {
            return "Bus not found";
        }

        Bus bus = existingBusOptional.get();

        if (updatedBus.getPlateNumber() != null && !updatedBus.getPlateNumber().trim().isEmpty()) {
            if (!bus.getPlateNumber().equals(updatedBus.getPlateNumber()) &&
                busRepository.existsByPlateNumber(updatedBus.getPlateNumber())) {
                return "Plate number already exists";
            }
            bus.setPlateNumber(updatedBus.getPlateNumber());
        }

        if (updatedBus.getCapacity() > 0) {
            bus.setCapacity(updatedBus.getCapacity());
        }

        if (updatedBus.getStatus() != null) {
            bus.setStatus(updatedBus.getStatus());
        }

        try {
            busRepository.save(bus);
            return "Bus updated successfully";
        } catch (Exception e) {
            return "Failed to update bus: " + e.getMessage();
        }
    }

    public String deleteBus(int id) {
        Optional<Bus> busOptional = busRepository.findById(id);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        try {
            busRepository.deleteById(id);
            return "Bus deleted successfully";
        } catch (Exception e) {
            return "Failed to delete bus: " + e.getMessage();
        }
    }

    public String removeDriver(int busId) {
        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Bus bus = busOptional.get();
        bus.setDriver(null);

        try {
            busRepository.save(bus);
            return "Driver removed successfully";
        } catch (Exception e) {
            return "Failed to remove driver: " + e.getMessage();
        }
    }

    public String removeRoute(int busId) {
        Optional<Bus> busOptional = busRepository.findById(busId);
        if (!busOptional.isPresent()) {
            return "Bus not found";
        }

        Bus bus = busOptional.get();
        bus.setRoute(null);

        try {
            busRepository.save(bus);
            return "Route removed successfully";
        } catch (Exception e) {
            return "Failed to remove route: " + e.getMessage();
        }
    }

    public boolean existsByPlateNumber(String plateNumber) {
        return busRepository.existsByPlateNumber(plateNumber);
    }

    // Pagination methods
    public Page<Bus> getAllBuses(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return busRepository.findAll(pageable);
    }

    public Page<Bus> getBusesByStatus(EStatus status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return busRepository.findByStatus(status, pageable);
    }

    public Page<Bus> searchBuses(String searchTerm, int page, int size, String sortBy, String sortDir) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return busRepository.findByPlateNumberContainingIgnoreCase(searchTerm, pageable);
    }
}