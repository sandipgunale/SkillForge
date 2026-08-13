import { CircleDot, Flame, Hammer, RefreshCw } from "lucide-react";

import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Two — "The forge loop".                                           */
/*  Focus → Practice → Feedback → Momentum, told as four forged steps         */
/*  across the spread (real landing copy).                                    */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    icon: CircleDot,
    step: "01",
    title: "Focus",
    tagline: "The path is set — distractions fall away.",
    body: "A structured path built from the best existing resources: sequenced, filtered, and stripped of every distraction.",
  },
  {
    icon: Hammer,
    step: "02",
    title: "Practice",
    tagline: "Active recall, on demand.",
    body: "AI-generated quizzes adapted to your topic, difficulty, and schedule. Active recall beats passive watching, every time.",
  },
  {
    icon: RefreshCw,
    step: "03",
    title: "Feedback",
    tagline: "Right or wrong is only half the story.",
    body: "Instant AI evaluation of every answer — not just right or wrong, but why, with personalized feedback per question.",
  },
  {
    icon: Flame,
    step: "04",
    title: "Momentum",
    tagline: "Progress you can see, and keep.",
    body: "Badges, streaks, weekly digests, and a learning-health score that make progress visible and keep you coming back.",
  },
];

function LoopSteps({ items, accent }) {
  return (
    <ul className="space-y-3">
      {items.map(({ icon: Icon, step, title, tagline, body }) => (
        <li
          key={step}
          className="relative flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3.5"
        >
          <div className="relative shrink-0">
            <div className={`flex size-9 items-center justify-center rounded-xl border bg-card ${accent}`}>
              <Icon className="size-4" />
            </div>
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {step}
            </span>
          </div>
          <div>
            <p className={`${PAGE.body} font-bold`}>{title}</p>
            <p className={`${PAGE.small} ${PAGE.ember} mt-0.5 font-semibold`}>{tagline}</p>
            <p className={`${PAGE.small} ${PAGE.muted} mt-1 leading-relaxed`}>{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LoopLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Two" number={number} total={total} side="left">
      <ChapterOpener
        number="II"
        chapter="The forge loop"
        title="People don't fail for lack of material. They fail because they lose the loop."
        lead="Focus → Practice → Feedback → Momentum. Repeat. The loop is the product — every feature exists to keep it turning."
      >
        <LoopSteps items={STEPS.slice(0, 2)} accent="text-ember" />
      </ChapterOpener>
    </BookPage>
  );
}

export function LoopRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Two" number={number} total={total} side="right">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>The loop, continued</p>
        <div className="mt-4 flex-1">
          <LoopSteps items={STEPS.slice(2)} accent="text-ember" />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--ember)_8%,transparent)] px-4 py-3">
          {["Focus", "Practice", "Feedback", "Momentum"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`${PAGE.small} font-bold ${i === 3 ? "text-ember" : "text-[var(--book-page-muted)]"}`}>
                {label}
              </span>
              {i < 3 && (
                <span aria-hidden="true" className="h-px w-3 bg-[var(--book-rule)] sm:w-5" />
              )}
            </div>
          ))}
        </div>
        <p className={`${PAGE.small} ${PAGE.muted} mt-3 text-center`}>
          …then repeat. Momentum compounds.
        </p>
      </div>
    </BookPage>
  );
}