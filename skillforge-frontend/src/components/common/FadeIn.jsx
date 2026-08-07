import { useRef } from "react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  FadeIn — wraps children in a GSAP entrance reveal on mount. Used for       */
/*  staged section entrances. Reduced-motion renders content immediately.      */
/* -------------------------------------------------------------------------- */

export default function FadeIn({ children, delay = 0, className }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap }) => {
      if (reduced) return;
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    },
    [reduced, delay],
    rootRef,
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}