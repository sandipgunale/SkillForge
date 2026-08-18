# Changelog

All notable changes to SkillForge are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to four-part versions (MAJOR.MINOR.PATCH.MICRO).

## [0.3.0.0] - 2026-08-18

Foundry Precision: the landing page rebuilt from scratch as a 14-section
editorial narrative, with a new design system, GSAP choreography, and
Three.js scenes — the full product story from "the pile grows" to "forged".

### Added

- Landing page rebuild (`/landing`): editorial narrative in 14 sections
  (problem, shift, engine, product chapters, proof, roadmap, FAQ, mastery
  finale) with mono labels, display type, and the Foundry Precision design
  tokens (`src/styles/tokens.css`, `DESIGN.md`).
- Entrance choreography: deterministic GSAP from-states pre-rendered with
  direct style writes (no flash at the trigger point), once-only
  scroll-triggered timelines, fully skipped under `prefers-reduced-motion`.
- Scrub-reveal sections: light-up steps, progress rails, and counters driven
  by scroll position with direct style writes (reversible, fast-scroll safe).
- Three.js scenes (KnowledgeConstellation, GraduationCapScene,
  LivingCoreScene) with memoized geometry/palette/edge construction —
  theme changes re-tint instead of rebuilding geometry — plus adaptive
  resolution budgets and tab-visibility pausing.
- Navbar scroll-spy with shared section-registry helpers and a
  `lp:contentchange` refresh signal (FAQ toggles, image loads); scroll
  progress bar; keyboard-accessible FAQ; mobile sheet without horizontal
  overflow; 44px invisible hit areas on nav links and CTAs.
- AppLogo amber accent documented as an intentional brand exception.

### Changed

- `focus-visible` ring no longer mutates `border-radius` on keyboard nav.
- Landing cursor settles (stops after clean frames) instead of looping.
- Deferred 3D scene hooks now tear down observers and idle timers on unmount.

### Removed

- Legacy forge pages and static sections (`ForgePage`, `KnowledgeMap`,
  `Marquee`, `StaticSections`, `forge.css`, `forge/registry.js`,
  `useForgeFold.js`) and `HeroContent.jsx` — superseded by the rebuild.

### Fixed

- Entrance flash: ScrollTrigger defers timeline from-states and `clearProps`
  cleared pre-rendered from-values at creation — from-states are now applied
  as direct style writes matching the tween start values.
- Mastery finale copy uses `autoAlpha` so invisible CTAs are not clickable.
- KnowledgeConstellation hover loop iterated `positions.length` (1950)
  instead of `nodeCount` (650) — out-of-bounds read on the last hover.
- Scroll restoration on lazy-route refresh — `.landing-shell` keeps its
  `min-height` so the restored scroll position resolves.
- Halo freeze after resize/font-load until the next pointer move — the rect
  cache is invalidated on measure.

## [0.2.0.0] - 2026-08-09

Recruiter Mode: a dedicated engineering showcase page that tells the
SkillForge story with live, repo-generated facts.

### Added

- Showcase page (`/showcase`): recruiters can now take a guided chapter tour
  of how SkillForge was built — welcome ticker with live repo metrics, code
  walkthrough chapters, architecture overview, and a print-ready summary
  (`Ctrl/Cmd+P`), with keyboard-navigable chapter rail and hash anchors.
- Facts pipeline: every number on the showcase comes from
  `scripts/export-showcase-data.mjs` (commit counts, file counts, benchmark
  results) — the page can never show hardcoded claims. A dedicated CI job
  (`showcase-gates`) regenerates the manifest and fails the build on drift
  (G1), hardcoded numbers (G2), stale snapshots (G3), or oversize chunks (G4).
- Landing page navigation now links to the showcase.

### Changed

- `shadcn` CLI moved to devDependencies — production install no longer pulls
  in its dependency tree (`npm audit --omit=dev` is clean).
- `react-router-dom` bumped to 7.18.2.
- Design system: ember/aurora radial accents and scroll-margin tokens for the
  showcase chapter sections.

### Fixed

- `export-showcase-data.mjs --check` no longer rewrites the manifest before
  comparing — it used to always pass and dirty the working tree; it now reads
  the committed file and fails on real drift.
- Showcase chapter rail now tracks the active chapter (the page was passing
  the wrong prop, so no tab was ever marked selected and focus never moved).
- CI gate G1 now works on pull-request runners: the branch field is excluded
  from the manifest comparison (checkouts are detached) and the job fetches
  full history so commit counts match.

### Performance

- Showcase chunk stays within budget: 7.79 kB gzip (G4 gate, ≤ 12 kB).
- Showcase page: ~13 kB transfer, FCP 480–610 ms on first visit (2026-08-09
  benchmark); landing unchanged at ~688 kB total.

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
