package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.auth.dto.ForgotPasswordRequest;
import com.project.skillforgebackend.auth.dto.ResetPasswordRequest;
import com.project.skillforgebackend.auth.entity.PasswordResetToken;
import com.project.skillforgebackend.auth.repository.PasswordResetTokenRepository;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailService mailService;

    @InjectMocks
    private PasswordResetService service;

    private User user;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "tokenTtlMinutes", 30L);
        user = User.builder()
                .id(UUID.randomUUID())
                .email("learner@example.com")
                .passwordHash("old-hash")
                .fullName("Learner")
                .isActive(true)
                .build();
    }

    @Test
    void requestReset_generatesHashedTokenAndInvalidatesOldOnes() {
        when(userRepository.findByEmail("learner@example.com"))
                .thenReturn(Optional.of(user));

        service.requestReset(new ForgotPasswordRequest(" learner@example.com "));

        ArgumentCaptor<PasswordResetToken> captor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(captor.capture());

        PasswordResetToken saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(user.getId());
        // Raw token never stored — only its hash
        assertThat(saved.getTokenHash()).isNotBlank();
        assertThat(saved.getTokenHash()).doesNotContain("example");
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());
        verify(tokenRepository).findByUserIdAndUsedAtIsNull(user.getId());
        verify(mailService).sendPasswordResetEmail(
                eq("learner@example.com"), anyString());
    }

    @Test
    void requestReset_unknownEmailIsSilentlyIgnored() {
        when(userRepository.findByEmail("nobody@example.com"))
                .thenReturn(Optional.empty());

        service.requestReset(new ForgotPasswordRequest("nobody@example.com"));

        verify(tokenRepository, never()).save(any());
        verify(mailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    void resetPassword_updatesHashAndMarksTokenUsed() {
        String rawToken = PasswordResetService.generateToken();
        String tokenHash = PasswordResetService.hash(rawToken);

        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(1800))
                .build();

        when(tokenRepository.findTopByTokenHashOrderByCreatedAtDesc(tokenHash))
                .thenReturn(Optional.of(entity));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("new-hash");

        service.resetPassword(new ResetPasswordRequest(rawToken, "NewPass@123"));

        assertThat(entity.getUsedAt()).isNotNull();
        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        verify(userRepository).save(user);
        verify(tokenRepository).save(entity);
    }

    @Test
    void resetPassword_rejectsExpiredToken() {
        String rawToken = PasswordResetService.generateToken();

        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(PasswordResetService.hash(rawToken))
                .expiresAt(Instant.now().minusSeconds(60))
                .build();

        when(tokenRepository.findTopByTokenHashOrderByCreatedAtDesc(anyString()))
                .thenReturn(Optional.of(entity));

        assertThatThrownBy(() ->
                service.resetPassword(new ResetPasswordRequest(rawToken, "NewPass@123"))
        ).isInstanceOf(InvalidCredentialsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_rejectsUsedToken() {
        String rawToken = PasswordResetService.generateToken();

        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(PasswordResetService.hash(rawToken))
                .expiresAt(Instant.now().plusSeconds(1800))
                .usedAt(Instant.now())
                .build();

        when(tokenRepository.findTopByTokenHashOrderByCreatedAtDesc(anyString()))
                .thenReturn(Optional.of(entity));

        assertThatThrownBy(() ->
                service.resetPassword(new ResetPasswordRequest(rawToken, "NewPass@123"))
        ).isInstanceOf(InvalidCredentialsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_rejectsUnknownToken() {
        when(tokenRepository.findTopByTokenHashOrderByCreatedAtDesc(anyString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.resetPassword(new ResetPasswordRequest("garbage", "NewPass@123"))
        ).isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void generateToken_isUrlSafeAndUniqueAcrossCalls() {
        String first = PasswordResetService.generateToken();
        String second = PasswordResetService.generateToken();

        assertThat(first).doesNotContain("+", "/", "=");
        assertThat(first).isNotEqualTo(second);
        assertThat(first.length()).isGreaterThanOrEqualTo(40);
    }
}
