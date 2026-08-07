import { useState } from "react";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import MissionContent from "./MissionRail";

export default function MissionSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 sm:max-w-sm">
        <div
          className="h-full"
          onClick={(event) => {
            if (event.target.closest?.("a[href]")) setOpen(false);
          }}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <MissionContent className="border-r bg-background/70 backdrop-blur" />
        </div>
      </SheetContent>
    </Sheet>
  );
}