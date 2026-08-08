# SkillForge — API Reference

Base URL: `http://localhost:8080`. All responses use the `ApiResponse<T>` envelope:
`{ "success": true, "message": "...", "data": T }`; errors: `{ "success": false, "message": "...", "errors": [...] }` with the proper HTTP status.

Auth: `Authorization: Bearer <accessToken>` on all protected endpoints. Access tokens are signed with claims `iss=skillforge`, `aud=skillforge-api` and expire after 15 minutes. The refresh token lives in an HttpOnly cookie `refreshToken` (path `/api/auth`, 7 days) and rotates on every refresh.

Rate limits: login, refresh, forgot-password and reset-password are limited to 5 requests / 10 minutes / IP (`429 Too Many Requests`).

## Auth — `/api/auth` (public)

| Method | Path | Request | Response `data` |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, email, password }` | `AuthResponse` (201) — duplicate email → 409, generic message |
| POST | `/api/auth/login` | `{ email, password }` | `AuthResponse` |
| POST | `/api/auth/refresh` | – (cookie) | `AuthResponse` (rotates cookie) |
| POST | `/api/auth/logout` | – | 204 (clears cookie) |
| POST | `/api/auth/forgot-password` | `{ email }` | 200 — generic message, never reveals whether the email exists |
| POST | `/api/auth/reset-password` | `{ token, newPassword }` | 200 — invalid/expired/reused token → 401 |

`AuthResponse`: `{ accessToken, tokenType: "Bearer", expiresIn: 900, user: { id, email, fullName, avatarUrl, skillLevel, role } }`

## User — `/api/users`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/api/users/me` | ✔ | – | `UserDto { id, email, fullName, avatarUrl, skillLevel, role }` |
| PUT | `/api/users/me` | ✔ | `{ fullName (required), avatarUrl (http(s) URL or empty), skillLevel }` | `UserDto` |

## Admin — `/api/admin`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/api/admin/users?search&role&active&page&size&sort` | ADMIN | – | `PagedResponse<AdminUserDto>` — `sort` whitelist: `createdAt, fullName, email, role, isActive` (invalid field → 400) |
| PUT | `/api/admin/users/{userId}` | ADMIN | `{ role?, isActive? }` | `AdminUserDto` |
| GET | `/api/admin/stats` | ADMIN | – | Admin stats snapshot (users, resources, quizzes, recent signups) |

## Resources — `/api/v1/resources`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| GET | `/api/v1/resources?topicId&difficulty&type&search&page=0&size=12` | public | – | `PagedResponse<ResourceDto>` |
| GET | `/api/v1/resources/{resourceId}` | public | – | `ResourceDto` |
| POST | `/api/v1/resources` | ✔ | `CreateResourceRequest` | `ResourceDto` (201) |
| PUT | `/api/v1/resources/{resourceId}` | ✔ | `UpdateResourceRequest` | `ResourceDto` |
| DELETE | `/api/v1/resources/{resourceId}` | ✔ | – | `null` (soft delete) |

`ResourceDto`: `{ id, title, url, type (VIDEO|ARTICLE|COURSE|DOCS|BOOK), difficulty (BEGINNER|INTERMEDIATE|ADVANCED), description, estimatedMinutes, youtubeVideoId, avgRating, ratingCount, topic: TopicDto, tags: TagDto[] }`
`TopicDto`: `{ id, name, slug, description, displayOrder }` — `TagDto`: `{ id, name, slug }`

## Topics & Tags — `/api/v1/topics`, `/api/v1/tags`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/topics`, `/api/v1/topics/{topicId}` | public | `TopicDto` |
| POST / PUT / DELETE | `/api/v1/topics[/{topicId}]` | ✔ | `TopicDto` / `null` |
| GET | `/api/v1/tags`, `/api/v1/tags/{tagId}` | public | `TagDto` |
| POST / PUT / DELETE | `/api/v1/tags[/{tagId}]` | ✔ | `TagDto` / `null` |

`CreateTopicRequest { name, description }`, `CreateTagRequest { name }`.

