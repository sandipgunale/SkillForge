# TODOS

Format: priority — title — (owner) — note.

## Open

- **P1** — Refresh rotation single-flight: add `@Lock(PESSIMISTIC_WRITE)` (or `@Version` + retry) on `RefreshTokenRepository.findByTokenHash` so concurrent refresh with the same token cannot mint two live successors. Found by ship security review (M1, v0.1.0.0).
- **P1** — Sanitize submitted quiz answers before they reach the AI grader: run `AiPromptGuard` pass on user answers in `EvaluationPromptBuilder` / at submission time; wrap as untrusted DATA. Prevents prompt-injection into grading (M2, v0.1.0.0).
- **P1** — `GET /api/v1/quizzes/{quizId}/result` re-invokes live Gemini evaluation on every view. Return persisted verdict; only re-evaluate when `aiFeedback` missing, behind the AI rate limiter (M3, v0.1.0.0).
- **P1** — Refresh path must reject deactivated users (`!user.isActive()`), and admin disable should revoke the user's refresh family (M4, v0.1.0.0).
- **P2** — AI cost quota covers only quiz generation; fold learning-path generation and quiz evaluation into the per-user daily budget (M5, v0.1.0.0).
- **P2** — Rate limits and AI usage tracker are per-JVM; document single-node constraint or wire shared store before multi-node deploy (M6, v0.1.0.0).
- **P2** — Password reset should revoke the user's other refresh sessions after change (m4, v0.1.0.0).
- **P2** — Admin self-demotion / last-admin guard in `AdminUserService.updateUser` (m5, v0.1.0.0).
- **P2** — Frontend test infra: no vitest runner exists; quiz resume flow (auto-save debounce, history Continue) is QA-only coverage (v0.1.0.0).
- **P2** — Test gaps: `GeminiClient` HTTP layer, AI parsers (`QuizParser`, `EvaluationParser`, `LearningPathParser`), `AIService` parse-retry loop, `AdminStatsService` (v0.1.0.0).
- **P3** — `COOKIE_SECURE` has no prod-profile guard; fail startup when cookie secure=false under `prod` (m1, v0.1.0.0).
- **P3** — Gate Swagger UI / `/v3/api-docs` in prod profile (m3, v0.1.0.0).
- **P3** — Derive `expiresIn` in `AuthResponse` from `jwt.access-token-expiry` instead of hardcoding 900 (m2, v0.1.0.0).

## Completed

**Completed:** v0.1.0.0 (2026-08-08)

- Committed default JWT secret in docker-compose removed; compose now requires `JWT_SECRET` (fail-fast). Backend already failed startup on missing/weak secret.
- QA sweep: refresh rotation, in-memory session persistence, bookmark mutation parity, profile save.
- Rating cache eviction: `@CacheEvict` on rating create/update/delete (stale `avgRating` fix).
- Quiz resume: partial answers persisted via `PUT /api/v1/quizzes/{quizId}/answers`, auto-save, Continue action in history.
