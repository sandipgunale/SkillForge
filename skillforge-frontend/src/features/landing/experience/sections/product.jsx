import { useRef } from "react";

import { useScrubReveal, useSectionEntrance } from "../useEntrance";
import { Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  04 · RESOURCES  05 · AI  06 · PRACTICE  07 · ROADMAP  08 · PROGRESS      */
/*  Product sections — editorial copy beside honest sample-UI panels, real    */
/*  feature facts only (no fabricated stats; every mockup is labeled).        */
/* -------------------------------------------------------------------------- */

function SectionHead({ num, label, title, lead }) {
  return (
    <div className="max-w-[92vw] lg:max-w-[74%]">
      <p data-entrance="label" className={T.label}>
        <span className="text-lp-faint">{num}</span> — {label}
      </p>
      <h2 data-entrance="head" className={`${T.h2} mt-5`}>
        {title}
      </h2>
      <p data-entrance="lead" className={`${T.body} mt-6 max-w-[56ch]`}>
        {lead}
      </p>
    </div>
  );
}

/* ----------------------------- 04 · RESOURCES ----------------------------- */

const RESOURCE_ROWS = [
  {
    num: "01",
    title: "Searchable catalog",
    body: "Every resource curated into one focused catalog — courses, articles, docs, repos. Search, filter, and stop juggling twenty tabs.",
  },
  {
    num: "02",
    title: "Quick open",
    body: "Jump anywhere in your workspace in two keystrokes. Your library, your paths, your last quiz — always one command away.",
  },
  {
    num: "03",
    title: "Bookmarks & ratings",
    body: "Tag what matters, rate what helped. Your ratings sharpen the recommendations — and the AI reads them when it drafts your practice.",
  },
  {
    num: "04",
    title: "Progress-aware pages",
    body: "Resources remember where you left off — across sessions, devices, and a week of real life getting in the way.",
  },
];

export function ResourcesSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "mirror" });

  return (
    <Section id="resources" motion="mirror" sectionRef={rootRef} className="bg-lp-surface">
      <SectionHead
        num="04"
        label="Resources"
        title={
          <>
            One workspace.{" "}
            <span className="text-lp-muted">Your entire library.</span>
          </>
        }
        lead="SkillForge replaces the tab-soup: a curated catalog that lives next to your paths, quizzes, and progress — so the raw material is always in reach of the forge."
      />
      <div className="mt-14 border-t border-lp-border" data-entrance="content">
        {RESOURCE_ROWS.map((row) => (
          <div
            key={row.num}
            className="group grid gap-2 border-b border-lp-border py-7 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline sm:gap-8"
          >
            <span className="font-lp-mono text-[0.6875rem] tracking-[0.18em] text-lp-faint transition-colors group-hover:text-lp-accent">
              {row.num}
            </span>
            <h3 className={`${T.h3} text-lp-text transition-colors group-hover:text-lp-accent`}>
              {row.title}
            </h3>
            <p className={`${T.small} text-lp-muted`}>{row.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- 05 · AI --------------------------------- */

const AI_FACTS = [
  ["Guardrailed", "Every prompt passes injection guards before it touches the model."],
  ["Schema-validated", "AI responses are parsed and validated against strict schemas."],
  ["Resilient", "Retries, timeouts, and provider failover keep practice flowing."],
  ["Measured", "Token, cost, and cache analytics — the AI never surprises you."],
];

export function AiSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "mirror" });

  return (
    <Section id="ai" motion="mirror" sectionRef={rootRef} className="bg-lp-bg">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHead
            num="05"
            label="AI practice"
            title={
              <>
                Answered. Evaluated.{" "}
                <span className="text-lp-accent">Explained.</span>
              </>
            }
            lead="Practice is only useful when the feedback is honest. SkillForge's AI grades your answers against a rubric, explains exactly where you went wrong, and never hallucinates a score."
          />
          <div className="mt-10 max-w-[52ch]" data-entrance="content">
            <ul className="flex flex-col gap-5">
              {AI_FACTS.map(([heading, body]) => (
                <li key={heading} className="flex gap-4">
                  <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-lp-accent" />
                  <div>
                    <h3 className={`${T.h3} text-base`}>{heading}</h3>
                    <p className={`${T.small} mt-1 text-lp-muted`}>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample evaluation panel */}
        <div data-entrance="aside" className="flex flex-col justify-center">
          <div className="lp-panel p-6 sm:p-8">
            <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em] text-lp-muted">
              AI evaluation
            </p>
            <p className="font-lp-mono mt-1 text-[0.6875rem] uppercase tracking-[0.16em] text-lp-faint">
              Sample UI — live data at runtime
            </p>

            <div className="mt-6 border border-lp-border p-5">
              <p className="font-lp-mono text-[0.625rem] uppercase tracking-[0.2em] text-lp-faint">
                Question 04 / 12
              </p>
              <p className={`${T.h3} mt-3 text-lg`}>
                What does the TypeScript <code className="font-lp-mono text-[0.95em] text-lp-accent">satisfies</code>{" "}
                operator do?
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                {[
                  ["Assigns a type at runtime.", false],
                  ["Checks a value against a type without changing its inferred type.", true],
                  ["Overrides the compiler's narrowing.", false],
                  ["Makes an interface readonly.", false],
                ].map(([option, correct]) => (
                  <div
                    key={option}
                    className={`flex items-center gap-3 border px-4 py-3 text-sm ${
                      correct
                        ? "border-lp-accent bg-lp-accent/10 text-lp-text"
                        : "border-lp-border text-lp-muted"
                    }`}
                  >
                    <span className={`size-1.5 shrink-0 rounded-full ${correct ? "bg-lp-accent" : "bg-lp-border-strong"}`} />
                    {option}
                    {correct ? (
                      <span className="ml-auto font-lp-mono text-[0.625rem] uppercase tracking-[0.16em] text-lp-accent">
                        Chosen
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-l-2 border-lp-border bg-lp-surface-2 p-5">
              <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lp-accent">
                Score 10 / 10
              </p>
              <p className={`${T.small} mt-2 text-lp-text`}>
                Correct — <code className="font-lp-mono text-[0.95em] text-lp-accent">satisfies</code> validates a value
                against a type while preserving its inferred type. The check happens at compile time, not runtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ 06 · PRACTICE ----------------------------- */

const CYCLE = [
  ["01", "Set the forge", "Pick a topic or open an adaptive path — the sequence is drafted for you."],
  ["02", "Attempt", "Answer a short quiz heat: 5â€“10 questions, one sitting, honest effort."],
  ["03", "Evaluation", "The AI grades instantly against the rubric — a score you can trust."],
  ["04", "Feedback", "Explanations land where you erred, with pointers to the exact resources."],
  ["05", "Next heat", "The path adapts to your result. Repeat daily — momentum compounds."],
];

export function PracticeSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "mirror" });
  useScrubReveal(rootRef);

  return (
    <Section id="practice" motion="mirror" sectionRef={rootRef} className="bg-lp-surface">
      <SectionHead
        num="06"
        label="Practice"
        title={
          <>
            A cycle you can{" "}
            <span className="text-lp-muted">finish.</span>
          </>
        }
        lead="Reading alone doesn't build skill — retrieval does. The forge runs on short, frequent practice heats: attempt, get graded, learn where you missed, and feed the result back into the path."
      />
      <div className="mt-14 border-t border-lp-border">
        {CYCLE.map(([num, title, body]) => (
          <div
            key={num}
            data-scrub-step
            className="grid gap-2 border-b border-lp-border py-6 opacity-30 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline sm:gap-8"
          >
            <span className="font-lp-mono text-[0.6875rem] tracking-[0.18em] text-lp-accent">
              {num}
            </span>
            <h3 className={T.h3}>{title}</h3>
            <p className={`${T.small} text-lp-muted`}>{body}</p>
          </div>
        ))}
      </div>
      <p className="font-lp-mono mt-8 text-[0.6875rem] uppercase tracking-[0.2em] text-lp-faint">
        A 15-minute heat a day keeps the forge hot.
      </p>
    </Section>
  );
}

/* ------------------------------ 07 · ROADMAP ------------------------------ */

const PHASES = [
  ["Weeks 01â€“04", "Foundations", "Sequenced core: syntax, tooling, and your first builds."],
  ["Weeks 05â€“08", "Depth", "Real-world patterns, testing, and performance under load."],
  ["Weeks 09â€“12", "Projects", "Ship portfolio work — the path certifies what you built."],
];

export function RoadmapSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "mirror" });

  return (
    <Section id="roadmap" motion="mirror" sectionRef={rootRef} className="bg-lp-bg">
      <SectionHead
        num="07"
        label="Learning paths"
        title={
          <>
            Twelve weeks,{" "}
            <span className="text-lp-accent">one direction.</span>
          </>
        }
        lead="Pathfinder drafts a 12-week path from your goal and your quiz performance — foundations, depth, then real projects. You can edit every week; the forge keeps the sequence honest."
      />
      <div className="mt-14 grid gap-5 lg:grid-cols-3" data-entrance="content">
        {PHASES.map(([weeks, title, body], i) => (
          <div key={weeks} className="lp-panel flex flex-col p-7">
            <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lp-accent">
              {weeks}
            </p>
            <p className="font-lp-mono mt-6 text-[0.6875rem] tracking-[0.2em] text-lp-faint">
              Phase {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className={`${T.h3} mt-2`}>{title}</h3>
            <p className={`${T.small} mt-3 text-lp-muted`}>{body}</p>
          </div>
        ))}
      </div>
      <p className="font-lp-mono mt-8 text-[0.6875rem] uppercase tracking-[0.2em] text-lp-faint">
        Every path is editable — walk it your way.
      </p>
    </Section>
  );
}

/* ------------------------------ 08 · PROGRESS ----------------------------- */

export function ProgressSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "mirror" });
  useScrubReveal(rootRef);

  return (
    <Section id="progress" motion="mirror" sectionRef={rootRef} className="bg-lp-surface">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHead
            num="08"
            label="Progress"
            title={
              <>
                Momentum you can{" "}
                <span className="text-lp-accent">read.</span>
              </>
            }
            lead="The forge instruments your learning the way a foundry instruments its heat: health, streaks, badges, and weekly digests — so you can see the metal taking shape."
          />
          <div className="mt-10 max-w-[52ch]" data-entrance="content">
            <ul className="flex flex-col gap-5">
              {[
                ["Learning health", "A composite score of consistency, accuracy, and path coverage."],
                ["Daily streak", "Short, honest sessions compound into a streak you protect."],
                ["Weekly digest", "What you finished, what slipped, and what the path suggests next."],
              ].map(([heading, body]) => (
                <li key={heading} className="flex gap-4">
                  <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-lp-accent" />
                  <div>
                    <h3 className={`${T.h3} text-base`}>{heading}</h3>
                    <p className={`${T.small} mt-1 text-lp-muted`}>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instrument readouts — sample UI */}
        <div data-entrance="aside" className="flex flex-col justify-center">
          <div className="lp-panel p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em] text-lp-muted">
                Learning health
              </p>
              <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.16em] text-lp-faint">
                Sample UI — live data at runtime
              </p>
            </div>

            <div className="mt-7">
              <p className="font-lp-mono text-[clamp(2.5rem,5vw,3.5rem)] font-medium leading-none text-lp-accent">
                <span data-scrub-num data-to="92" data-suffix="%">0%</span>
              </p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-lp-border" data-scrub-rail>
                <span
                  className="block h-full origin-left rounded-full bg-lp-accent"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-5 border-t border-lp-border pt-6">
              <div>
                <p className="font-lp-mono text-2xl font-medium text-lp-text">
                  <span data-scrub-num data-to="24">0</span>
                </p>
                <p className="font-lp-mono mt-1 text-[0.6875rem] uppercase tracking-[0.18em] text-lp-muted">
                  Day streak
                </p>
              </div>
              <div>
                <p className="font-lp-mono text-2xl font-medium text-lp-text">
                  <span data-scrub-num data-to="9">0</span>
                </p>
                <p className="font-lp-mono mt-1 text-[0.6875rem] uppercase tracking-[0.18em] text-lp-muted">
                  Badges earned
                </p>
              </div>
            </div>

            <div className="mt-6 border-l-2 border-lp-border pl-5">
              <p className="font-lp-mono text-[0.625rem] uppercase tracking-[0.2em] text-lp-faint">
                This week's digest
              </p>
              <p className={`${T.small} mt-2 text-lp-muted`}>
                4 resources completed, 3 quizzes taken, health +6%. The path
                suggests one more heat on TypeScript before Thursday.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}