## Quizzes — `/api/v1/quizzes`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/api/v1/quizzes` | ✔ | `QuizRequest` | `QuizDto` (201) |
| POST | `/api/v1/quizzes/{quizId}/submit` | ✔ (owner) | `{ answers: [{ questionId, answer }] }` — 1–100 answers, each ≤ 2000 chars | `QuizResultDto` |
| PUT | `/api/v1/quizzes/{quizId}/answers` | ✔ (owner) | `{ answers: [{ questionId, answer }] }` — partial set, 1–100 answers | `null` (persists partial answers for resume; only saves answers for questions present on the quiz) |
| GET | `/api/v1/quizzes/active` | ✔ | – | `QuizDto` (in-progress quiz, if any) |
| GET | `/api/v1/quizzes/{quizId}` | ✔ (owner) | – | `QuizDto` |
| GET | `/api/v1/quizzes/{quizId}/result` | ✔ (owner) | – | `QuizResultDto` |
| GET | `/api/v1/quizzes/history?source&difficulty&status&page&size&sort` | ✔ | – | `PagedResponse<QuizDto>` — `sort` whitelist: `completedAt, createdAt, score, status, difficulty` |

`QuizRequest`: `{ source (TOPIC|LEARNING_PATH), topicId?, learningPathId?, weekNumber?, difficulty, questionCount (1–20), questionTypes (1–4 of MCQ|CODING|INTERVIEW|SCENARIO) }`
`QuizDto`: `{ id, topicName, learningPathTitle, source, difficulty, status, totalQuestions, score, maxScore, startedAt, completedAt, learningPathId, weekNumber, questions: QuestionDto[] }`
`QuestionDto`: `{ id, type, content, options: string[], orderIndex }`
`QuizResultDto`: `{ quizId, summary: { score, maxScore, percentage, grade?, durationInSeconds? }, analytics: { totalQuestions, answeredQuestions, correctAnswers, incorrectAnswers, accuracy }, insight: { overallFeedback, strengths[], weaknesses[], improvements[] }, questions: QuestionResultDto[] }`
`QuestionResultDto`: `{ questionId, questionType, content, correctAnswer, userAnswer, correct, aiFeedback }`

## Learning Paths — `/api/v1/learning-paths`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/api/v1/learning-paths` | ✔ | `{ goal (required), skillLevel, weeklyHours, durationWeeks }` | `LearningPathDto` (201, AI roadmap) |
| GET | `/api/v1/learning-paths` | ✔ | – | `LearningPathDto[]` |
| GET | `/api/v1/learning-paths/{learningPathId}` | ✔ (owner) | – | `LearningPathDto` |
| PUT | `/api/v1/learning-paths/{learningPathId}` | ✔ (owner) | `UpdateLearningPathRequest` | `LearningPathDto` |
| PATCH | `/api/v1/learning-paths/{learningPathId}/status?status=IN_PROGRESS|COMPLETED|ABANDONED` | ✔ (owner) | – | `LearningPathDto` |
| PATCH | `/api/v1/learning-paths/{learningPathId}/weeks/{weekNumber}` | ✔ (owner) | `{ completed: bool }` | `LearningPathDto` |
| DELETE | `/api/v1/learning-paths/{learningPathId}` | ✔ (owner) | – | `null` |

`LearningPathDto`: `{ id, title, goal, skillLevel, weeklyHours, durationWeeks, roadmapJson, status, completedAt, createdAt, updatedAt }`

## Progress — `/api/v1/progress`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/progress` | ✔ | `ProgressDto { totalTopics, completedTopics, totalQuizzesTaken, totalMinutesSpent, overallAverageScore, topics: TopicProgressDto[] }` |

## Learning Path Progress — `/api/v1/learning-path-progress`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/learning-path-progress` | ✔ | `LearningPathProgressDto[]` |
| GET | `/api/v1/learning-path-progress/{learningPathId}` | ✔ (owner) | `LearningPathProgressDto { learningPathId, completionPercentage, quizzesTaken, minutesSpent, averageQuizScore }` |

