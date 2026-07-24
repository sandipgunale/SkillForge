export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",

  DASHBOARD: "/dashboard",

  RESOURCES: "/resources",
  RESOURCE_DETAIL: "/resources/:resourceId",

  BOOKMARKS: "/bookmarks",

  QUIZ_SETUP: "/quiz",
  QUIZ: "/quiz/:quizId",
  QUIZ_RESULT: "/quiz/:quizId/result",

  LEARNING_PATH: "/learning-paths",

  LEARNING_PATH_DETAIL:
    "/learning-paths/:learningPathId",

  learningPathDetail: (id) =>
    `/learning-paths/${id}`,

  PROFILE: "/profile",
};