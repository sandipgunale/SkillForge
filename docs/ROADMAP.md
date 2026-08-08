# SkillForge — Implementation Roadmap

Prioritized by impact. Phase 1 is strictly blocking (app does not boot / pages crash); Phase 2 restores broken features; Phase 3 hardens; Phase 4 extends.

## Phase 1 — Startup & build blockers (do first)

1. **B1** Backend: add Flyway migration `V13__add_estimated_minutes_to_resources.sql` (`ALTER TABLE resources ADD COLUMN estimated_minutes INT NOT NULL DEFAULT 0;`) so `ddl-auto=validate` passes.
2. **F6** Frontend: finish resourcesService refactor — restore `export const resourcesService = {...}` named export (or switch hooks to default import; pick named export to match the 4 existing consumers).
3. **F1** Frontend: fix `useLogin.js` import → `@/features/auth/api/authService`.
4. **F2** Frontend: fix `profileService.js` import → `apiClient` from `@/services/api/axios` (or `@/services/api`).
5. **F3/F12** Frontend: create `features/quiz/questions/{mcq,coding,interview,scenario}` renderers (or a single generic renderer) keyed by `question.type`; delete dead `renderer/QuestionRenderer.jsx` if unused.
6. **F4** Frontend: `QUERY_KEYS.QUIZ(quizId)` / `QUERY_KEYS.QUIZ_RESULT(quizId)` instead of spreading functions.
7. **F5** Frontend: `useUpdateWeekCompletion` → `@/constants/queryKeys`.

## Phase 2 — Restore broken features

8. **B2** Backend: SecurityConfig permitAll → `/api/v1/topics`, `/api/v1/resources`, `/api/v1/resources/{resourceId}` (and keep `/api/auth/**`).
9. **B3** Backend: RatingService upsert — create `Rating` when `getRating` finds none; same for `deleteRating` (no-op 200 or create-then-delete).
10. **F7** Frontend: normalize all API layers to the interceptor contract: `dashboard.api.js`, `bookmark.api.js`, `rating.api.js`, `learningPath.api.js` → `response.data` (remove `.data`).
11. **F8** Frontend: add `/v1` prefix to `resourcesService` and `learningPath.api.js` calls.
12. **F9** Frontend: fix `EditLearningPathDialog` payload key (or hook signature).
13. **F10** Frontend: add `/learning-paths/:id/weeks/:week/quiz` route → reuse quiz setup with preselected learning path + week.
14. **F11** Frontend: hoist `useMemo` above early returns in `ResourcePagination`.
15. **F13-F15** Frontend: RatingStars DOM, `bg-gradient-to-r`, add `PROFILE: ["profile"]` query key.

## Phase 3 — Hardening (production-ready)

16. **Session UX**: wire `POST /api/auth/refresh` (cookie) into the axios 401 handler with single-flight retry; move access token out of localStorage into memory (or keep persist with short TTL + silent refresh).
17. **Auth hardening**: rate-limit login/register (bucket4j or in-memory), generic 401 message, optional remember-me flag (schema already has the field on users), `SameSite`/`Secure` cookie flags via profile.
18. **Validation**: `@PreAuthorize` ownership annotations on learning-path/bookmark/rating/quiz endpoints instead of manual checks; cap `page`/`size` (e.g. size ≤ 50) in ResourceController/history.
19. **Config hygiene**: remove dead `generateRefreshTokenForCookie`, fix `logging.level` package, add `application-dev.properties` (or move env defaults), document env vars in README.
20. **Ops**: docker-compose (postgres + app), `.env.example`, CI workflow (mvn verify + npm build), health endpoint, structured logs.
21. **Tests**: service-layer tests with Testcontainers or H2-mimic (progress math, rating upsert, quiz submission scoring, security matchers); at minimum expand the existing context test with mocked Gemini.

## Phase 4 — Extensions (aligned with product direction)

