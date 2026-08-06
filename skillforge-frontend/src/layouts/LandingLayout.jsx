import { Outlet } from "react-router-dom";

import LandingNavbar from "@/features/landing/components/LandingNavbar";
import LandingFooter from "@/features/landing/components/LandingFooter";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <LandingNavbar />
      <Outlet />
      <LandingFooter />
    </div>
  );
}
