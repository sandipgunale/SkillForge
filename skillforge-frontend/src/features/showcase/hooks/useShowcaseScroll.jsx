import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/motion-gsap";

/* --------------------------------------------------------------------------
   useShowcaseScroll — owns hash-anchored navigation for the /showcase page.

   - On mount (and after the lazy chunk mounts), if location.hash matches a
     chapter, scrollIntoView the section — browsers do not reliably
     fragment-scroll to not-yet-rendered lazy content.
   - On every hashchange, scrollIntoView the target chapter.
   - Calls ScrollTrigger.refresh() after the mount scroll settles so GSAP
     triggers measure the final layout (lazy chunk + fonts).
   - Reduced-motion: instant jump, no smooth scroll.
   -------------------------------------------------------------------------- */

export default function useShowcaseScroll() {
  const { hash } = useLocation();
  const reduced = useReducedMotion();
  const firstRun = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const id = hash ? hash.replace("#", "") : "";
    if (!id) return undefined;

    const go = () => {
      const target = document.getElementById(`chapter-${id}`);
      if (!target) return;
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    };

    // First pass: the lazy chunk just mounted — retry after a frame + fonts.
    if (firstRun.current) {
      firstRun.current = false;
      const t1 = setTimeout(go, 50);
      const t2 = setTimeout(() => {
        go();
        ScrollTrigger.refresh();
      }, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    go();
    return undefined;
  }, [hash, reduced]);

  // Keep ScrollTrigger positions honest after fonts settle.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(t);
  }, []);

  return null;
}