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
import auca.ac.rw.transportManagementSystem.model.Elocation;
import auca.ac.rw.transportManagementSystem.repository.LocationRepository;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    public String saveProvince(Location location) {
        if (location == null) {
            return "Location cannot be null";
        }

        if (location.getCode() == null || location.getCode().trim().isEmpty()) {
            return "Location code is required";
        }

        if (location.getName() == null || location.getName().trim().isEmpty()) {
            return "Location name is required";
        }

        if (!locationRepository.existsByCode(location.getCode())) {
            locationRepository.save(location);
            return "Province saved successfully";
        } else {
            return "Province with that code already exists";
        }
    }

    public String saveChildren(String parentCode, Location location) {
        if (location == null) {
            return "Location cannot be null";
        }

        if (location.getCode() == null || location.getCode().trim().isEmpty()) {
            return "Location code is required";
        }

        if (location.getName() == null || location.getName().trim().isEmpty()) {
            return "Location name is required";
        }

        if (parentCode != null && !parentCode.trim().isEmpty()) {
            Optional<Location> getParent = locationRepository.findByCode(parentCode);

            if (getParent.isPresent()) {
                location.setParent(getParent.get());

                if (!locationRepository.existsByCode(location.getCode())) {
                    locationRepository.save(location);
                    return "Child saved successfully";
                } else {
                    return "Child with this code already exists";
                }

            } else {
                return "Parent with this code does not exist";
            }
        } else {
            if (!locationRepository.existsByCode(location.getCode())) {
                locationRepository.save(location);
                return "Parent saved successfully";
            } else {
                return "Parent with this code already exists";
            }
        }
    }

    public Optional<Location> getLocation(String code) {
        if (code == null || code.trim().isEmpty()) {
            return Optional.empty();
        }
        return locationRepository.findByCode(code);
    }

    public String getProvinceBySector(String code) {
        if (code == null || code.trim().isEmpty()) {
            return "Code cannot be null or empty";
        }

        Optional<Location> response = locationRepository.findByCode(code);
        if (response.isPresent()) {
            Location location = response.get();

            if (location.getParent() == null) {
                return "Location has no parent";
            }

            if (location.getParent().getParent() == null) {
                return "Location has no province";
            }

            return location.getParent().getParent().getName();
        } else {
            return "No location found";
        }
    }

    // Updated: Paginated version of getAllLocations
    public Page<Location> getAllLocations(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return locationRepository.findAll(pageable);
    }

    // Original non-paginated for backward compatibility (optional; remove if not
    // needed)
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    // Updated: Paginated version of getLocationsByType
    public Page<Location> getLocationsByType(Elocation type, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return locationRepository.findByType(type, pageable);
    }

    // Original non-paginated
    public List<Location> getLocationsByType(Elocation type) {
        return locationRepository.findByType(type);
    }

    // Updated: Paginated version of getRootLocations
    public Page<Location> getRootLocations(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return locationRepository.findByParentIsNull(pageable);
    }

    // Original non-paginated
    public List<Location> getRootLocations() {
        return locationRepository.findByParentIsNull();
    }

    // Updated: Paginated version of getChildrenByParentCode
    public Page<Location> getChildrenByParentCode(String parentCode, int page, int size, String sortBy,
            String sortDir) {
        if (parentCode == null || parentCode.trim().isEmpty()) {
            return Page.empty();
        }
        Optional<Location> parent = locationRepository.findByCode(parentCode);
        if (parent.isPresent()) {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            return locationRepository.findByParent(parent.get(), pageable);
        }
        return Page.empty();
    }

    // Original non-paginated
    public List<Location> getChildrenByParentCode(String parentCode) {
        Optional<Location> parent = locationRepository.findByCode(parentCode);
        if (parent.isPresent()) {
            return locationRepository.findByParent(parent.get());
        }
        return List.of();
    }

    public String updateLocation(String code, Location updatedLocation) {
        if (code == null || code.trim().isEmpty()) {
            return "Code cannot be null or empty";
        }

        Optional<Location> existingLocation = locationRepository.findByCode(code);
        if (!existingLocation.isPresent()) {
            return "Location not found";
        }

        Location location = existingLocation.get();

        if (updatedLocation.getName() != null && !updatedLocation.getName().trim().isEmpty()) {
            location.setName(updatedLocation.getName());
        }

        if (updatedLocation.getCode() != null && !updatedLocation.getCode().trim().isEmpty()) {
            if (!location.getCode().equals(updatedLocation.getCode()) &&
                    locationRepository.existsByCode(updatedLocation.getCode())) {
                return "New code already exists";
            }
            location.setCode(updatedLocation.getCode());
        }

        if (updatedLocation.getType() != null) {
            location.setType(updatedLocation.getType());
        }

        locationRepository.save(location);
        return "Location updated successfully";
    }

    public String deleteLocation(String code) {
        if (code == null || code.trim().isEmpty()) {
            return "Code cannot be null or empty";
        }

        Optional<Location> location = locationRepository.findByCode(code);
        if (!location.isPresent()) {
            return "Location not found";
        }

        long childrenCount = locationRepository.countChildrenByParentId(location.get().getLocationId());
        if (childrenCount > 0) {
            return "Cannot delete location with children";
        }

        locationRepository.delete(location.get());
        return "Location deleted successfully";
    }

    // Updated: Paginated version of searchLocationsByName
    public Page<Location> searchLocationsByName(String name, int page, int size, String sortBy, String sortDir) {
        if (name == null || name.trim().isEmpty()) {
            return Page.empty();
        }
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return locationRepository.searchByName(name, pageable);
    }

    // Original non-paginated
    public List<Location> searchLocationsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        return locationRepository.searchByName(name);
    }

    public boolean existsByCode(String code) {
        return locationRepository.existsByCode(code);
    }

    // Helper method to find province from any location in the hierarchy
    public Optional<Location> findProvinceFromLocation(Location location) {
        if (location == null) {
            return Optional.empty();
        }
        
        Location current = location;
        // Traverse up the hierarchy until we find a PROVINCE
        while (current != null) {
            if (current.getType() == Elocation.PROVINCE) {
                return Optional.of(current);
            }
            current = current.getParent();
        }
        
        return Optional.empty();
    }

    // Find province by code from a user's location
    public Optional<Location> findProvinceByCode(String provinceCode) {
        if (provinceCode == null || provinceCode.trim().isEmpty()) {
            return Optional.empty();
        }
        
        Optional<Location> location = locationRepository.findByCode(provinceCode);
        if (location.isPresent() && location.get().getType() == Elocation.PROVINCE) {
            return location;
        }
        
        return Optional.empty();
    }

    // Find province by name
    public Optional<Location> findProvinceByName(String provinceName) {
        if (provinceName == null || provinceName.trim().isEmpty()) {
            return Optional.empty();
        }
        
        // Try exact match first
        Optional<Location> exactMatch = locationRepository.findByNameAndType(provinceName, Elocation.PROVINCE);
        if (exactMatch.isPresent()) {
            return exactMatch;
        }
        
        // Try case-insensitive partial match
        List<Location> provinces = locationRepository.findByType(Elocation.PROVINCE);
        return provinces.stream()
                .filter(p -> p.getName().equalsIgnoreCase(provinceName) || 
                           p.getName().toLowerCase().contains(provinceName.toLowerCase()))
                .findFirst();
    }

    // Get all provinces that have users
    public List<Location> getProvincesWithUsers() {
        return locationRepository.findProvincesWithUsers();
    }

    // Get all provinces that have users with pagination and sorting
    public Page<Location> getProvincesWithUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return locationRepository.findProvincesWithUsers(pageable);
    }

}