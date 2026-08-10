package com.project.skillforgebackend.config;

import com.project.skillforgebackend.config.properties.AdminBootstrapProperties;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the first ADMIN account at startup so the admin console is reachable
 * without manual SQL. Idempotent: runs once, never touches existing admins,
 * and does nothing at all unless {@code ADMIN_PASSWORD} is configured
 * (secrets stay env-only, matching the repo's configuration rules).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties adminBootstrapProperties;

    @Override
    public void run(ApplicationArguments args) {
        String password = adminBootstrapProperties.password();
        if (password == null || password.isBlank()) {
            log.warn("ADMIN_PASSWORD not set — skipping default admin bootstrap");
            return;
        }
        if (userRepository.existsByRole(User.Role.ADMIN)) {
            log.debug("ADMIN user already exists — skipping default admin bootstrap");
            return;
        }

        User admin = User.builder()
                .email(adminBootstrapProperties.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(password))
                .fullName("SkillForge Admin")
                .role(User.Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin account: {}", admin.getEmail());
    }
}
