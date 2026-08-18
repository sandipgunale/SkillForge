import { useRef } from "react";

import { useScrubReveal, useSectionEntrance } from "../useEntrance";
import { Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  11 · HOW — the full circuit. Resource → Path → Practice → Quiz →         */
/*  Feedback → Progress, closed. Scrub-lit as the section scrolls.            */
/* -------------------------------------------------------------------------- */

const CIRCUIT = [
  ["01", "Resource", "A curated library supplies the raw material."],
  ["02", "Path", "Pathfinder sequences it into a twelve-week route."],
  ["03", "Practice", "Short daily heats keep the material hot."],
  ["04", "Quiz", "Retrieval tests what actually stuck."],
  ["05", "Feedback", "AI evaluation explains every miss, immediately."],
  ["06", "Progress", "The loop closes: health, streaks, and the next step."],
];

export function HowSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef);
  useScrubReveal(rootRef);

  return (
    <Section id="how" sectionRef={rootRef} className="bg-lp-bg">
      <div className="max-w-[92vw] lg:max-w-[74%]">
        <p data-entrance="label" className={T.label}>
          <span className="text-lp-faint">11</span> — How it works
        </p>
        <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[16ch]`}>
          One circuit,{" "}
          <span className="text-lp-accent">closed.</span>
        </h2>
        <p data-entrance="lead" className={`${T.body} mt-6 max-w-[56ch]`}>
          The forge is a closed loop: every stage feeds the next, and the
          last one feeds the first. Follow it around, and skill is the
          by-product.
        </p>
      </div>
      <div className="mt-14 border-t border-lp-border">
        {CIRCUIT.map(([num, stage, body], i) => (
          <div key={num}>
            <div
              data-scrub-step
              className="grid gap-2 py-6 opacity-30 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline sm:gap-8"
            >
              <span className="font-lp-mono text-[0.6875rem] tracking-[0.18em] text-lp-faint">
                {num}
              </span>
              <h3 className={`${T.h3} text-lp-text`}>
                {stage}
                <span className="ml-3 text-lp-accent" aria-hidden="true">
                  {i === CIRCUIT.length - 1 ? "↻" : "→"}
                </span>
              </h3>
              <p className={`${T.small} text-lp-muted`}>{body}</p>
            </div>
            {i < CIRCUIT.length - 1 ? <div className="h-px bg-lp-border" /> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}