22. Admin module (`/api/admin/**`): user management (list/search/paginate, role assignment, enable/disable), stats dashboard; `GET /api/admin/users`, `PUT /api/admin/users/{id}`, `GET /api/admin/stats`; frontend AdminPage with stats cards + user table + role/status controls.
23. Bookmarks pagination + folders (V14 migration, folder sidebar, folder CRUD, move bookmark between folders); quiz history UI (filters + pagination, frontend hook + PagedResponse).
24. Quiz engine: server-side expiry (`expires_at` V15, ~1.5 min/question, 2 min floor), abandon-on-timeout, `GET /api/v1/quizzes/active` `IN_PROGRESS` resume, 410 on expired.
25. AI: schema validation + parse retry loop (2 retries), cost guardrails (per-user daily question quota `GEMINI_MAX_QUESTIONS_PER_DAY`, 429 on exceed).
26. Notifications (weekly digest cron, mark read/mark all, unread count), gamification badges (V16, 7 badges awarded on quiz/bookmark/rating/path events, points + levels).

### Phase 4 — verified

- Backend: 42 tests pass (incl. AiUsageTracker, QuizExpiry, GamificationService, AdminUserService, RatingService); context test validates migrations V14–V16.
- Smoke (running API): STUDENT → `/api/admin/**` = 403 JSON; ADMIN → 200 stats/users; `PUT /api/admin/users/{id}` persists role + active; bookmarks folder create/list pagination OK; gamification returns points/level; notifications unread count OK.
- Security fix: `RestAccessDeniedHandler` (JSON 403) + `/error` permitAll — previously a denied admin request re-dispatched to `/error` where `JwtAuthFilter` is skipped (error dispatch), yielding a misleading 401.

---

# Product Transformation — The Forge (premium redesign)

Waves completed against the "world-class learning workspace" vision (focus · practice · feedback · momentum):

## Wave 0 — Design foundation (done)
- `src/index.css` rewritten: ember/ink/aurora OKLCH token system, light + dark themes, motion tokens, keyframes (aurora/float/shimmer/ember-glow), `.glass`, `.text-gradient-ember`, `.card-hover`, skip-links, `prefers-reduced-motion` global override.
- `src/lib/motion.js`: fadeUp/fadeIn/scaleIn/stagger/slideInRight variants + EASE constants + `useMotionSafe`.
- `ThemeToggle` (light/dark/system dropdown) wired into Navbar; MainLayout skip link.

## Wave 1 — Landing experience (done)
- Landing page (index route, replaces dashboard redirect): Hero (3D `KnowledgeConstellation`, floating achievement cards), Problem, Method (Forge Loop), Features, AI (evaluation mock), Roles, Testimonials, FAQ, CTA.
- `KnowledgeConstellation` (650 nodes, near-neighbor edges, additive glow) lazy-loaded → three.js split into own chunk; LandingPage ≈ 29 kB gzip.
- LandingNavbar (glass on scroll, anchors, Sheet mobile menu) + LandingFooter; skip link.

## Wave 2 — Auth / password reset (done)
- Backend: V17 `password_reset_tokens` (SHA-256 hashed token, 30-min TTL, purge cron, invalidate prior tokens), `POST /api/auth/forgot-password` + `/reset-password` (rate-limited, generic responses), `MailService` (logs link when SMTP unset), `spring-boot-starter-mail`.
- Frontend: forgot/reset pages + forms (zod, confirm-password), premium AuthLayout (constellation backdrop), `ThemeToggle`, routes `/forgot-password` `/reset-password`.
- Live verified: unknown email → same response; token reuse → 401; reset → login with new password.

## Wave 3 — Role-aware app shell (done)
- `config/navigation.jsx`: role-aware nav sections (Learner/Practice/Account + Workspace per role).
- Premium Sidebar (glass, ember active pill, role label) desktop + Sheet mobile nav; Navbar with working `GlobalSearch` (debounced, top-6 results, keyboard-escape, deep-link to resources with `?search=`).
- MainLayout: sidebar shell + page transitions (`AnimatePresence`/`useOutlet`, pathname-keyed).

## Wave 4 — Role workspaces (done)
- `RequireRole` guard + premium 403 page; `/admin` ADMIN-only, `/instructor` INSTRUCTOR-only.
- Admin: tabs (Overview stats / Users / Content) — topics + tags CRUD (dialogs, delete confirm).
- Instructor Hub: personal analytics overview (health score, weak areas) + resource management (create/edit/delete, full form: type/difficulty/minutes/topic/tags).

