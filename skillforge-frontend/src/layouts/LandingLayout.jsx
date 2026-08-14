import { Outlet } from "react-router-dom";

import LandingNavbar from "@/features/landing/components/LandingNavbar";

export default function LandingLayout() {
  return (
    <div className="landing-shell min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <LandingNavbar />
      <Outlet />
    </div>
  );
}
