export const QUERY_KEYS = {
  DASHBOARD: ["dashboard"],

  ANALYTICS: ["analytics"],

  RESOURCES: ["resources"],

  RESOURCE: (resourceId) => [
    "resource",
    resourceId,
  ],

  TOPICS: ["topics"],

  BOOKMARKS: ["bookmarks"],

  BOOKMARK_STATUS: (resourceId) => [
    "bookmark-status",
    resourceId,
  ],

  USER_RATING: (resourceId) => [
    "user-rating",
    resourceId,
  ],

  QUIZ_HISTORY: ["quiz-history"],

  QUIZ: (quizId) => [
    "quiz",
    quizId,
  ],

  QUIZ_RESULT: (quizId) => [
    "quiz-result",
    quizId,
  ],
};