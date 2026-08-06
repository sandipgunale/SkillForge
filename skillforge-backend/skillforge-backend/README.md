# SkillForge Backend

Spring Boot 3.5 / Java 21 backend for the SkillForge learning platform.

## Requirements

- Java 21+
- Maven 3.9+
- PostgreSQL 15+ (database named `skillforge` by default)

## Setup

```bash
# 1. Copy the env template and fill in real values
cp .env.example .env

# 2. Run
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. The `dev` profile is the
default active profile.

## Environment Variables

| Variable            | Required | Default                        | Description                                   |
| ------------------- | -------- | ------------------------------ | --------------------------------------------- |
| `DB_URL`            | yes      | —                              | JDBC URL, e.g. `jdbc:postgresql://localhost:5432/skillforge` |
| `DB_USERNAME`       | yes      | —                              | PostgreSQL user                               |
| `DB_PASSWORD`       | yes      | —                              | PostgreSQL password                           |
| `JWT_SECRET`        | yes      | —                              | Base64 secret ≥ 32 bytes (`openssl rand -base64 64`) |
| `GEMINI_API_KEY`    | yes*     | —                              | Google Gemini API key (*needed for AI features) |
| `GEMINI_MODELS`     | no       | `gemini-flash-latest,gemini-2.5-flash,gemini-2.0-flash` | Comma-separated models; client rotates on 429 |
| `GEMINI_MAX_QUESTIONS_PER_DAY` | no | `200` | Per-user daily AI question budget (cost guardrail) |
| `OPENAI_API_KEY`    | no       | —                              | Optional; unused by current AI paths          |
| `COOKIE_SECURE`     | no       | `false`                        | Set `true` behind HTTPS (refresh cookie Secure flag) |
| `COOKIE_SAME_SITE`  | no       | `LAX`                          | Refresh cookie SameSite policy                |
| `RATE_LIMIT_ENABLED`| no       | `true`                         | `false` disables login/register rate limiting |
| `FRONTEND_URL`      | no       | `http://localhost:5173`        | Origin used in password-reset links           |
| `SMTP_HOST`         | no       | —                              | SMTP server; empty → reset links are logged (dev) |
| `SMTP_PORT`         | no       | `587`                          | SMTP port                                     |
| `SMTP_USERNAME`     | no       | —                              | SMTP user                                     |
| `SMTP_PASSWORD`     | no       | —                              | SMTP password                                 |
| `SMTP_AUTH`         | no       | `true`                         | Enable SMTP auth                              |
| `SMTP_STARTTLS`     | no       | `true`                         | Enable STARTTLS                               |

## Configuration Profiles

- `dev` (default): DEBUG app logging, relaxed cookie flags for localhost.
- Any other profile: INFO logging.

## Useful Commands

```bash
mvn -q compile          # compile only
mvn test                # unit + integration tests
mvn spring-boot:run     # run locally
```

## API

See `docs/API_REFERENCE.md` in the repository root for the endpoint
reference.
