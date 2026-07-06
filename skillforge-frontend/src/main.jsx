import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import { router } from "@/app/router";
import AppProviders from "@/app/providers";

// import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <App />
    </AppProviders>
  </React.StrictMode>,
);
