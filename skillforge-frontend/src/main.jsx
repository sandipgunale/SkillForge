import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";

import AppProviders from "@/app/providers";
import ErrorBoundary from "@/components/common/ErrorBoundary";

import "@/index.css";
import "@/services/api/interceptors";

import { useAuthStore } from "@/store/authStore";

// Restore the session from the httpOnly refresh cookie (silent refresh)
useAuthStore.getState().bootstrap();

// NOTE: <React.StrictMode> is intentionally NOT enabled. React 19 + @react-three/fiber
// 9.6.x has a known bug (pmndrs/react-three-fiber#3863) where StrictMode's deferred
// unmount disposes the WebGL context, force-losing it on the remount — which corrupts
// R3F material colors (the graduation cap renders as a warm glow instead of the cap)
// and spams "THREE.WebGLRenderer: Context Lost" in the console. Production builds are
// unaffected (StrictMode is a no-op there). Remove this note if R3F ships a fix.
ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </ErrorBoundary>,
);
