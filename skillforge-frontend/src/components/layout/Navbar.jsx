import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import AppLogo from "./AppLogo";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left */}
        <AppLogo />

        {/* Center */}
        <div className="hidden w-full max-w-md lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input placeholder="Search resources..." className="pl-10" />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
