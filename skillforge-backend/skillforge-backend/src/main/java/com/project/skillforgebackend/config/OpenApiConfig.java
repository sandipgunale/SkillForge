package com.project.skillforgebackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger UI) metadata for the public API contract.
 *
 * Versioning policy: the current contract is {@code /api/v1}. Breaking
 * changes ship under a new major segment ({@code /api/v2}) while v1
 * remains supported; additive changes never require a bump.
 *
 * Errors across all endpoints share the ApiError shape:
 * {@code status, error, message, path, timestamp, fieldErrors}.
 */
@Configuration
public class OpenApiConfig {

    public static final String API_VERSION = "v1";

    @Bean
    public OpenAPI skillforgeOpenApi() {

        return new OpenAPI()
                .info(new Info()
                        .title("SkillForge API")
                        .version(API_VERSION)
                        .description(
                                "AI-powered learning platform backend.\n\n"
                                        + "- All endpoints exchange JSON.\n"
                                        + "- Errors use the ApiError shape "
                                        + "(status / error / message / path / timestamp / fieldErrors).\n"
                                        + "- Versioning policy: the current contract is /api/v1; "
                                        + "breaking changes ship as /api/v2 while v1 stays supported.\n"
                        ))
                .addSecurityItem(
                        new SecurityRequirement().addList("bearerAuth")
                )
                .components(new Components().addSecuritySchemes(
                        "bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ));
    }
}
