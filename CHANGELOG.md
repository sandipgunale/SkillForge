# Changelog

All notable changes to SkillForge are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to four-part versions (MAJOR.MINOR.PATCH.MICRO).

## [0.1.0.0] - 2026-08-08

First formal release: the platform goes from baseline to production-hardened
with a redesigned premium experience.

### Added

- The Forge redesign: full design-token system (ember/ink/aurora), GSAP motion
  system, and a reusable Three.js engine â€” premium landing, auth, dashboard,
  and workspace experiences with dark/light and reduced-motion support.
- Workspace module: AI copilot, learning canvas, and knowledge navigation, session bar
  bar, and a markdown renderer for a full study-workbench flow.
- Profile and bookmark improvements: folder organization for bookmarks,
  profile editing, and consistent mutation behavior across the app.
- Admin module: user management (list/search/paginate, role assignment,
  enable/disable), content management (topics/tags CRUD), stats dashboard.
- Role-aware app shell: role-based navigation and workspaces (`/admin` â€” ADMIN,
  `/instructor` â€” INSTRUCTOR), with a designed 403 page.
- Password reset flow: forgot/reset pages, hashed reset tokens with TTL and
  purge, generic responses, and optional SMTP email delivery.
- Learning-path resume: partial quiz answers are auto-saved as you go; you can
  leave a quiz mid-way and pick up where you left off.
- Notifications and gamification: unread counts, mark-read flows, and badges,
  points, and levels.

### Changed

- Sessions: access tokens moved into memory with silent refresh rotation;
  sessions survive page reloads and refreshes cleanly.
- Quiz engine: ownership checks, single-active-quiz semantics, expiry with
  ABANDONED state, and history filtering (source/difficulty/status).
- Resources: full CRUD with type/difficulty/topic/tags, ratings keep
  `avgRating` fresh (cache evicted on rating writes), bookmark folders.
- Auth hardening: `iss`/`aud` JWT claims, rate-limited login/refresh/reset
  endpoints, generic auth errors without user enumeration.

### Fixed

- Database schema drift: `estimated_minutes` migration closes the startup
  blocker; `ddl-auto=validate` passes clean.
- Frontend data-contract mismatches across quiz, learning-path, dashboard,
  bookmark, and rating API layers.
- Refresh rotation now re-issues tokens without hard logouts; cookie scoping
  (`path=/api/auth`, SameSite LAX) tightened.
- AI errors are masked server-side (generic 502) â€” internals never leak.
- Sort fields on admin user and quiz history are whitelisted (invalid â†’ 400).

### Security

- Secrets are env-only: `JWT_SECRET`, `DB_*`, `*_API_KEY`, `SMTP_*` â€” the
  backend fails startup on missing config; compose requires `JWT_SECRET`.
- Security headers (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`), JSON 403 handler, generic AI provider errors.

### Performance

- All animation centralized into one motion library; Three.js lazy-loaded into
  its own chunk; routes code-split; landing â‰ˆ 29 kB gzip.
- Benchmark (2026-08-08): FCP 132â€“244 ms across pages, budgets pass on
  Lighthouse targets, route lazy chunks 1â€“9 kB.
- Backend: Caffeine caching (resources/dashboard), bucket4j rate limiting,
  resilience4j retry/circuit-breaker, structured logging with correlation IDs,
  `/actuator/prometheus` scrape endpoint.

### Infrastructure

- Testcontainers integration tests (`mvn verify`: failsafe + JaCoCo floor),
  Flyway schema-drift validation, OpenAPI 3 + Swagger UI.
- Docker Compose for PostgreSQL + backend with health checks; `.env.example` documented.
