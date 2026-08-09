import { useId, useRef } from "react";

import { TYPOGRAPHY } from "@/lib/design-system";
import { useMotionScope } from "@/lib/motion-gsap";

/* --------------------------------------------------------------------------
   ChapterShell — the Visual Grammar anatomy for every /showcase chapter.
   ONE shape: [numbered header] + [claim line] + [anchor visual slot] +
   [evidence chips]. All chapters compose from this single primitive.

   Render: `<section id="chapter-<id>">` so hash navigation
   (`/showcase#<chapter-id>`) can target it.

   Motion: a scoped entrance reveal (y + opacity) on first scroll entry,
   once:true, no pinning (long-page jank guard). Reduced-motion leaves the
   DOM visible — the pre-animation DOM IS the static labeled fallback.
   -------------------------------------------------------------------------- */

export default function ChapterShell({
  id,
  number,
  eyebrow,
  title,
  claim,
  children,
  className = "",
}) {
  const titleId = useId();
  const rootRef = useRef(null);
  useMotionScope(
    ({ gsap, select }) => {
      gsap.from(select("[data-chapter-enter]"), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "expo.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 78%",
          once: true,
        },
      });
    },
    [],
    rootRef,
  );

  return (
    <section
      ref={rootRef}
      id={id ? `chapter-${id}` : undefined}
      aria-labelledby={titleId}
      className={`relative scroll-mt-28 ${className}`}
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-3xs font-semibold uppercase tracking-[0.22em] text-ember">
          {number}
        </span>
        <span
          className={`${TYPOGRAPHY.overline} text-xs`}
        >
          {eyebrow}
        </span>
      </div>

      <div data-chapter-enter>
        <h2 id={titleId} className={`${TYPOGRAPHY.display} max-w-3xl`}>
          {title}
        </h2>
        {claim ? (
          <p className={`mt-5 max-w-2xl ${TYPOGRAPHY.body} text-muted-foreground`}>
            {claim}
          </p>
        ) : null}
      </div>

      <div className="mt-10">{children}</div>
    </section>
  );
}