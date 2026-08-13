import { Flame } from "lucide-react";

import CapEmblem from "../cap/CapEmblem";
import { PAGE } from "./styles";

/* -------------------------------------------------------------------------- */
/*  CoverPage — the book's front cover.                                       */
/*  Deep-ink cover surface, an ember wordmark, the cap emblem in a ring       */
/*  (the anchor the 3D cap flies into), the title, and the table of          */
/*  contents — all real chapters.                                             */
/* -------------------------------------------------------------------------- */

const CONTENTS = [
  ["I", "The problem"],
  ["II", "The forge loop"],
  ["III", "The workspace"],
  ["IV", "The AI"],
  ["V", "The roadmap"],
  ["VI", "The knowledge map"],
  ["VII", "Questions & voices"],
];

export default function CoverPage() {
  return (
    <div className="book-cover-surface flex h-full flex-col px-[7%] py-[6%]">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-ember/15 text-ember">
            <Flame className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-[var(--book-cover-text)]">
            SkillForge
          </span>
        </span>
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[var(--book-cover-muted)]">
          A SkillForge original
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* The emblem the 3D cap flies into on scroll */}
        <div
          data-cap-anchor="cover"
          aria-hidden="true"
          className="flex w-full justify-center"
        >
          <div className="relative flex size-20 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--ember)_45%,transparent)] shadow-[0_0_0_8px_color-mix(in_oklch,var(--ember)_10%,transparent),0_0_40px_-8px_color-mix(in_oklch,var(--ember)_40%,transparent)] sm:size-24">
            <CapEmblem className="size-12 sm:size-14" />
          </div>
        </div>

        <h1 className={`${PAGE.h2} mt-6 text-[var(--book-cover-text)]`}>
          The Craft of
          <br />
          Focused Learning
        </h1>
        <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-[var(--book-cover-muted)]">
          Seven chapters on turning the world's best material into your skill.
        </p>
      </div>

      <nav aria-label="Table of contents" className="mt-6">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[var(--book-cover-muted)]">
          Contents
        </p>
        <ul className="mt-2.5 space-y-1.5 border-t border-[color-mix(in_oklch,var(--book-cover-text)_14%,transparent)] pt-3">
          {CONTENTS.map(([numeral, title]) => (
            <li key={numeral} className="flex items-baseline justify-between gap-3">
              <span className="text-[0.6875rem] font-semibold text-ember">{numeral}</span>
              <span className="flex-1 border-b border-dotted border-[color-mix(in_oklch,var(--book-cover-text)_20%,transparent)]" />
              <span className="text-[0.75rem] font-medium text-[var(--book-cover-text)]">
                {title}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-4 text-center text-[0.625rem] uppercase tracking-[0.18em] text-[var(--book-cover-muted)]">
        The distraction-free learning workspace
      </p>
    </div>
  );
}