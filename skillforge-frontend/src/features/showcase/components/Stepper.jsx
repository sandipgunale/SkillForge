import { useEffect, useState } from "react";

import { CORE_TOUR } from "../data/chapters";

/* --------------------------------------------------------------------------
   Stepper — the tour "next / prev" controls. Walks the chapter order and
   scrolls the next chapter into view. The active chapter is tracked by an
   IntersectionObserver (event-driven, so it never syncs state in effects).
   -------------------------------------------------------------------------- */

export default function Stepper() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const sections = CORE_TOUR.map((c) => document.getElementById(`chapter-${c.id}`)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.34) {
            const id = entry.target.id.replace("chapter-", "");
            const i = CORE_TOUR.findIndex((c) => c.id === id);
            if (i >= 0) setCurrent(i);
          }
        }
      },
      { rootMargin: "-20% 0px -52% 0px", threshold: [0.34] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goto = (id) => {
    if (!id) return;
    const target = document.getElementById(`chapter-${id}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const prev = CORE_TOUR[current - 1];
  const next = CORE_TOUR[current + 1];

  return (
    <div className="showcase-stepper flex items-center justify-between gap-4 border-t border-border/60 py-6">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xs uppercase tracking-[0.18em] text-muted-foreground">
          {CORE_TOUR[current]?.number ?? "--"}
        </span>
        <span className="font-semibold">{CORE_TOUR[current]?.title ?? ""}</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!prev}
          onClick={() => goto(prev?.id)}
          className="rounded-full border border-border px-5 py-2 font-mono text-overline tracking-[0.08em] text-muted-foreground transition-colors hover:border-ember/50 hover:text-ember disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring"
        >
          ← prev
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => goto(next?.id)}
          className="rounded-full border border-ember/50 bg-ember/10 px-5 py-2 font-mono text-overline tracking-[0.08em] text-ember transition-colors hover:bg-ember/20 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring"
        >
          next →
        </button>
      </div>
    </div>
  );
}