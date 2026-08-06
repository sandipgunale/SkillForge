package com.project.skillforgebackend.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ConfigValidationServiceTest {

    private final ConfigValidationService service = new ConfigValidationService();

    private Environment envWith(String jwtSecret, String gemini, String openai, String... profiles) {
        Environment env = mock(Environment.class);
        when(env.getProperty(eq("DB_URL"), eq(""))).thenReturn("jdbc:postgresql://localhost:5432/skillforge");
        when(env.getProperty(eq("DB_USERNAME"), eq(""))).thenReturn("postgres");
        when(env.getProperty(eq("DB_PASSWORD"), eq(""))).thenReturn("secret");
        when(env.getProperty(eq("JWT_SECRET"), eq(""))).thenReturn(jwtSecret);
        when(env.getProperty(eq("GEMINI_API_KEY"), eq(""))).thenReturn(gemini);
        when(env.getProperty(eq("OPENAI_API_KEY"), eq(""))).thenReturn(openai);
        when(env.getActiveProfiles()).thenReturn(profiles);
        return env;
    }

    private String validJwt() {
        return Base64.getEncoder().encodeToString(new byte[64]);
    }

    @Test
    void validConfiguration_passes() {
        assertThatCode(() -> service.validate(envWith(validJwt(), "gemini-key", "", "dev")))
                .doesNotThrowAnyException();
    }

    @Test
    void missingRequiredVars_areAllListed() {
        Environment env = mock(Environment.class);
        when(env.getProperty(eq("DB_URL"), eq(""))).thenReturn("");
        when(env.getProperty(eq("DB_USERNAME"), eq(""))).thenReturn("");
        when(env.getProperty(eq("DB_PASSWORD"), eq(""))).thenReturn("");
        when(env.getProperty(eq("JWT_SECRET"), eq(""))).thenReturn("");
        when(env.getProperty(eq("GEMINI_API_KEY"), eq(""))).thenReturn("");
        when(env.getProperty(eq("OPENAI_API_KEY"), eq(""))).thenReturn("");
        when(env.getActiveProfiles()).thenReturn(new String[]{"dev"});

        assertThatThrownBy(() -> service.validate(env))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("DB_URL")
                .hasMessageContaining("DB_USERNAME")
                .hasMessageContaining("DB_PASSWORD")
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void shortJwtSecret_isRejectedWithByteCount() {
        String shortSecret = Base64.getEncoder().encodeToString(new byte[16]);

        assertThatThrownBy(() -> service.validate(envWith(shortSecret, "", "", "dev")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("16 bytes")
                .hasMessageContaining("32");
    }

    @Test
    void nonBase64JwtSecret_isRejected() {
        assertThatThrownBy(() -> service.validate(envWith("not-base64!!!", "", "", "dev")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Base64");
    }

    @Test
    void prodWithoutAiKey_isRejected() {
        assertThatThrownBy(() -> service.validate(envWith(validJwt(), "", "", "prod")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("GEMINI_API_KEY");
    }

    @Test
    void prodWithGeminiKey_passes() {
        assertThatCode(() -> service.validate(envWith(validJwt(), "gemini-key", "", "prod")))
                .doesNotThrowAnyException();
    }

    @Test
    void devWithoutAiKey_stillPasses() {
        assertThatCode(() -> service.validate(envWith(validJwt(), "", "", "dev")))
                .doesNotThrowAnyException();
    }
}
