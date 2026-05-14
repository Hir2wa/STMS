package auca.ac.rw.transportManagementSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "auca.ac.rw.transportManagementSystem.model")
@EnableJpaRepositories(basePackages = "auca.ac.rw.transportManagementSystem.repository")
public class TransportManagementSystemApplication {
   
	public static void main(String[] args) {
		SpringApplication.run(TransportManagementSystemApplication.class, args);
	}

}
