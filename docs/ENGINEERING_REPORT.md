# SkillForge — Engineering Report

Date: 2026-08-03
Scope: full codebase audit (Spring Boot 3.5.3 backend + React 19/Vite 8 frontend) — done before any implementation work.

## 1. System Overview

| Layer | Stack |
|---|---|
| Backend | Java 21, Spring Boot 3.5.3 (web, security, validation, data-jpa), jjwt 0.12.7, PostgreSQL, Flyway (ddl-auto=validate), Gemini REST client |
| Frontend | React 19.2.7, Vite 8, react-router-dom 7, TanStack Query 5, Zustand (persist), react-hook-form + zod, Tailwind 4 (@tailwindcss/vite), base-ui shadcn-style components, framer-motion, recharts, three/R3F, sonner |
| Auth | Access JWT in localStorage (15 min) + refresh token in HttpOnly cookie (`/api/auth` path, 7 days) |
| AI | Gemini `gemini-2.5-flash` — quiz generation (MCQ/CODING/INTERVIEW/SCENARIO), quiz evaluation, learning-path roadmap generation |

Key configuration:
- Backend env: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (base64), `GEMINI_API_KEY` (also `OPENAI_API_KEY` referenced but unused).
- Frontend env: `VITE_API_BASE_URL=http://localhost:8080/api`; axios instance at `src/services/api/axios.js` auto-unwraps Spring `ApiResponse<T>` (`response.data` = payload).
- Path alias `@` → `src`; auth store at `src/store/authStore.jsx` (field `session`, methods `login/logout/updateUser`).

## 2. Architecture & Flow

- Controllers: `/api/auth/**`, `/api/users/me`, `/api/v1/{resources,topics,tags,quizzes,learning-paths,learning-path-progress,progress,analytics/dashboard,bookmarks,ratings}`.
- All responses wrapped in `ApiResponse<T>` `{ success, message, data }`; errors via `GlobalExceptionHandler` → `ApiError`.
- Quiz flow: POST generate → AI questions parsed into `questions` (JSONB `options_json`, `correct_answer`) → frontend answers → POST submit → AI evaluation (`EvaluationParser`) scores & writes per-question `is_correct`/`ai_feedback` → progress/analytics updated (`ProgressService`, `LearningPathProgressService`).
- Dashboard: `AnalyticsService.getDashboard` aggregates progress, learning-path progress, quiz history, weekly activity, topic analytics, recommendations.

## 3. Findings

### 3.1 CRITICAL — startup / build blockers

| # | Location | Issue |
|---|---|---|
| B1 | `resource/entity/Resource.java:59` | `estimated_minutes` column mapped but **missing in all migrations** (V4 has no `estimated_minutes`); `ddl-auto=validate` → **backend fails to start**. |
| F1 | `features/auth/hooks/useLogin.js:6` | Imports `authService` from `@/services/auth.service` — file does not exist (real: `@/features/auth/api/authService`) → **LoginPage crashes / build fails**. |
| F2 | `features/profile/api/profileService.js:1` | Imports `api` from `@/lib/api` — does not exist (`src/lib/` only has `utils.js`) → **ProfilePage broken**. |
| F3 | `features/quiz/components/QuestionCard.jsx:1-4` (+ `components/renderer/QuestionRenderer.jsx:1-4`) | Imports `../questions/{mcq,coding,interview,scenario}/*` — directory does not exist → **QuizPage module-resolution failure**. |
| F4 | `features/quiz/hooks/useQuiz.js:9`, `useQuizResult.js:12` | `[...QUERY_KEYS.QUIZ, quizId]` — `QUERY_KEYS.QUIZ` is a **function** (queryKeys.js:37/42); spreading a function throws at render → quiz pages crash. |
| F5 | `features/learning-path/hooks/useUpdateWeekCompletion.js:8` | Imports `QUERY_KEYS` from `@/lib/constants/queryKeys` — does not exist → WeekCard crash. |
| F6 | `features/resources/hooks/useResources.js:3`, `useTopics.js:3` | `import { resourcesService }` — module only has a `default` export (refactor to class not finished) → Rollup build error. |

### 3.2 MAJOR — features broken at runtime

