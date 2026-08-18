import { useRef } from "react";

import { useSectionEntrance } from "../useEntrance";
import { Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  12 · FAQ — native <details> disclosure. Keyboard-accessible, no accordion */
/*  state, styled to the Foundry Precision tokens.                            */
/* -------------------------------------------------------------------------- */

const FAQS = [
  {
    q: "What makes SkillForge different from a bookmark manager?",
    a: "A bookmark manager holds links; SkillForge holds a path. Resources are curated, sequenced into 12-week paths, and paired with AI-graded practice — so the collection becomes a skill.",
  },
  {
    q: "Is the AI grading trustworthy?",
    a: "Yes. Every evaluation runs against a fixed rubric, and the AI layer is guarded: prompts are sanitized against injection, responses are schema-validated, and failures fail over to another provider instead of guessing. Scores are explained, never just asserted.",
  },
  {
    q: "How much time does practice take daily?",
    a: "One heat is 5–10 questions — about 15 minutes. Consistency beats intensity: a daily short session keeps the streak alive and the path moving.",
  },
  {
    q: "Can I use my own resources?",
    a: "Yes. The catalog is the default, but your workspace accepts the resources you already trust — they slot into paths like everything else.",
  },
  {
    q: "Do I need to know what to learn first?",
    a: "No. Pathfinder drafts a path from your goal and your quiz performance, and every week of it is editable. Direction is the point.",
  },
  {
    q: "Is it free to start?",
    a: "Yes — start forging with a free account, walk a path, and only later decide if the forge is where you want to stay.",
  },
];

export default function FaqSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef);

  /* Opening a <details> changes the page height: re-measure the section
     tops (navbar/progress) and refresh ScrollTrigger positions (mastery
     scrub, entrance triggers below the fold). */
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent("lp:contentchange"));
  };

  return (
    <Section id="faq" sectionRef={rootRef} className="bg-lp-surface">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p data-entrance="label" className={T.label}>
            <span className="text-lp-faint">12</span> — FAQ
          </p>
          <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[12ch]`}>
            Questions,{" "}
            <span className="text-lp-muted">answered straight.</span>
          </h2>
          <p data-entrance="lead" className={`${T.body} mt-6 max-w-[44ch]`}>
            Nothing hidden behind the curtain. If your question isn't here,
            the answer is one support ticket away.
          </p>
        </div>
        <div data-entrance="content" className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group lp-panel open:border-lp-accent/50 p-0"
              onToggle={handleToggle}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 [&::-webkit-details-marker]:hidden">
                <h3 className={`${T.h3} text-base`}>{faq.q}</h3>
                <span
                  aria-hidden="true"
                  className="font-lp-mono text-lp-accent transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className={`${T.small} px-6 pb-6 text-lp-muted`}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}