import { Award, CalendarDays, Flame, HeartPulse, Mail, Medal, Trophy } from "lucide-react";

import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Five — "The roadmap" and momentum.                                */
/*  Real product semantics: 12-week AI roadmaps with week-by-week goals,      */
/*  week quizzes, auto-completion and the Pathfinder badge — then the         */
/*  momentum layer: health score, streaks, badges, weekly digests,            */
/*  achievements.                                                             */
/* -------------------------------------------------------------------------- */

const PATH_STEPS = [
  {
    title: "Pick a skill and a level",
    body: "The AI drafts a 12-week roadmap: week-by-week goals, topics, and resources for exactly the level you chose.",
  },
  {
    title: "Work the weeks",
    body: "Mark weeks complete, take week quizzes, and let the path re-shape itself around what you've proven.",
  },
  {
    title: "Finish, and prove it",
    body: "When the final week is complete the path auto-completes — and the Pathfinder badge is yours.",
  },
];

const MOMENTUM = [
  {
    icon: HeartPulse,
    label: "Learning health",
    body: "A single score that reflects consistency, balance, and completion.",
  },
  {
    icon: Flame,
    label: "Streaks",
    body: "A small ember for every day you show up. Momentum becomes a habit.",
  },
  {
    icon: Trophy,
    label: "Badges & achievements",
    body: "Pathfinder, quiz streaks, perfect scores — earned, never given.",
  },
  {
    icon: Mail,
    label: "Weekly digests",
    body: "A short recap of what you forged and what's next. No noise.",
  },
];

export function RoadmapLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Five" number={number} total={total} side="left">
      <ChapterOpener
        number="V"
        chapter="The roadmap"
        title="Twelve weeks from starting to proven"
        lead="Instead of 'learn React someday', a week-by-week path with goals, resources, and quizzes — auto-completed when you finish, and it knows when you have."
      >
        <ul className="space-y-3">
          {PATH_STEPS.map(({ title, body }, index) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-aurora/15 text-aurora">
                <CalendarDays className="size-3.5" />
              </span>
              <span>
                <span className={`${PAGE.body} block font-semibold`}>
                  Week {["01–04", "05–08", "09–12"][index]} — {title}
                </span>
                <span className={`${PAGE.small} ${PAGE.muted} mt-0.5 block leading-relaxed`}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--ember)_8%,transparent)] px-4 py-3">
          <Award className="size-5 shrink-0 text-ember" />
          <p className={`${PAGE.small} ${PAGE.muted}`}>
            <span className="font-semibold text-[var(--book-page-text)]">Pathfinder</span> — the
            badge awarded for completing a path start to finish.
          </p>
        </div>
      </ChapterOpener>
    </BookPage>
  );
}

export function MomentumRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Five" number={number} total={total} side="right">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>The momentum layer</p>
        <h3 className={`${PAGE.h3} mt-2`}>Progress you can see, and keep</h3>
        <p className={`${PAGE.body} ${PAGE.muted} mt-2`}>
          Nothing in SkillForge gamifies for its own sake. Each signal exists
          to make the next session slightly more likely.
        </p>

        <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
          {MOMENTUM.map(({ icon: Icon, label, body }) => (
            <div
              key={label}
              className="flex flex-col rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3.5"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember">
                <Icon className="size-4" />
              </span>
              <p className={`${PAGE.body} mt-3 font-bold`}>{label}</p>
              <p className={`${PAGE.small} ${PAGE.muted} mt-1 leading-relaxed`}>{body}</p>
            </div>
          ))}
        </div>

        <p className={`${PAGE.small} ${PAGE.ember} mt-4 flex items-center gap-1.5 font-semibold`}>
          <Medal className="size-3.5" />
          Finish one session, and the next one starts warmer.
        </p>
      </div>
    </BookPage>
  );
}