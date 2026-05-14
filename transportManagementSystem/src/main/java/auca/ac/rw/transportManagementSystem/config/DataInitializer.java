package auca.ac.rw.transportManagementSystem.config;

import auca.ac.rw.transportManagementSystem.model.Role;
import auca.ac.rw.transportManagementSystem.model.User;
import auca.ac.rw.transportManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUserIfNotFound();
    }

    private void createAdminUserIfNotFound() {
        Optional<User> adminUser = userRepository.findByEmail("alainfabricehirwa@gmail.com");
        if (adminUser.isEmpty()) {
            User admin = new User();
            admin.setFullNames("Alain Fabrice");
            admin.setEmail("alainfabricehirwa@gmail.com");
            admin.setPhoneNumber("0000000000");
            admin.setPassword(passwordEncoder.encode("Alain2003")); // Default password
            admin.setRole(Role.ADMIN);
            
            userRepository.save(admin);
            System.out.println("Default Admin User created: alainfabricehirwa@gmail.com / Alain2003");
        }
    }
}
