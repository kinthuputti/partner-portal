package com.haett.partner_portal;

import com.haett.partner_portal.entity.User;
import com.haett.partner_portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class PartnerPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(PartnerPortalApplication.class, args);
	}

	// FIX: seed creates real User rows with hashed passwords, not just a demo application
	@Bean
	CommandLineRunner seed(UserRepository userRepo, PasswordEncoder encoder) {
		return args -> {

			// Admin account
			if (!userRepo.existsByEmail("admin@haett.com")) {
				User admin = new User();
				admin.setEmail("admin@haett.com");
				admin.setPassword(encoder.encode("admin123"));
				admin.setName("Haett Admin");
				admin.setRole(User.Role.ADMIN);
				userRepo.save(admin);
			}

			// Test user account
			if (!userRepo.existsByEmail("user@haett.com")) {
				User user = new User();
				user.setEmail("user@haett.com");
				user.setPassword(encoder.encode("user123"));
				user.setName("Test User");
				user.setRole(User.Role.USER);
				userRepo.save(user);
			}

			System.out.println("===========================================");
			System.out.println("  SEED COMPLETE — test credentials:");
			System.out.println("  Admin : admin@haett.com / admin123");
			System.out.println("  User  : user@haett.com  / user123");
			System.out.println("===========================================");
		};
	}
}