package com.project.skillforgebackend.config;


import com.project.skillforgebackend.auth.filter.JwtAuthFilter;
import com.project.skillforgebackend.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    private final RestAccessDeniedHandler restAccessDeniedHandler;

    private final RequestIdFilter requestIdFilter;

    private final MetricsAccess metricsAccess;

    private final AppProperties appProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(Customizer.withDefaults())

                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .headers(headers -> {

                    AppProperties.SecurityHeaders security = appProperties.securityHeaders();

                    if (security.hstsEnabled()) {
                        // Browsers ignore HSTS over plain HTTP, so this is safe
                        // to leave on during local HTTP development.
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(security.hstsIncludeSubDomains())
                                .maxAgeInSeconds(security.hstsMaxAgeSeconds()));
                    }

                    headers
                            .contentTypeOptions(Customizer.withDefaults())
                            .frameOptions(frame -> frame.deny())
                            .referrerPolicy(referrer ->
                                    referrer.policy(
                                            ReferrerPolicyHeaderWriter.ReferrerPolicy
                                                    .STRICT_ORIGIN_WHEN_CROSS_ORIGIN));

                    headers.permissionsPolicy(permissions -> permissions
                            .policy("camera=(), microphone=(), geolocation=()"));

                    headers.contentSecurityPolicy(csp -> csp
                            .policyDirectives(security.contentSecurityPolicy()));

                    Map<String, String> hardeningHeaders = new HashMap<>();
                    // Cross-origin isolation on this API: no cross-origin
                    // windows/scripts, shared resources opt in via CORP.
                    hardeningHeaders.put("Cross-Origin-Opener-Policy", "same-origin");
                    hardeningHeaders.put("Cross-Origin-Embedder-Policy", "require-corp");
                    hardeningHeaders.put("Cross-Origin-Resource-Policy", "same-origin");
                    // Legacy Adobe/PDF framing policy — deny.
                    hardeningHeaders.put("X-Permitted-Cross-Domain-Policies", "none");

                    headers.addHeaderWriter(new StaticHeadersWriter(
                            hardeningHeaders.entrySet().stream()
                                    .map(entry -> new org.springframework.security.web.header.Header(
                                            entry.getKey(), entry.getValue()))
                                    .toList()
                    ));
                })

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        // OpenAPI docs (public; disable springdoc in prod if undesired)
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Prometheus scrape: allowlisted IPs only; everyone
                        // else falls through to the authenticated rule below
                        .requestMatchers(metricsAccess).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/resources/{resourceId}/sections")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/resources/{resourceId}/sections/order")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/sections/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/sections/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/resources/{resourceId}/content")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/content/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/content/**")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/resources/{resourceId}/content/order")
                        .hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/v1/topics",
                                "/api/v1/topics/**",
                                "/api/v1/resources",
                                "/api/v1/resources/{resourceId}",
                                "/api/v1/resources/{resourceId}/content",
                                "/api/v1/resources/{resourceId}/sections",
                                "/api/v1/resources/{resourceId}/curriculum"
                        ).permitAll()
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )

                .addFilterBefore(requestIdFilter,
                        BasicAuthenticationFilter.class)

                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}