import { Activity, Boxes, Cpu, Database, Layers, Lock, RefreshCw, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Four — "The AI" and how it is built.                              */
/*  The AI page: the real quiz-generation pipeline (Gemini, strict schema,    */
/*  validation + retry, per-question feedback, daily quota, resume/expiry     */
/*  semantics from the product FAQ). The built page: the three architecture   */
/*  layers and the principles that keep it honest.                            */
/* -------------------------------------------------------------------------- */

const AI_STEPS = [
  {
    title: "Set the forge",
    body: "Pick a topic (or a week of your path), difficulty, question types, and count.",
  },
  {
    title: "Generate to a strict schema",
    body: "Gemini writes the quiz against a validated schema — malformed output is retried automatically.",
  },
  {
    title: "Feedback that teaches",
    body: "Your submission is evaluated per question: not just right or wrong, but why — with personalized explanation.",
  },
  {
    title: "Fair, bounded, resumable",
    body: "A per-user daily quota keeps the experience predictable. Quizzes resume mid-session and expire cleanly server-side.",
  },
];

const LAYERS = [
  {
    icon: Layers,
    name: "Presentation",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: [
      { icon: Cpu, label: "React 19 + Vite 8" },
      { icon: Boxes, label: "GSAP motion engine" },
      { icon: Lock, label: "JWT auth, lazy routes" },
    ],
  },
  {
    icon: Workflow,
    name: "Application",
    accent: "text-aurora",
    chip: "bg-aurora/12",
    items: [
      { icon: Boxes, label: "Spring Boot 3, clean modules" },
      { icon: ShieldCheck, label: "Rate limits + circuit breakers" },
      { icon: Database, label: "PostgreSQL + Flyway migrations" },
    ],
  },
  {
    icon: Cpu,
    name: "AI Subsystem",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: [
      { icon: ShieldCheck, label: "Prompt guardrails, schema validation" },
      { icon: Workflow, label: "Provider failover + retries" },
      { icon: Database, label: "Token & cost analytics" },
    ],
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, text: "No hardcoded secrets. Ever." },
  { icon: Boxes, text: "Small files, composed over inherited." },
  { icon: RefreshCw, text: "Retries, failover, graceful degradation." },
  { icon: Activity, text: "Metrics on every layer, correlation IDs everywhere." },
];

export function AiLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Four" number={number} total={total} side="left">
      <ChapterOpener
        number="IV"
        chapter="The AI"
        title="Practice, forged on demand"
        lead="Not a chatbot bolted on — a guarded, validated, observable pipeline that turns any topic into active recall."
      >
        <ol className="space-y-3">
          {AI_STEPS.map(({ title, body }, index) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ember/12 text-[0.6875rem] font-bold text-ember">
                {index + 1}
              </span>
              <span>
                <span className={`${PAGE.body} block font-semibold`}>{title}</span>
                <span className={`${PAGE.small} ${PAGE.muted} mt-0.5 block leading-relaxed`}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </ChapterOpener>
    </BookPage>
  );
}

export function BuiltRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Four" number={number} total={total} side="left">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>The engineering</p>
        <h3 className={`${PAGE.h3} mt-2`}>
          Forged like it{" "}
          <span className="text-gradient-ember">has to survive contact.</span>
        </h3>
        <p className={`${PAGE.body} ${PAGE.muted} mt-2`}>
          A production system engineered end-to-end: resilient AI, honest
          data, a frontend that respects your hardware.
        </p>

        <div className="mt-4 grid flex-1 grid-cols-3 gap-3">
          {LAYERS.map(({ icon: Icon, name, accent, chip, items }) => (
            <div
              key={name}
              className="flex flex-col rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <div className={`flex size-8 items-center justify-center rounded-lg ${chip} ${accent}`}>
                <Icon className="size-4" />
              </div>
              <p className={`${PAGE.small} mt-2.5 font-bold`}>{name}</p>
              <ul className="mt-2 space-y-1.5">
                {items.map(({ icon: ItemIcon, label }) => (
                  <li key={label} className="flex items-start gap-1.5">
                    <ItemIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                    <span className={`${PAGE.small} ${PAGE.muted} leading-snug`}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {PRINCIPLES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 rounded-lg border border-[var(--book-rule)] px-3 py-2"
            >
              <Icon className="size-3.5 shrink-0 text-ember" />
              <span className={`${PAGE.small} ${PAGE.muted}`}>{text}</span>
            </div>
          ))}
        </div>

        <p className={`${PAGE.small} ${PAGE.ember} mt-3 font-semibold`}>
          <Sparkles className="mr-1 inline size-3" />
          Every layer ships with observability, health checks, and metrics.
        </p>
      </div>
    </BookPage>
  );
}