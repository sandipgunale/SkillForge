import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ALL_CHAPTERS } from "../data/chapters";

/* --------------------------------------------------------------------------
   ChapterRail — the chapter navigation landmark (role=tablist).

   Desktop: vertical rail on the left. Mobile: horizontal, scrollable,
   top rail (<768px). Supports:
   - arrow-key navigation (Left/Right/Up/Down + Home/End)
   - focus-visible ring from the global tokens
   - 44px min touch targets
   - `#<chapter-id>` hash scrolling (uses the native anchor, the page owns
     the scrollIntoView on navigation)
   -------------------------------------------------------------------------- */

export default function ChapterRail({ activeId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const listRef = useRef(null);

  const jump = (id) => navigate(`${location.pathname}#${id}`);

  const onKeyDown = (e) => {
    const tabs = Array.from(listRef.current?.querySelectorAll("[role='tab']") ?? []);
    if (!tabs.length) return;
    const current = tabs.findIndex((t) => t.getAttribute("data-id") === activeId);
    const target =
      e.key === "Home"
        ? tabs[0]
        : e.key === "End"
          ? tabs[tabs.length - 1]
          : e.key === "ArrowRight" || e.key === "ArrowDown"
            ? tabs[(current + 1) % tabs.length]
            : e.key === "ArrowLeft" || e.key === "ArrowUp"
              ? tabs[(current - 1 + tabs.length) % tabs.length]
              : null;
    if (!target) return;
    e.preventDefault();
    target.focus();
    jump(target.getAttribute("data-id"));
  };

  return (
    <nav
      aria-label="Showcase chapters"
      className="showcase-rail sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label="Chapter index"
        onKeyDown={onKeyDown}
        className="flex items-center gap-1 overflow-x-auto px-4 py-2 lg:justify-center"
      >
        {ALL_CHAPTERS.map(({ id, number, title, deep }) => {
          const active = id === activeId;
          return (
            <button
              key={id}
              role="tab"
              data-id={id}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => jump(id)}
              className={`min-h-11 shrink-0 rounded-full border px-3 py-2 font-mono text-overline tracking-[0.06em] transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                active
                  ? "border-ember/60 bg-ember/10 text-ember"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              }`}
            >
              <span className="mr-1 opacity-60">{number}</span>
              {title}
              {deep ? <span className="ml-1 text-[10px] text-aurora">+</span> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}