## Analytics — `/api/v1/analytics`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/analytics/dashboard` | ✔ | `DashboardDto { totalLearningMinutes, studyHours, totalTopicsStarted, totalQuizzesTaken, overallAverageScore, quizAccuracy, learningHealthScore, learningLevel, averageMinutesPerTopic, mostActiveTopic, bestTopic, worstTopic, lastQuiz, recommendations[], completedTopics, weeklyActivity[], topicAnalytics[], learningPathAnalytics[], recentQuizScores[], weakAreas[], hasWeakAreas }` |

## Bookmarks — `/api/v1/bookmarks`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/api/v1/bookmarks/{resourceId}` | ✔ | – | `BookmarkDto { id, resource: ResourceDto, createdAt }` |
| DELETE | `/api/v1/bookmarks/{resourceId}` | ✔ | – | `null` |
| PATCH | `/api/v1/bookmarks/{resourceId}/folder` | ✔ | `{ folderId }` | `BookmarkDto` |
| GET | `/api/v1/bookmarks?page&size` | ✔ | – | `PagedResponse<BookmarkDto>` |
| GET | `/api/v1/bookmarks/status/{resourceId}` | ✔ | – | `{ bookmarked: bool }` |
| GET | `/api/v1/bookmarks/folders` | ✔ | – | `BookmarkFolderDto[]` |
| POST | `/api/v1/bookmarks/folders` | ✔ | `{ name }` | `BookmarkFolderDto` |
| PUT | `/api/v1/bookmarks/folders/{folderId}` | ✔ | `{ name }` | `BookmarkFolderDto` |
| DELETE | `/api/v1/bookmarks/folders/{folderId}` | ✔ | – | `null` |

## Ratings — `/api/v1/ratings`

| Method | Path | Auth | Request | Response `data` |
|---|---|---|---|---|
| POST | `/api/v1/ratings/{resourceId}` | ✔ | `{ value: 1–5 }` | `RatingResponseDto { avgRating, ratingCount, userRating }` |
| GET | `/api/v1/ratings/{resourceId}` | ✔ | – | `UserRatingDto { resourceId, value }` |
| DELETE | `/api/v1/ratings/{resourceId}` | ✔ | – | `null` |

## Gamification — `/api/v1/gamification`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/gamification` | ✔ | `GamificationDto { points, level, currentLevel, nextLevel, pointsToNextLevel, badges[] }` |

## Notifications — `/api/v1/notifications`

| Method | Path | Auth | Response `data` |
|---|---|---|---|
| GET | `/api/v1/notifications?page&size` | ✔ | `PagedResponse<NotificationDto>` |
| GET | `/api/v1/notifications/unread-count` | ✔ | `{ count }` |
| PATCH | `/api/v1/notifications/{notificationId}/read` | ✔ | `NotificationDto` |
| PATCH | `/api/v1/notifications/read-all` | ✔ | `null` |

## Error model

`GlobalExceptionHandler` maps:

| Status | Condition |
|---|---|
| 400 | Bean-validation failures, malformed JSON, missing request parameters, invalid sort field |
| 401 | Invalid credentials, invalid/expired access or reset token |
| 403 | Role not granted (`RestAccessDeniedHandler`, JSON body) |
| 404 | `ResourceNotFoundException` |
| 409 | Duplicate email or other unique-constraint violation (generic message, no data echo) |
| 429 | Login/refresh/password-reset rate limit exceeded |
| 502 | AI service failure — masked, generic message; details logged server-side |
| 500 | Unexpected |

## Security & deployment notes

- Headers set by `SecurityConfig`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera/mic/geolocation).
- `server.forward-headers-strategy=framework` — proxy must overwrite `X-Forwarded-For`; the app derives client IP from the remote address for rate limiting.
- `management.health.mail.enabled=false` — mail health check disabled when SMTP is unset.
- Frontend consumes all responses through the axios interceptor (`src/services/api`), which unwraps `data`, injects the bearer token, and transparently refreshes on 401 (single-flight).
