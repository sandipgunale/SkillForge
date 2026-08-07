import { useRef } from "react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

export default function PageHeader({ eyebrow, title, description, action }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap }) => {
      if (reduced) return;
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    },
    [reduced],
    rootRef,
  );

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        )}

        <h1 className="display text-display font-bold tracking-display">
          {title}
        </h1>

        {description && (
          <p className="mt-2.5 text-base text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0 md:pb-1">{action}</div>
      )}
    </div>
  );
}