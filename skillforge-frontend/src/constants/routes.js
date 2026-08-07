export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  RESOURCES: "/resources",
  RESOURCE_DETAIL: "/resources/:resourceId",

  BOOKMARKS: "/bookmarks",

  QUIZ_SETUP: "/quiz",
  QUIZ: "/quiz/:quizId",
  QUIZ_RESULT: "/quiz/:quizId/result",
  QUIZ_HISTORY: "/quiz/history",

  ACHIEVEMENTS: "/achievements",

  LEARNING_PATH: "/learning-paths",

  WORKSPACE: "/workspace",
  WORKSPACE_DETAIL: "/workspace/:learningPathId",
  workspaceDetail: (id) => `/workspace/${id}`,

  LEARNING_PATH_DETAIL:
    "/learning-paths/:learningPathId",

  learningPathDetail: (id) =>
    `/learning-paths/${id}`,

  PROFILE: "/profile",

  ADMIN: "/admin",

  INSTRUCTOR: "/instructor",
};