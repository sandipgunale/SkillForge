import { useRef } from "react";

import { useSectionEntrance } from "../useEntrance";
import { Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  09 · WHY — the reasons the forge works. Three claims, each backed by a    */
/*  product truth. No marketing vagaries, no fabricated numbers.              */
/* -------------------------------------------------------------------------- */

const REASONS = [
  [
    "01",
    "The workspace wins",
    "Attention is the fuel. One app owns it: catalog, paths, practice, and progress live in a single focused workspace — no tab-soup, no context switching.",
  ],
  [
    "02",
    "The AI is honest",
    "Grading runs against a rubric with injection guards, schema validation, and provider failover. When it scores you, it means it.",
  ],
  [
    "03",
    "Momentum compounds",
    "Streaks, health, and badges turn practice into a habit you can see. Short daily heats beat weekend marathons — the forge is built for that.",
  ],
];

export function WhySection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { identity: "trust" });

  return (
    <Section id="why" motion="trust" sectionRef={rootRef} className="bg-lp-bg">
      <div className="max-w-[92vw] lg:max-w-[74%]">
        <p data-entrance="label" className={T.label}>
          <span className="text-lp-faint">09</span> — Why it works
        </p>
        <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[16ch]`}>
          The forge is built on{" "}
          <span className="text-lp-accent">three claims.</span>
        </h2>
      </div>
      <div className="mt-14 border-t border-lp-border" data-entrance="content">
        {REASONS.map(([num, title, body]) => (
          <div
            key={num}
            className="grid gap-2 border-b border-lp-border py-7 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline sm:gap-8"
          >
            <span className="font-lp-mono text-[0.6875rem] tracking-[0.18em] text-lp-accent">
              {num}
            </span>
            <h3 className={T.h3}>{title}</h3>
            <p className={`${T.small} text-lp-muted`}>{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}