# AGENTS.md — SkillForge AI Engineering Workflow

## GStack

This repository uses GStack as the standard AI engineering workflow.

- Always use the GStack browser (/browse) for browser automation.
- Prefer GStack workflows over ad-hoc implementations.
- Never bypass review workflows.
- Use GStack skills whenever applicable.

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.config/opencode/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
> cd ~/gstack && ./setup --host opencode
> (cd ~/gstack && ./setup --team)
> ~/gstack/bin/gstack-team-init required
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/gstack/... for gstack file paths (the global path).

### Registered Skills

The following GStack skills are available for this repository:

- /office-hours — product/idea incubation
- /plan-ceo-review — business/strategy review of plans
- /plan-eng-review — architecture review of plans
- /plan-design-review — UX/design review of plans
- /plan-devex-review — developer-experience review of plans
- /design-consultation — design advice
- /design-shotgun — UI exploration/ideation
- /design-html — approved mockup to production code
- /review — code review
- /design-review — design review
- /cso — security audit
- /autoplan — plan generation from an idea
- /qa — QA testing workflow
- /qa-only — run QA checks without fixes
- /benchmark — performance audit
- /ship — ship checklist and release
- /land-and-deploy — deploy workflow
- /canary — post-release monitoring
- /document-release — release documentation
- /document-generate — generate docs
- /investigate — bug investigation
- /retro — weekly improvements retrospective
- /browse — browser automation
- /setup-browser-cookies — cookie setup for browser automation
- /setup-deploy — deploy configuration
- /setup-gbrain — gbrain (context memory) setup
- /careful — slow, careful mode
- /freeze — freeze a skill/behavior
- /guard — guardrails for AI work
- /unfreeze — unfreeze a skill/behavior
- /gstack-upgrade — upgrade gstack
- /learn — learn a new skill
- /codex — codex integration

## Standard Engineering Workflow

Every significant task must follow this workflow:

```
Idea
  ↓
/office-hours
  ↓
/autoplan
  ↓
/plan-ceo-review
  ↓
/plan-design-review
  ↓
/plan-eng-review
  ↓
Implementation
  ↓
/review
  ↓
/cso
  ↓
/qa
  ↓
/benchmark
  ↓
/document-release
  ↓
/ship
```

No feature should skip planning, review, QA, or documentation.

## Mandatory Usage Rules

Before implementing any feature:

1. Run /office-hours (idea incubation)
2. Run /autoplan (generate plan)
3. Review architecture with /plan-eng-review
4. Review UX with /plan-design-review
5. Implement
6. Review code with /review
7. Security audit with /cso
8. QA with /qa
9. Performance with /benchmark
10. Update documentation with /document-release
11. Ship with /ship

## Skill Usage Matrix

| Task | Skill |
| --- | --- |
| Product ideas | /office-hours |
| Architecture | /plan-eng-review |
| Design System | /plan-design-review |
| UI Exploration | /design-shotgun |
| Convert approved mockup into production code | /design-html |
| Code Review | /review |
| Security Audit | /cso |
| Bug Investigation | /investigate |
| QA Testing | /qa |
| Performance Audit | /benchmark |
| Documentation | /document-release |
| Release | /ship |
| Post Release Monitoring | /canary |
| Weekly Improvements | /retro |

## SkillForge Specific Rules

For THIS project, always use:

| Area | Skill |
| --- | --- |
| Landing Page | /design-shotgun |
| Dashboard | /design-shotgun |
| Authentication Pages | /plan-design-review |
| Learning Roadmap | /plan-eng-review |
| AI Module | /cso |
| Quiz Engine | /review |
| Analytics | /benchmark |
| Profile | /design-review |

Every UI redesign must go through:

```
design-shotgun
  ↓
design review
  ↓
design-html
```

before implementation.

## Repository Layout

- Repo root: `D:\OpenCode\SkillForge\SkillForge`
- Backend (nested Maven project): `skillforge-backend/skillforge-backend`
  - Build with PowerShell: `.\mvnw.cmd -q compile` / `.\mvnw.cmd test` / `.\mvnw.cmd verify` (JaCoCo gate enforced)
- Backend module layout: `src/main/java/com/project/skillforgebackend/<feature>` (auth, quiz, learningpath, analytics, ai, bookmark, rating, gamification, resource, admin, common, config)
- AI subsystem: `ai/` (client, resilience, service, prompt, guardrail, validation, cache, metrics, exception) + `config/properties/` (GeminiProperties, AiResilienceProperties, AiServiceProperties)
- Frontend: `skillforge-frontend` (Vite + React 19). Build: `npm run build`. Lint: `npm run lint` (must be warning-free).

## Enterprise Engineering Standards

