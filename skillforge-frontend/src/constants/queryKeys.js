export const QUERY_KEYS = {
  DASHBOARD: ["dashboard"],

  ANALYTICS: ["analytics"],

  RESOURCES: ["resources"],

  TOPICS: ["topics"],

  BOOKMARKS: ["bookmarks"],

  BOOKMARK_STATUS: (resourceId) => [
    "bookmark-status",
    resourceId,
  ],

  QUIZ_HISTORY: ["quiz-history"],

  QUIZ: (quizId) => ["quiz", quizId],

  QUIZ_RESULT: (quizId) => [
    "quiz-result",
    quizId,
  ],
};