## Wave 5 — Engineering quality (done)
- Deleted dead code: empty `AIConfig`, unused `QuizHistoryFilterDto`.
- Security headers in `SecurityConfig`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera/mic/geolocation).
- `management.health.mail.enabled=false` (no SMTP in dev → no WARN noise on health probe).
- `.env.example` + README env table: `FRONTEND_URL`, `SMTP_*` vars documented.

## Wave 6 — Quality gate (done)
- Backend: `mvn -o test` = **49 tests, 0 failures** (incl. PasswordResetServiceTest ×7).
- Frontend: `npm run build` green (three.js split chunk), `npm run lint` 0 errors (25 pre-existing warnings).
- Live smoke: health UP; headers present; STUDENT → admin = 403 JSON; ADMIN → stats/users 200; smoketest restored to STUDENT/Test@1234.

## Wave 7 — Audit pass / production hardening (done)
- Full-codebase audit (backend + frontend): zero TODO/FIXME/HACK/placeholder/lorem matches; dead code inventory compiled.
- Backend security: `POST /api/auth/refresh` rate-limited (5/10min/IP); JWT `iss=skillforge` + `aud=skillforge-api` required (tokens from before this change are invalid); `server.forward-headers-strategy=framework`; `clientIp()` simplified to remote address.
- Backend robustness: `GlobalExceptionHandler` now maps `DuplicateResourceException` → 409, missing params / malformed JSON → 400; AI errors masked to a generic 502 (details server-side only); password-reset flow returns a generic message regardless of email existence; sort fields whitelisted on admin users + quiz history (invalid → 400); DTO validation added (submit answers, profile, login/register, quiz request, learning-path goal).
- Backend cleanup: deleted dead `AILearningPathResponse` + `QuestionRepository`; `ApiResponse.failure()` removed; stale OpenAI comments/logs removed from `AIService`.
- Frontend consistency: 17 dead files deleted (legacy App/router/layout/common/ui/utils + old dashboard/quiz components); all legacy palette classes swept to the ember/aurora token system (dashboard hero/stats, quiz result, learning-path, landing, ratings, forms); native `<select>`s replaced with the premium Base UI `Select` (profile, learning-path form); recharts colors now read theme CSS vars (`--chart-1..5`) via `src/lib/chart-colors.js`; skeleton loaders added for quiz/result/profile loading states; login + register forms upgraded to the glass style with a11y error IDs.
- Gates: `mvn -o test` 49/49; `npm run build` green; `npm run lint` 0 errors, 24 pre-existing warnings.
- Docs: `API_REFERENCE.md` rewritten against the real surface (16 controllers, 60 endpoints incl. admin/gamification/notifications/bookmark folders/rate limits/error table).

## Wave 8 — Design system + QA sweep + quiz resume (done)
- Frontend: full design token system (`src/lib/design-system.js`), GSAP migration (`src/lib/motion-gsap.js`, `dashboard-motion.js`), Three.js engine (`src/lib/three-engine.js`), premium Landing/Dashboard/Auth/Workspace experiences, AI Copilot workspace (`copilotEngine.js`).
- QA sweep fixes: refresh-token rotation, in-memory session persistence, bookmark mutation parity, profile save; rating cache eviction (stale `avgRating`); quiz resume — partial answers persisted via `PUT /api/v1/quizzes/{quizId}/answers`, debounced auto-save in `QuizPage`, `Continue` action for `IN_PROGRESS` quizzes in history.
- Performance baseline (`/benchmark`, 2026-08-08): all pages FCP 132–244 ms, landing 671 KB / 19 reqs, route lazy chunks 1–9 KB — all budgets pass.

## Verification gates per phase

- Backend: `mvn -q compile` then `mvn -q test` (context test needs DB + env; document `DB_URL` etc.).
- Frontend: `npm run build` (Rollup catches bad imports), `npm run lint`, manual smoke: register → login → dashboard → resources → generate quiz → submit → result → bookmarks → rating → profile → learning path create/detail/week quiz.
