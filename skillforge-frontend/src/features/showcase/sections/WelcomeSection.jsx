import { Link } from "react-router-dom";
import { ArrowRight, Printer } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import { TYPOGRAPHY } from "@/lib/design-system";

import { FACTS } from "../data/manifest";
import { CORE_TOUR } from "../data/chapters";

/* --------------------------------------------------------------------------
   WelcomeSection — the first-2-seconds anchor: the live metric ticker
   counting up once (commits / Java files / frontend files / migrations),
   the one-line thesis, and the "start the tour" CTA. Mirrors the approved
   Ember Forge welcome. Numbers come from FACTS, never hardcoded.
   -------------------------------------------------------------------------- */

const TICKER = [
  { to: FACTS.commits, suffix: "", label: "commits", note: "single author" },
  { to: FACTS.javaMainFiles, suffix: "", label: "Java files", note: "backend main" },
  { to: FACTS.frontendFiles, suffix: "", label: "frontend files", note: "JS/TS" },
  { to: FACTS.migrations, suffix: "", label: "migrations", note: "Flyway V1–V20" },
];

export default function WelcomeSection() {
  return (
    <section id="chapter-welcome" className="relative scroll-mt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--ember)_10%,transparent)_0%,transparent_55%)]" />
        <div className="absolute right-0 top-0 h-64 w-64 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--aurora)_10%,transparent)_0%,transparent_60%)]" />
      </div>

      <div className="flex flex-col gap-6 pt-16">
        <span className="inline-flex items-center gap-2 font-mono text-3xs uppercase tracking-[0.22em] text-aurora">
          <span className="h-px w-8 bg-gradient-to-r from-ember to-aurora" />
          Engineering showcase
        </span>

        <h1 className={`max-w-3xl ${TYPOGRAPHY.hero}`}>
          The skill behind the{" "}
          <span className="bg-gradient-to-r from-ember to-aurora bg-clip-text text-transparent">
            story.
          </span>
        </h1>

        <p className={`max-w-xl ${TYPOGRAPHY.body} text-muted-foreground`}>
          One codebase, one engineer, production-grade delivery. Walk the
          architecture, security, and AI systems behind SkillForge — a
          ten-minute tour, engineered for recruiters.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/showcase#${CORE_TOUR[1]?.id ?? "stack"}`}
            className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#ffd166] to-ember px-6 font-semibold text-[#1c1203] shadow-lg shadow-ember/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring"
          >
            Start the walkthrough
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => window.print?.()}
            aria-label="Print this walkthrough as a résumé"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border bg-background/40 px-6 font-mono text-xs tracking-[0.08em] text-muted-foreground backdrop-blur-sm transition-colors hover:border-ember/50 hover:text-ember focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Printer className="size-4" />
            Print résumé
          </button>
        </div>

        {/* First-2-seconds anchor */}
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 backdrop-blur-md md:grid-cols-4"
          aria-label="Snapshot metrics"
        >
          {TICKER.map((m) => (
            <div key={m.label} className="bg-card/70 p-5">
              <div className="flex items-baseline gap-1.5">
                <CountUp
                  to={m.to}
                  duration={1.4}
                  className="text-3xl font-black tracking-tight"
                />
                <span className="font-mono text-sm text-ember">{m.suffix}</span>
              </div>
              <div className="mt-1.5 font-mono text-3xs uppercase tracking-[0.14em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ember to-aurora"
                  style={{ width: `clamp(30%, ${m.to / 3.2}%, 100%)` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-muted-foreground/70">
          v{FACTS.version} · {FACTS.firstCommitDate} → {FACTS.lastCommitDate} ·{" "}
          {FACTS.commits} commits · snapshot generated {FACTS.generatedAt?.slice(0, 10)}
        </p>
      </div>
    </section>
  );
}