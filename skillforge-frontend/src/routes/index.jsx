import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ROUTES } from "@/constants/routes";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RouteFallback from "./RouteFallback";

import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

import PageLoader from "@/components/common/PageLoader";

import AppError from "@/components/common/AppError";

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

const LearningPathPage = lazy(
  () => import("@/features/learning-path/pages/LearningPathPage"),
);

const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));

const BookmarkPage = lazy(
  () => import("@/features/bookmark/pages/BookmarksPage"),
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
  // Public Routes
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
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },

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
            path: ROUTES.LEARNING_PATH,
            element: withSuspense(LearningPathPage),
          },

          {
            path: ROUTES.PROFILE,
            element: withSuspense(ProfilePage),
          },
          {
            path: ROUTES.BOOKMARKS,
            element: withSuspense(BookmarkPage),
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
