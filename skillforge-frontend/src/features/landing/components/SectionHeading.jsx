import { useRef } from "react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

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
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      const reveal = (targets, vars) => {
        if (targets.length) {
          gsap.from(targets, vars);
        }
      };
      const trigger = (start) => ({
        trigger: rootRef.current,
        start,
        once: true,
      });
      reveal(select("[data-heading='eyebrow']"), {
        opacity: 0,
        y: 16,
        duration: 0.55,
        ease: "power2.out",
        scrollTrigger: trigger("top 82%"),
      });
      reveal(select("[data-heading='title']"), {
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: trigger("top 80%"),
      });
      reveal(select("[data-heading='description']"), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: trigger("top 78%"),
      });
    },
    [reduced],
    rootRef,
  );

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