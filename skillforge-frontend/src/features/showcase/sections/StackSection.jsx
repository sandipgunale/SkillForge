import { DIAGRAM, TYPOGRAPHY } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";
import { FACTS } from "../data/manifest";

/* --------------------------------------------------------------------------
   StackSection — chapter 01. NOT a 3-col card grid (anti-slop): a horizontal
   "decision stream" — why → trade-off → where-in-repo — per layer. Every
   claim is a real, verifiable choice with its evidence chips.
   -------------------------------------------------------------------------- */

const DECISIONS = [
  {
    layer: "Frontend",
    why: "React 19 + Vite 8 (rolldown) for route-split lazy bundles",
    tradeOff: "framework cost vs cold-start budget",
    where: "skillforge-frontend/ · vite.config",
    chips: ["lazy routes · withSuspense", "GSAP single motion engine"],
  },
  {
    layer: "Backend",
    why: "Spring Boot 3 + modular Clean Architecture",
    tradeOff: "convention over magic — explicit wiring wins",
    where: "skillforge-backend/ · feature modules",
    chips: [`${FACTS.javaTestFiles} test files`, "constructor injection everywhere"],
  },
  {
    layer: "Data",
    why: "PostgreSQL + Flyway V1–V20 versioned migrations",
    tradeOff: "schema as code vs anemic DDL",
    where: `db/migration — ${FACTS.migrations} migrations shipped`,
    chips: ["V1..V20 enforced", "migration = change record"],
  },
  {
    layer: "AI",
    why: "Gemini via a provider abstraction — not vendor lock-in",
    tradeOff: "portable surface vs direct SDK",
    where: "ai/ · provider registry · fallback chain",
    chips: ["prompt guardrails", "schema validation"],
  },
  {
    layer: "Quality",
    why: "verification-first: tests, gates, budgets",
    tradeOff: "speed up by verifying more, not less",
    where: "JaCoCo gate · zero-warning lint · perf budgets",
    chips: ["test gate", "lint gate", "bundle budget"],
  },
];

export default function StackSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="01"
      eyebrow="The Stack"
      title="Chosen by trade-off, not fashion."
      claim="Every layer of SkillForge is a decision with a why and a where it lives. These are the ones that shaped the build."
    >
      <ol className="divide-y divide-border/60" aria-label="Technology decisions">
        {DECISIONS.map((d) => (
          <li key={d.layer} className="flex flex-col gap-3 py-6 md:flex-row md:items-start md:gap-8">
            <div className={`${DIAGRAM.layerChip} w-fit shrink-0 md:w-36`}>{d.layer}</div>
            <div className="flex-1 space-y-2">
              <p className="font-semibold leading-snug">{d.why}</p>
              <p className="font-mono text-2xs uppercase tracking-[0.12em] text-muted-foreground">
                {d.tradeOff}
              </p>
              <p className={TYPOGRAPHY.hint}>{d.where}</p>
              <div className="flex flex-wrap gap-2">
                {d.chips.map((c) => (
                  <span key={c} className={DIAGRAM.tokenPill}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </ChapterShell>
  );
}