package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.dto.AuthResponse;
import com.project.skillforgebackend.auth.dto.LoginRequest;
import com.project.skillforgebackend.auth.dto.RegisterRequest;
import com.project.skillforgebackend.common.exception.EmailAlreadyExistsException;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.mapper.UserMapper;
import com.project.skillforgebackend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Spy
    private final UserMapper userMapper = new UserMapper();

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("learner@example.com")
                .passwordHash("encoded-hash")
                .fullName("Learner")
                .role(User.Role.STUDENT)
                .isActive(true)
                .build();
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_createsUserAndIssuesRefreshToken() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Str0ngPass123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.getRefreshTokenLifetime(false)).thenReturn(86_400_000L);
        when(jwtService.generateRefreshToken("learner@example.com", false))
                .thenReturn("raw-refresh");
        when(jwtService.generateAccessToken(eq("learner@example.com"), any())).thenReturn("access");

        RegisterRequest request = new RegisterRequest();
        request.setFullName("New User");
        request.setEmail(" new@example.com ");
        request.setPassword("Str0ngPass123");

        AuthResponse response = authService.register(request);

        assertThat(response.getRefreshToken()).isEqualTo("raw-refresh");
        assertThat(response.getUser().getRole()).isEqualTo("STUDENT");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("new@example.com");

        verify(refreshTokenService).issue(user.getId(), "raw-refresh", 86_400_000L);
        verify(eventPublisher).publishEvent(any(AuthAuditEvent.class));
    }

    @Test
    void register_duplicateEmailThrows() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest();
        request.setFullName("Dup");
        request.setEmail("dup@example.com");
        request.setPassword("Str0ngPass123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class);
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_successIssuesRefreshTokenAndPublishesEvent() {
        when(userRepository.findByEmail("learner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Str0ngPass123", "encoded-hash")).thenReturn(true);
        when(jwtService.getRefreshTokenLifetime(true)).thenReturn(604_800_000L);
        when(jwtService.generateRefreshToken("learner@example.com", true))
                .thenReturn("raw-refresh");
        when(jwtService.generateAccessToken(eq("learner@example.com"), any())).thenReturn("access");

        LoginRequest request = new LoginRequest();
        request.setEmail(" learner@example.com ");
        request.setPassword("Str0ngPass123");
        request.setRememberMe(true);

        AuthResponse response = authService.login(request);

        assertThat(response.getRefreshToken()).isEqualTo("raw-refresh");
        assertThat(response.isRememberMe()).isTrue();
        verify(refreshTokenService).issue(user.getId(), "raw-refresh", 604_800_000L);
        verify(eventPublisher).publishEvent(any(AuthAuditEvent.class));
    }

    @Test
    void login_wrongPasswordThrowsAndPublishesFailureEvent() {
        when(userRepository.findByEmail("learner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-hash")).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setEmail("learner@example.com");
        request.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        ArgumentCaptor<AuthAuditEvent> captor =
                ArgumentCaptor.forClass(AuthAuditEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertThat(captor.getValue().type()).isEqualTo(AuthAuditEvent.Type.LOGIN_FAILURE);
        assertThat(captor.getValue().email()).isEqualTo("learner@example.com");

        verify(refreshTokenService, never()).issue(any(), any(), anyLong());
    }

    @Test
    void login_inactiveUserThrows() {
        user.setActive(false);
        when(userRepository.findByEmail("learner@example.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("learner@example.com");
        request.setPassword("anything");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_unknownEmailThrowsGenerically() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("anything");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    // ── refresh ──────────────────────────────────────────────────────────────

    @Test
    void refresh_rotatesAndReturnsNewToken() {
        when(jwtService.isRefreshToken("old-refresh")).thenReturn(true);
        when(jwtService.extractEmail("old-refresh")).thenReturn("learner@example.com");
        when(userRepository.findByEmail("learner@example.com")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("old-refresh", "learner@example.com")).thenReturn(true);
        when(jwtService.extractClaim("old-refresh", JwtService.CLAIM_REMEMBER_ME))
                .thenReturn("false");
        when(jwtService.getRefreshTokenLifetime(false)).thenReturn(86_400_000L);
        when(jwtService.generateRefreshToken("learner@example.com", false))
                .thenReturn("new-refresh");
        when(jwtService.generateAccessToken(eq("learner@example.com"), any())).thenReturn("access");

        AuthResponse response = authService.refresh("old-refresh");

        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
        assertThat(response.isRememberMe()).isFalse();
        verify(refreshTokenService).rotate(
                user.getId(),
                "old-refresh",
                "new-refresh",
                86_400_000L
        );
    }

    @Test
    void refresh_rejectsAccessToken() {
        when(jwtService.isRefreshToken("access-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh("access-token"))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(eventPublisher).publishEvent(any(AuthAuditEvent.class));
    }

    @Test
    void refresh_rejectsUnknownUser() {
        when(jwtService.isRefreshToken("old-refresh")).thenReturn(true);
        when(jwtService.extractEmail("old-refresh")).thenReturn("ghost@example.com");
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh("old-refresh"))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(refreshTokenService, never()).rotate(any(), any(), any(), anyLong());
    }

    @Test
    void refresh_rejectsExpiredToken() {
        when(jwtService.isRefreshToken("expired-refresh")).thenReturn(true);
        when(jwtService.extractEmail("expired-refresh")).thenReturn("learner@example.com");
        when(userRepository.findByEmail("learner@example.com")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("expired-refresh", "learner@example.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh("expired-refresh"))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(refreshTokenService, never()).rotate(any(), any(), any(), anyLong());
    }
}