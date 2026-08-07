import { Command, Sparkles } from "lucide-react";

import MissionSheet from "./MissionSheet";
import UserMenu from "./UserMenu";
import GlobalSearch from "./GlobalSearch";

import NotificationBell from "@/features/notification/components/NotificationBell";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useGamification } from "@/features/gamification/hooks/useGamification";
import { openCommandPalette } from "@/lib/mission-events";

import MissionBreadcrumbs from "./MissionBreadcrumbs";

export default function MissionTopBar() {
  const { data: gamification } = useGamification();

  const points = gamification?.points;

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-screen-2xl px-3 pb-3 pt-4 sm:px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/70 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/5">
          <MissionSheet />

          <MissionBreadcrumbs /> 

          {/* Search */}
          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Command palette trigger */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open command palette"
            >
              <Command className="size-3.5" />
              <span className="hidden lg:inline">Search&hellip;</span>
              <kbd className="hidden rounded border bg-background px-1 py-0.5 text-3xs font-semibold lg:inline">
                Ctrl K
              </kbd>
            </button>

            {/* Level chip */}
            {typeof points === "number" && (
              <span className="hidden h-9 items-center gap-1.5 rounded-lg border border-ember/25 bg-ember/10 px-2.5 text-xs font-semibold text-ember sm:flex">
                <Sparkles className="size-3.5" />
                {points.toLocaleString()} pts
              </span>
            )}

            {/* AI status */}
            <span
              className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground xl:flex"
              title="AI services are online"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-ember" />
              </span>
              AI online
            </span>

            <div className="mx-1 h-6 w-px bg-border" />

            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}