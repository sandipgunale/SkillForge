import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, Search, WandSparkles } from "lucide-react";
import { gsap } from "gsap";

import { getNavigationSections } from "@/config/navigation";
import { useAuth } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import { OPEN_PALETTE_EVENT, listenFor } from "@/lib/mission-events";
import { GSAP_EASE } from "@/lib/motion-gsap";
import { useMotionSafe } from "@/lib/motion-gsap";
import { cn } from "@/lib/utils";

const AI_ACTIONS = [
  {
    label: "Ask the AI Command Center",
    hint: "Progress, plans, study",
    run: ({ navigate }) => {
      navigate(ROUTES.DASHBOARD);
      window.dispatchEvent(new CustomEvent("skillforge:focus-ai"));
    },
    icon: WandSparkles,
    keywords: ["ask", "command center", "ai", "help", "assistant"],
  },
  {
    label: "Generate a learning roadmap",
    hint: "AI-built course",
    run: ({ navigate }) => navigate(ROUTES.LEARNING_PATH),
    icon: WandSparkles,
    keywords: "roadmap learning path generate",
  },
  {
    label: "Generate a quiz",
    hint: "AI-built practice",
    run: ({ navigate }) => navigate(ROUTES.QUIZ_SETUP),
    icon: WandSparkles,
    keywords: "quiz generate practice test",
  },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { reduced } = useMotionSafe();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const searchRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);

  const navigationItems = useMemo(() => {
    const items = getNavigationSections(role).flatMap((section) =>
      section.items.map((item) => ({
        label: item.title,
        path: item.path,
        icon: item.icon,
        keywords: `${item.title} ${section.label}`,
        section: section.label,
      })),
    );
    return items;
  }, [role]);

  const commands = useMemo(
    () => [...AI_ACTIONS, ...navigationItems],
    [navigationItems],
  );

  const openPalette = () => {
    setQuery("");
    setIndex(0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    requestAnimationFrame(() => searchRef.current?.focus());

    if (reduced || !panelRef.current) return undefined;
    const tween = gsap.from(panelRef.current, {
      opacity: 0,
      scale: 0.96,
      y: -12,
      duration: 0.22,
      ease: GSAP_EASE.outExpo,
    });
    return () => tween.kill();
  }, [open, reduced]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          openPalette();
        }
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const handleOpen = () => openPalette();
    window.addEventListener("keydown", handleKeyDown);
    const off = listenFor(OPEN_PALETTE_EVENT, handleOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      off();
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, commands]);

  const activeIndex = Math.min(index, Math.max(0, results.length - 1));

  if (!open) return null;

  const run = (command) => {
    setOpen(false);
    if (command.run) command.run({ navigate });
    else if (command.path) navigate(command.path);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = results[activeIndex];
      if (active) run(active);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        ref={panelRef}
        className="w-full max-w-xl overflow-hidden rounded-2xl border bg-popover shadow-2xl elevate-float"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search&hellip;"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-3xs font-semibold text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ul
          id="command-palette-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-80 overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;.
            </li>
          ) : (
            results.map((command, i) => {
              const Icon = command.icon;
              const active = i === activeIndex;
              return (
                <li key={command.path ?? command.label} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => run(command)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-ember/10 text-ember" : "text-foreground",
                    )}
                  >
                    {Icon && (
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          active ? "bg-ember/15 text-ember" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {command.label}
                      </span>
                      {command.hint && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {command.hint}
                        </span>
                      )}
                    </span>

                    {active && (
                      <CornerDownLeft className="size-3.5 shrink-0 text-ember" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t px-4 py-2 text-3xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="size-3" /> Open
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowRight className="size-3" /> Action
          </span>
        </div>
      </div>
    </div>
  );
}