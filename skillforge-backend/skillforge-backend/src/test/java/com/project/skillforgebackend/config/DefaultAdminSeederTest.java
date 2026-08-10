package com.project.skillforgebackend.config;

import com.project.skillforgebackend.config.properties.AdminBootstrapProperties;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DefaultAdminSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DefaultAdminSeeder seeder;

    @BeforeEach
    void setUp() {
        seeder = new DefaultAdminSeeder(
                userRepository,
                passwordEncoder,
                new AdminBootstrapProperties("admin@skillforge.com", "Admin@12345")
        );
    }

    @Test
    void run_seedsAdminWhenNoneExists() {
        when(userRepository.existsByRole(User.Role.ADMIN)).thenReturn(false);
        when(passwordEncoder.encode("Admin@12345")).thenReturn("encoded");

        seeder.run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("admin@skillforge.com");
        assertThat(saved.getPasswordHash()).isEqualTo("encoded");
        assertThat(saved.getRole()).isEqualTo(User.Role.ADMIN);
        assertThat(saved.isActive()).isTrue();
    }

    @Test
    void run_skipsWhenAdminAlreadyExists() {
        when(userRepository.existsByRole(User.Role.ADMIN)).thenReturn(true);

        seeder.run(null);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void run_skipsWhenPasswordNotConfigured() {
        seeder = new DefaultAdminSeeder(
                userRepository,
                passwordEncoder,
                new AdminBootstrapProperties("admin@skillforge.com", "")
        );

        seeder.run(null);

        verify(userRepository, never()).save(any(User.class));
    }
}
