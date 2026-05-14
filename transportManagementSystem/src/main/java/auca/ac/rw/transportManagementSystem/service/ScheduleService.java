package auca.ac.rw.transportManagementSystem.service;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.Route;
import auca.ac.rw.transportManagementSystem.model.Schedule;
import auca.ac.rw.transportManagementSystem.repository.BusRepository;
import auca.ac.rw.transportManagementSystem.repository.RouteRepository;
import auca.ac.rw.transportManagementSystem.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private RouteRepository routeRepository;

    public Schedule saveSchedule(Schedule schedule) {
        if (schedule == null) {
            throw new IllegalArgumentException("Schedule cannot be null");
        }

        if (schedule.getDepartureTime() == null) {
            throw new IllegalArgumentException("Departure time is required");
        }

        if (schedule.getArrivalTime() == null) {
            throw new IllegalArgumentException("Arrival time is required");
        }

        if (schedule.getDayOfWeek() == null || schedule.getDayOfWeek().trim().isEmpty()) {
            throw new IllegalArgumentException("Day of week is required");
        }

        // Resolve associations by ID to avoid accidentally creating new Bus/Route
        if (schedule.getBus() != null) {
            int busId = schedule.getBus().getId();
            if (busId <= 0) {
                throw new IllegalArgumentException("Bus ID is invalid");
            }
            Bus bus = busRepository.findById(busId)
                    .orElseThrow(() -> new IllegalArgumentException("Bus not found"));
            schedule.setBus(bus);
        }

        if (schedule.getRoute() != null) {
            int routeId = schedule.getRoute().getRouteId();
            if (routeId <= 0) {
                throw new IllegalArgumentException("Route ID is invalid");
            }
            Route route = routeRepository.findById(routeId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found"));
            schedule.setRoute(route);
        }

        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getSchedulesByBus(int busId) {
        return scheduleRepository.findByBus_Id(busId);
    }

    public List<Schedule> getSchedulesByRoute(int routeId) {
        return scheduleRepository.findByRoute_RouteId(routeId);
    }

    public Optional<Schedule> getScheduleById(int id) {
        return scheduleRepository.findById(id);
    }

    public Schedule updateSchedule(int id, Schedule updatedSchedule) {
        Schedule existing = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));

        if (updatedSchedule == null) {
            throw new IllegalArgumentException("Schedule cannot be null");
        }

        if (updatedSchedule.getDepartureTime() != null) {
            existing.setDepartureTime(updatedSchedule.getDepartureTime());
        }

        if (updatedSchedule.getArrivalTime() != null) {
            existing.setArrivalTime(updatedSchedule.getArrivalTime());
        }

        if (updatedSchedule.getDayOfWeek() != null && !updatedSchedule.getDayOfWeek().trim().isEmpty()) {
            existing.setDayOfWeek(updatedSchedule.getDayOfWeek());
        }

        // Allow setting/clearing bus
        if (updatedSchedule.getBus() == null) {
            existing.setBus(null);
        } else {
            int busId = updatedSchedule.getBus().getId();
            if (busId <= 0) {
                throw new IllegalArgumentException("Bus ID is invalid");
            }
            Bus bus = busRepository.findById(busId)
                    .orElseThrow(() -> new IllegalArgumentException("Bus not found"));
            existing.setBus(bus);
        }

        // Allow setting/clearing route
        if (updatedSchedule.getRoute() == null) {
            existing.setRoute(null);
        } else {
            int routeId = updatedSchedule.getRoute().getRouteId();
            if (routeId <= 0) {
                throw new IllegalArgumentException("Route ID is invalid");
            }
            Route route = routeRepository.findById(routeId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found"));
            existing.setRoute(route);
        }

        return scheduleRepository.save(existing);
    }

    public void deleteSchedule(int id) {
        Schedule existing = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        scheduleRepository.delete(existing);
    }

    // Pagination methods
    public Page<Schedule> getAllSchedules(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return scheduleRepository.findAll(pageable);
    }

    public Page<Schedule> getSchedulesByBus(int busId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return scheduleRepository.findByBus_Id(busId, pageable);
    }
}
