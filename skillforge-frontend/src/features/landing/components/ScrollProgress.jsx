import { useEffect, useRef } from "react";

import {
  measureSectionTops,
  probeUntilSectionsReady,
  resolveActiveSection,
  SECTIONS,
  subscribeFontsReady,
} from "../experience/registry";

/* -------------------------------------------------------------------------- */
/*  ScrollProgress — minimal editorial progress chrome (right edge), native   */
/*  flow. Section tops measured once per resize/font-ready/content-change;    */
/*  one rAF-queued scroll listener writes straight to the DOM — no React      */
/*  state per frame. Purely decorative: pointer-events none, aria-hidden.     */
/* -------------------------------------------------------------------------- */

const SECTION_COUNT = SECTIONS.length;
const MIN_SCALE = 0.001;

export default function ScrollProgress() {
  const numRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let tops = null;
    let max = 0;
    const ids = SECTIONS.map(({ id }) => id);

    const measure = () => {
      tops = measureSectionTops(ids);
      max = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      raf = 0;
      if (!tops) measure();
      const y = window.scrollY;
      let current = 0;
      const activeId = resolveActiveSection(tops, ids, y);
      if (activeId) current = ids.indexOf(activeId);
      if (numRef.current) {
        const text = String(current + 1).padStart(2, "0");
        if (numRef.current.textContent !== text) numRef.current.textContent = text;
      }
      if (barRef.current) {
        const scale = `scaleY(${Math.max(MIN_SCALE, max > 0 ? Math.min(1, y / max) : 0)})`;
        if (barRef.current.style.transform !== scale) barRef.current.style.transform = scale;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      tops = null;
      onScroll();
    };
    const onContentChange = () => {
      tops = null;
      onScroll();
    };

    const stopProbe = probeUntilSectionsReady(onContentChange);
    const stopFonts = subscribeFontsReady(onContentChange);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("lp:contentchange", onContentChange);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("lp:contentchange", onContentChange);
      if (raf) cancelAnimationFrame(raf);
      stopProbe();
      stopFonts();
    };
  }, []);

  return (
    <div
      data-scroll-progress
      data-motion="shell"
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 right-5 z-40 hidden select-none flex-col items-end gap-2 md:flex"
    >
      <span className="font-lp-mono text-[0.625rem] uppercase tracking-[0.18em] text-lp-faint">
        <span ref={numRef}>01</span> / {String(SECTION_COUNT).padStart(2, "0")}
      </span>
      <span className="h-16 w-px overflow-hidden bg-lp-border-strong">
        <span
          ref={barRef}
          className="block h-full w-full origin-top bg-lp-accent"
          style={{ transform: `scaleY(${MIN_SCALE})` }}
        />
      </span>
    </div>
  );
}