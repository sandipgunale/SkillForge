import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";

import AppProviders from "@/app/providers";
import ErrorBoundary from "@/components/common/ErrorBoundary";

import "@/index.css";
import "@/services/api/interceptors";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>,
);
