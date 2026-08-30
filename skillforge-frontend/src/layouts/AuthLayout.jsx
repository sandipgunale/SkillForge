import { Component, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { alpha } from "@/lib/design-system";
import ThemeToggle from "@/components/common/ThemeToggle";
import AuthLogo from "@/features/auth/components/AuthLogo";

/* three.js split into its own chunk, lazy after first paint */
const LivingCoreScene = lazy(() =>
  import("@/features/auth/components/three/LivingCoreScene"),
);

/* Decorative-scene guard: the background scene is pure decoration. If its
   lazy chunk fails to load or throws for any reason, the scene simply
   vanishes (null) — the auth UI above it must always render. */
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function AuthLayout() {
  const location = useLocation();

  /* NOTE: no entrance animation on the card wrapper. The auth form must be
     visible IMMEDIATELY and is non-negotiable — any gsap.from opacity gate
     creates a window where the card is invisible (and, interrupted, can
     strand it invisible). The page chrome (logo, toggle) and the card render
     on first paint, unconditionally. */

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
        {/* Layer 1 — cinematic gradient field (warm key + cool rim ambient),
            gently drifting so the lighting never feels static */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 animate-aurora"
            style={{
              background: `radial-gradient(ellipse 45% 35% at 50% -5%, ${alpha("ember", 0.14)} 0%, transparent 60%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 40% 32% at 88% 12%, ${alpha("aurora", 0.1)} 0%, transparent 55%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 50% 40% at 10% 95%, ${alpha("ember", 0.1)} 0%, transparent 60%)`,
            }}
          />
        </div>

      {/* Layer 2 — film-grain noise, the premium texture */}
      <div
        aria-hidden="true"
        className="noise-overlay pointer-events-none absolute inset-0 z-[1]"
      />

      {/* Layer 3 — the living intelligence core (decorative: never
          intercepts pointer events, so it can never block the forms) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
      >
        <SceneBoundary>
          <Suspense fallback={null}>
            <LivingCoreScene className="absolute inset-0 h-full w-full opacity-80" />
          </Suspense>
        </SceneBoundary>
      </div>

      {/* Layer 4 — cinematic vignette */}
      <div
        aria-hidden="true"
        className="vignette pointer-events-none absolute inset-0 z-[3]"
      />

      {/* Layer 4.5 — focus mask: calms background intensity behind the card */}
      <div
        aria-hidden="true"
        className="focus-mask pointer-events-none absolute inset-0 z-[3]"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
        <AuthLogo />
        <ThemeToggle align="end" />
      </header>

      {/* Layer 5 — the floating glass panel */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-md">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-8 pt-2 text-center sm:pb-6">
        <p className="text-xs tracking-wide text-muted-foreground">
          Forged with Focus
          <span className="mx-2 text-ember/70">•</span>
          Built for Builders
          <span className="mx-2 text-ember/70">•</span>
          Powered by Curiosity
        </p>
      </footer>
    </div>
  );
}
