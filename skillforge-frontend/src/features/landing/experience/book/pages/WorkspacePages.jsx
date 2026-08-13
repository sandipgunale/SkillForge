import { Bookmark, Command, Gauge, Library, Lightbulb, Search, ShieldCheck, Timer } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Three — "The workspace" and the honest performance budget.        */
/*  Real product surfaces: the resource library (topics/tags/search),         */
/*  Search + command palette, bookmarks & ratings, progress-aware            */
/*  resource pages — then the engineering numbers as targets, not claims.     */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Library,
    title: "A living library",
    body: "Topics and tags organise a real catalog — searchable, categorized, and kept clean by administrators.",
  },
  {
    icon: Command,
    title: "Global search & command palette",
    body: "⌘K from anywhere: keyboard-first navigation across resources, quizzes, and pages. No mouse required.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & ratings",
    body: "Build your own curriculum. Save resources, rate them, and let quality signals rise to the top.",
  },
  {
    icon: Search,
    title: "Progress-aware pages",
    body: "Every resource remembers where you are — visited, reading, or mastered. Pick up exactly where you left off.",
  },
];

const METRICS = [
  {
    icon: Gauge,
    value: 98,
    suffix: "+",
    label: "Lighthouse performance",
    note: "Targeted on every release",
  },
  {
    icon: Timer,
    value: 1.5,
    decimals: 1,
    suffix: "s",
    label: "First Contentful Paint",
    note: "Route-level code splitting",
  },
  {
    icon: ShieldCheck,
    value: 240,
    suffix: "+",
    label: "Automated tests",
    note: "Unit, integration, and contract",
  },
  {
    icon: Lightbulb,
    value: 0,
    suffix: "",
    label: "Lint warnings shipped",
    note: "Zero-warning gate in CI",
  },
];

export function WorkspaceLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Three" number={number} total={total} side="left">
      <ChapterOpener
        number="III"
        chapter="The workspace"
        title="A workspace built around finishing"
        lead="Every surface exists for one job: keep the learner in flow. Search is instant, navigation is keyboard-first, and your library is yours."
      >
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ember/12 text-ember">
                <Icon className="size-4" />
              </span>
              <span>
                <span className={`${PAGE.body} block font-semibold`}>{title}</span>
                <span className={`${PAGE.small} ${PAGE.muted} mt-0.5 block leading-relaxed`}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </ChapterOpener>
    </BookPage>
  );
}

export function MetricsRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Three" number={number} total={total} side="right">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>The budget</p>
        <h3 className={`${PAGE.h3} mt-2`}>
          Fast is a feature.{" "}
          <span className="text-gradient-ember">Here's the budget.</span>
        </h3>
        <p className={`${PAGE.body} ${PAGE.muted} mt-2`}>
          Targets, not slogans — every release is measured against them.
        </p>

        <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
          {METRICS.map(({ icon: Icon, value, suffix, decimals = 0, label, note }) => (
            <div
              key={label}
              className="flex flex-col rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember">
                  <Icon className="size-4" />
                </span>
                <span className={`${PAGE.small} ${PAGE.muted} font-semibold uppercase tracking-[0.14em]`}>
                  Target
                </span>
              </div>
              <p className="mt-4 text-[clamp(1.4rem,3.6vh,2.1rem)] font-bold tabular-nums tracking-tight">
                <CountUp to={value} decimals={decimals} suffix={suffix} />
              </p>
              <p className={`${PAGE.body} mt-0.5 font-semibold`}>{label}</p>
              <p className={`${PAGE.small} ${PAGE.muted} mt-0.5`}>{note}</p>
            </div>
          ))}
        </div>

        <p className={`${PAGE.small} ${PAGE.ember} mt-4 font-semibold`}>
          Respect for the learner's hardware is part of the product.
        </p>
      </div>
    </BookPage>
  );
}