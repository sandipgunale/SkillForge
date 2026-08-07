import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";

import MissionContent from "@/components/layout/MissionRail";
import MissionTopBar from "@/components/layout/MissionTopBar";
import CommandPalette from "@/components/layout/CommandPalette";

import { cn } from "@/lib/utils";
import { usePageEnter } from "@/lib/dashboard-motion";

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const mainRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  usePageEnter(mainRef, { stagger: 0.05 });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/30">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <CommandPalette />

      <div className="flex">
        {/* Desktop rail */}
        <aside
          aria-label="Sidebar"
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/60 transition-[width] duration-300 ease-out lg:flex",
            collapsed ? "w-[4.5rem]" : "w-64",
          )}
        >
          <MissionContent
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <MissionTopBar />

          <main
            id="main-content"
            ref={mainRef}
            className="mx-auto w-full max-w-screen-2xl px-3 pb-12 sm:px-5"
          >
            <div data-enter>{outlet}</div>
          </main>
        </div>
      </div>
    </div>
  );
}