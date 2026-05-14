package auca.ac.rw.transportManagementSystem.config;

import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserInfoService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(UserInfoService.class);

    @Autowired
    private UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        try {
            // Try to find user - if duplicates exist, this will throw NonUniqueResultException
            Optional<User> userDetail = repository.findByEmail(username);

            // Converting userDetail to UserDetails
            return userDetail.map(UserInfoDetails::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | 
                 jakarta.persistence.NonUniqueResultException e) {
            // Handle case where multiple users found (duplicates)
            // Log warning and use first user
            log.warn("Multiple users found with email: {}. Using first result (oldest by userId).", username);
            try {
                List<User> users = repository.findByEmailList(username);
                if (!users.isEmpty()) {
                    // Use the first user (oldest by userId due to ORDER BY)
                    User firstUser = users.get(0);
                    log.info("Selected user ID: {} for email: {}", firstUser.getUserId(), username);
                    return new UserInfoDetails(firstUser);
                }
            } catch (Exception ex) {
                log.error("Error handling duplicate users: {}", ex.getMessage(), ex);
            }
            throw new UsernameNotFoundException("Multiple users found with email: " + username + ". Please contact administrator.");
        } catch (Exception e) {
            log.error("Error loading user by username: {}", e.getMessage(), e);
            throw new UsernameNotFoundException("Error loading user: " + e.getMessage());
        }
    }
}
