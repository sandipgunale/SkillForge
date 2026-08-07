import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ROUTES } from "@/constants/routes";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RouteFallback from "./RouteFallback";

import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LandingLayout from "@/layouts/LandingLayout";

import PageLoader from "@/components/common/PageLoader";

import AppError from "@/components/common/AppError";

import RequireRole from "@/components/common/RequireRole";

/* -------------------------------------------------------------------------- */
/*                               Lazy Loaded Pages                            */
/* -------------------------------------------------------------------------- */

const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);

const ResourcesPage = lazy(
  () => import("@/features/resources/pages/ResourcesPage"),
);

const ResourceDetailPage = lazy(
  () => import("@/features/resources/pages/ResourceDetailPage"),
);

const QuizSetupPage = lazy(() => import("@/features/quiz/pages/QuizSetupPage"));

const QuizPage = lazy(() => import("@/features/quiz/pages/QuizPage"));

const QuizResultPage = lazy(
  () => import("@/features/quiz/pages/QuizResultPage"),
);

const QuizHistoryPage = lazy(
  () => import("@/features/quiz/pages/QuizHistoryPage"),
);

const AdminPage = lazy(() => import("@/features/admin/pages/AdminPage"));

const InstructorPage = lazy(
  () => import("@/features/instructor/pages/InstructorPage"),
);

const LearningPathPage = lazy(
  () => import("@/features/learning-path/pages/LearningPathPage"),
);
const LearningPathDetailPage = lazy(
  () => import("@/features/learning-path/pages/LearningPathDetailPage"),
);

const WorkspacePage = lazy(
  () => import("@/features/workspace/pages/WorkspacePage"),
);

const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));

const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);

const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPasswordPage"),
);

const BookmarkPage = lazy(
  () => import("@/features/bookmark/pages/BookmarksPage"),
);

const AchievementsPage = lazy(
  () => import("@/features/gamification/pages/AchievementsPage"),
);

const LandingPage = lazy(
  () => import("@/features/landing/pages/LandingPage"),
);

/* -------------------------------------------------------------------------- */
/*                           Suspense Helper                                  */
/* -------------------------------------------------------------------------- */

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

/* -------------------------------------------------------------------------- */
/*                                  Router                                    */
/* -------------------------------------------------------------------------- */

export const router = createBrowserRouter([
  // ------------------------------------------------------------------------
  // Public: Landing
  // ------------------------------------------------------------------------
  {
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: withSuspense(LandingPage),
      },
    ],
  },

  // ------------------------------------------------------------------------
  // Public Routes (auth)
  // ------------------------------------------------------------------------
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: withSuspense(LoginPage),
          },
          {
            path: ROUTES.REGISTER,
            element: withSuspense(RegisterPage),
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: withSuspense(ForgotPasswordPage),
          },
          {
            path: ROUTES.RESET_PASSWORD,
            element: withSuspense(ResetPasswordPage),
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // Protected Routes
  // ------------------------------------------------------------------------
  {
    element: <ProtectedRoute />,
    errorElement: <AppError />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: withSuspense(DashboardPage),
          },

          {
            path: ROUTES.RESOURCES,
            element: withSuspense(ResourcesPage),
          },

          {
            path: ROUTES.RESOURCE_DETAIL,
            element: withSuspense(ResourceDetailPage),
          },

          {
            path: ROUTES.QUIZ_SETUP,
            element: withSuspense(QuizSetupPage),
          },

          {
            path: ROUTES.QUIZ,
            element: withSuspense(QuizPage),
          },

          {
            path: ROUTES.QUIZ_RESULT,
            element: withSuspense(QuizResultPage),
          },

          {
            path: ROUTES.QUIZ_HISTORY,
            element: withSuspense(QuizHistoryPage),
          },

          {
            path: ROUTES.ADMIN,
            element: (
              <RequireRole role="ADMIN">
                {withSuspense(AdminPage)}
              </RequireRole>
            ),
          },

          {
            path: ROUTES.INSTRUCTOR,
            element: (
              <RequireRole role="INSTRUCTOR">
                {withSuspense(InstructorPage)}
              </RequireRole>
            ),
          },

          {
            path: ROUTES.LEARNING_PATH,
            element: withSuspense(LearningPathPage),
          },

          {
            path: ROUTES.WORKSPACE,
            element: withSuspense(WorkspacePage),
          },

          {
            path: ROUTES.WORKSPACE_DETAIL,
            element: withSuspense(WorkspacePage),
          },

          {
            path: ROUTES.LEARNING_PATH_DETAIL,
            element: withSuspense(LearningPathDetailPage),
          },

          {
            path: ROUTES.PROFILE,
            element: withSuspense(ProfilePage),
          },
          {
            path: ROUTES.BOOKMARKS,
            element: withSuspense(BookmarkPage),
          },
          {
            path: ROUTES.ACHIEVEMENTS,
            element: withSuspense(AchievementsPage),
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // 404
  // ------------------------------------------------------------------------
  {
    path: "*",
    element: <RouteFallback />,
  },
]);
