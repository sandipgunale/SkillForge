import { createBrowserRouter } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RouteFallback from "./RouteFallback";

import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import ResourcesPage from "@/features/resources/pages/ResourcesPage";

import ResourceDetailPage from "@/features/resources/pages/ResourceDetailPage";

import QuizPage from "@/features/quiz/pages/QuizPage";

import QuizResultPage from "@/features/quiz/pages/QuizResultPage";

import LearningPathPage from "@/features/learning-path/pages/LearningPathPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
// import BookmarkPage from "@/features/bookmark/pages/BookmarkPage";

export const router = createBrowserRouter([
  // -----------------------------
  // Public Routes
  // -----------------------------
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTES.REGISTER,
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // -----------------------------
  // Protected Routes
  // -----------------------------
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: ROUTES.HOME,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.RESOURCES,
            element: <ResourcesPage />,
          },
          {
            path: ROUTES.RESOURCE_DETAIL,
            element: <ResourceDetailPage />,
          },
          {
            path: ROUTES.QUIZ,
            element: <QuizPage />,
          },
          {
            path: ROUTES.QUIZ_RESULT,
            element: <QuizResultPage />,
          },
          {
            path: ROUTES.LEARNING_PATH,
            element: <LearningPathPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // -----------------------------
  // 404 Route
  // -----------------------------
  {
    path: "*",
    element: <RouteFallback />,
  },
]);
