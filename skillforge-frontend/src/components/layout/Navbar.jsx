import AppLogo from "./AppLogo";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import GlobalSearch from "./GlobalSearch";

import NotificationBell from "@/features/notification/components/NotificationBell";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <MobileNav />

          <AppLogo className="hidden md:flex" />
        </div>

        {/* Center */}
        <div className="hidden flex-1 justify-center lg:flex">
          <GlobalSearch />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <NotificationBell />

          <UserMenu />
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t px-4 py-2 lg:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
