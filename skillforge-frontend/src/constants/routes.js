export const ROUTES = {
  HOME: "/",

  SHOWCASE: "/showcase",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  RESOURCES: "/resources",
  RESOURCE_DETAIL: "/resources/:resourceId",

  RESOURCE_STUDIO: "/admin/resources/:resourceId/studio",
  resourceStudio: (id) => `/admin/resources/${id}/studio`,

  COURSE_BUILDER: "/admin/courses/:courseId",
  courseBuilder: (id) => `/admin/courses/${id}`,

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