These standards bind every Pull Request and every AI-assisted change. Verify against
them before merging.

### Pull Request Gates

Every PR MUST satisfy all of the following before it can merge:

- Security review passed (/cso)
- Engineering review passed (/review)
- Design review passed (for anything user-facing)
- Benchmark comparison completed (/benchmark for anything performance-sensitive)
- Documentation updated (/document-release)
- Tests passing (backend: `mvn verify` incl. failsafe ITs + JaCoCo gate; frontend: build + lint)
- QA completed (/qa)
- Lighthouse maintained (frontend; no regression on the perf budget below)

### AI Coding Rules

- Never duplicate logic; extract and compose.
- Keep files small and modular; keep methods short and single-purpose.
- Prefer composition over inheritance and interfaces over concrete types.
- Use constructor injection for every dependency (Spring/DI).
- Follow SOLID and Clean Architecture; avoid unnecessary abstractions.
- No dead code, unused imports, magic numbers, TODO comments, or commented-out code.
- No AI-generated code smells (bloat, speculative generality, copy-paste rewrites).

### Code Quality Review Scope

Every PR touching these must review each artifact for correctness, security,
and drift: Java classes, React components, hooks, utilities, DTOs, entities,
mappers, repositories, controllers, services, configurations, API contracts,
SQL queries, and Flyway migrations. Fix all code smells found.

### Production Engineering

All shipped code must follow the established observability/robustness pattern:

- Structured logging with correlation IDs (see `RequestIdFilter` + MDC).
- Health checks, Micrometer metrics, Prometheus scrape endpoint (`/actuator/prometheus`).
- Graceful shutdown; Docker health checks (see `docker-compose.yml`).
- Rate limiting (bucket4j), caching (Caffeine), retry + circuit breaker (resilience4j).
- Consistent API error envelopes (Problem-Details style `ApiError`), never leak internals.
- Compression on the gateway/proxy; image optimization, code splitting and
  bundle optimization on the frontend.

### AI Module Checklist

Every AI feature must pass all of: prompt review, safety review, injection
resistance (`AiPromptGuard`), schema validation (parsers + `AiResponseValidator`),
timeout, retry, fallback (provider registry), analytics, token tracking, cost
tracking, caching, version control of prompt templates, provider abstraction
(`AiProvider` port), and structured parsing. Prompt internals must never leak
to clients (see `GlobalExceptionHandler` AIServiceException mapping).

### Frontend Engineering

Every UI component must support: accessibility, keyboard navigation, ARIA,
responsive layout, performance, consistent animation, error/loading/empty
states, skeletons, dark + light mode, and reduced-motion mode
(use `useMotionSafe()` / `prefers-reduced-motion`).

### GSAP Motion System

GSAP is the primary animation engine. Centralize ALL animation in one place:

- One motion library (see `src/lib/motion.js`) — all presets, timelines,
  ScrollTrigger, and SplitText usage live there.
- Motion tokens (duration/easing) come from one source (`src/lib/design-system.js`).
- Use GSAP timelines; share presets, easing, and durations.
- Cleanup every animation via context-safe `gsap.context` / `useGSAP`.
- Never duplicate animation logic across components.
- Respect `prefers-reduced-motion` (`useMotionSafe()`).

### Three.js System

One reusable 3D engine (see existing scenes e.g. `LivingCoreScene`,
`KnowledgeConstellation`) — no ad-hoc floating cubes. Reusable premium
components are preferred: AI core, knowledge galaxy, skill orbit, particle
network, glass holograms, volumetric lighting, bloom/post-processing, mouse
physics, scroll-driven camera, adaptive LOD. Pause rendering when off-screen;
target 60 FPS; degrade gracefully on low-end hardware (adaptive pixel ratio,
reduced particles when `prefers-reduced-motion` or low device memory).

### Performance Budgets

Targets: Lighthouse >= 98, Accessibility >= 100, Best Practices >= 100,
SEO >= 100. FCP < 1.5s, LCP < 2.0s, INP < 200ms, CLS < 0.05. Keep the JS
bundle minimized; lazy-load routes (see `routes/index.jsx`) and heavy 3D
scenes. Avoid regressing beyond these budgets in any PR.

### Escalation of New Ideas

Feature ideas always start at /office-hours, produce a plan with /autoplan,
pass the plan review gates (/plan-ceo-review, /plan-eng-review,
/plan-design-review, /plan-devex-review), and only then move to implementation.

### Final Verification Checklist

Before any ship: run reviews, /qa, /benchmark, security review, accessibility
review, and documentation update. Manually verify new features. The repo must
be clean: no build warnings, no lint warnings, no TypeScript errors, no
Spring Boot startup warnings, no failing tests, no duplicated logic.