| # | Location | Issue |
|---|---|---|
| B2 | `config/SecurityConfig.java:40-45` | permitAll lists `/api/topics`, `/api/resources`, `/api/resources/{id}` but controllers are mapped at `/api/v1/*` → public browsing of resources/topics actually **requires JWT**; matchers are dead. |
| B3 | `rating/service/RatingService.java:156-172` | `rateResource`/`deleteRating` call `getRating()` which **throws 404 when no rating exists** → first-time rating always fails (no upsert). |
| F7 | `features/{dashboard,bookmark,rating,learning-path}/api/*.js` | `response.data.data` double-unwrap after the new interceptor → all return `undefined` → dashboard, bookmarks page, rating state, learning-path pages broken. |
| F8 | `features/resources/api/resourcesService.js` + `features/learning-path/api/learningPath.api.js` | Endpoints missing `/v1` prefix (`/resources`, `/topics`, `/learning-paths` vs backend `/api/v1/...`) → 404s. |
| F9 | `features/learning-path/components/EditLearningPathDialog.jsx:25` | Mutation payload key `learningPathData` ≠ `payload` destructured in `useUpdateLearningPath.js:11` → PUT body empty. |
| F10 | `features/learning-path/components/WeekQuizAction.jsx:10` | Navigates to `/learning-paths/:id/weeks/:week/quiz` — no such route → 404. |
| F11 | `features/resources/components/ResourcePagination.jsx:36` | `useMemo` after early return → Rules-of-Hooks violation when `totalPages` shrinks. |
| F12 | `features/quiz/components/QuestionCard.jsx` vs `QuestionDto` | Frontend renders by `question.questionType`; backend DTO exposes `type` → all questions render "Unsupported Question Type". |
| F13 | `features/rating/components/RatingStars.jsx:67-71` | `<p>` inside `<button>` (invalid DOM) + label rendered once per star. |
| F14 | `features/dashboard/components/DashboardHero.jsx:30`, `WelcomeBanner.jsx:13` | `bg-gradient-to-right` invalid Tailwind class → gradient never renders. |
| F15 | `features/profile/hooks/useProfile.js:9` | `QUERY_KEYS.PROFILE` undefined in `queryKeys.js` → shared `[undefined]` cache key. |

### 3.3 MINOR / technical debt

- `AuthController.generateRefreshTokenForCookie()` — dead code (line 101-105).
- `application.properties:60` — `logging.level.com.learningplatform=DEBUG` wrong package (actual: `com.project.skillforgebackend`).
- `spring.profiles.active=dev` but no `application-dev.properties` exists.
- Refresh token flow exists on backend (`POST /api/auth/refresh`, HttpOnly cookie) but **frontend never uses it**; 401 interceptor hard-logs-out (interceptors.js:22-25). Session die-after-15-min UX issue; refresh endpoint would fix.
- JWT access token stored in localStorage (XSS surface). Token in memory + refresh cookie is the recommended evolution.
- `flyway-maven-plugin` hardcodes `localhost:5432` + placeholder password (only used when running the plugin goal manually).
- `AuthService.login` — no rate limiting / lockout; `SecurityConfig` has no brute-force protection.
- `RatingService` recalculates stats via two queries + save per rating (fine at this scale; could be one `UPDATE resources SET avg_rating=(SELECT AVG(...)...)`).
- Admin module: `hasRole("ADMIN")` matcher exists but **no admin controllers** and no role beyond `STUDENT` is ever assigned (registration hardcodes `STUDENT`).
- Resources: `createTopic` hardcodes `displayOrder(0)`; no tags/topics admin UI; no pagination on bookmarks endpoint.
- Quiz: `durationMinutes` is `@Transient`; UI countdown is 10 min regardless of question count; `QuizSetupForm` hardcodes `estimatedMinutes = questionCount * 1.5`.
- No `application-dev.properties`, no docker-compose for Postgres, no CI, no e2e tests. Single `@SpringBootTest` context-loads test.
- `ResourcePagination`/`PageHeader`… minor prop mismatches already resolved in subagent scan (no findings).
- Dead files: `src/App.jsx` (placeholder), `src/app/router.jsx` (unused placeholder), `src/components/layout/Sidebar.jsx` (unused).

## 4. Frontend data-contract alignment (verified OK)

- `quiz.api.js` (`{ data }` pattern) ✅ correct under interceptor; `QuizDto` provides `topicName`, `learningPathTitle`, `source`, `difficulty`, `questions[].{id,type,content,options,orderIndex}`; `QuizResultDto` provides `quizId`, `summary.{score,maxScore,percentage}`, `insight.{overallFeedback,strengths,weaknesses,improvements}`, `questions[].{questionId,content,correct,correctAnswer,userAnswer,aiFeedback}`.
- `resourcesService` page mapping (`content/number/size/totalElements/...`) matches Spring `Page<ResourceDto>`.
- Auth store shape (`session.{accessToken,tokenType,user,...}` + `login/logout/updateUser`) matches all consumers.
- All `ROUTES` constants match `src/routes/index.jsx` (except the missing week-quiz route, F10).

## 5. Resolution status

This audit was the pre-implementation baseline. All blockers (B1–B3) and
frontend findings (F1–F16) have since been resolved and verified:

- **B1** V13 migration adds `estimated_minutes`; `ddl-auto=validate` passes.
- **B2** SecurityConfig permitAll corrected to `/api/v1/...` paths.
- **B3** RatingService upserts — first-time rating no longer 404.
- **F1–F16** All import / module / hook / contract fixes shipped; `npm run build`
  and `npm run lint` green, dead code deleted (see `docs/ROADMAP.md` Waves 1–8).

The findings tables above are retained as the historical audit record — they no
longer describe the current codebase.
