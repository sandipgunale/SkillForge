import { useRef } from "react";

import { useSectionReveal } from "@/lib/motion-gsap";

/**
 * SectionHeading — eyebrow pill + title + description, revealed by GSAP
 * ScrollTrigger when the section scrolls into view. Renders instantly under
 * prefers-reduced-motion.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const rootRef = useRef(null);

  useSectionReveal(rootRef, [
    { selector: "[data-heading='eyebrow']", y: 16, duration: 0.55, trigger: "top 82%" },
    { selector: "[data-heading='title']", y: 24, duration: 0.65, trigger: "top 80%" },
    { selector: "[data-heading='description']", y: 20, duration: 0.6, trigger: "top 78%" },
  ]);

  const alignment =
    align === "center"
      ? "mx-auto items-center text-center"
      : "items-start text-left";

  return (
    <div
      ref={rootRef}
      className={`flex max-w-2xl flex-col gap-4 ${alignment}`}
    >
      {eyebrow && (
        <span
          data-heading="eyebrow"
          className="inline-flex w-fit items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ember"
        >
          {eyebrow}
        </span>
      )}
      <h2
        data-heading="title"
        className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
      >
        {title}
      </h2>
      {description && (
        <p
          data-heading="description"
          className="text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </p>
      )}
    </div>
  );
}