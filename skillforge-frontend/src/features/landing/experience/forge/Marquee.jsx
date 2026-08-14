import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  Marquee — SkillForge's one repeated-typography motif.                     */
/*  FOCUS — PRACTICE — BUILD — MASTER — looping forever, ghosted behind the   */
/*  chapters. The loop is a plain GSAP xPercent tween on two identical        */
/*  copies (seamless -50% loop). Scroll influences the tempo: scrolling down   */
/*  accelerates the march, scrolling up slows and briefly reverses it —       */
/*  damped, so it never fights the user. Reduced motion renders one static    */
/*  row. Purely decorative: aria-hidden, pointer-events none.                  */
/* -------------------------------------------------------------------------- */

const MOTIF = ["Focus", "Practice", "Build", "Master"];
const BASE_SPEED = 24; /* seconds per loop at rest */
const BASE_TIMESCALE = 1;
const MAX_TIMESCALE = 3.2;
const MIN_TIMESCALE = -1.4;

export default function Marquee({ className = "" }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const build = async () => {
      const { gsap } = await import("gsap");
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
      tl.to(track, { xPercent: -50, duration: BASE_SPEED }, 0);

      let lastY = window.scrollY;
      let velocity = 0;
      let lastTime = performance.now();
      let raf = 0;

      const tick = (now) => {
        raf = 0;
        const delta = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        const y = window.scrollY;
        velocity += ((y - lastY) / delta - velocity) * Math.min(1, delta * 2.4);
        lastY = y;
        const target = Math.max(
          MIN_TIMESCALE,
          Math.min(MAX_TIMESCALE, BASE_TIMESCALE + velocity * 2.2),
        );
        tl.timeScale(target);
        raf = requestAnimationFrame(tick);
      };

      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
      return () => {
        if (raf) cancelAnimationFrame(raf);
        tl.revert();
      };
    };

    let cleanup = null;
    if (reduced) {
      track.style.transform = "none";
      return undefined;
    }
    build().then((fn) => {
      cleanup = fn;
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      data-marquee="true"
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    >
      <div
        ref={trackRef}
        data-marquee-track="true"
        className="flex w-max items-center whitespace-nowrap"
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {MOTIF.map((word, index) => (
              <span key={`${copy}-${word}`} className="flex items-center">
                <span className="text-[clamp(3rem,9vw,8rem)] font-bold uppercase leading-[0.9] tracking-tight text-foreground/10">
                  {word}
                </span>
                {index < MOTIF.length - 1 && (
                  <span className="mx-[0.4em] text-[clamp(1.5rem,4vw,3.5rem)] font-bold text-ember/50">
                    —
                  </span>
                )}
              </span>
            ))}
            <span className="mx-[0.6em] text-[clamp(1.5rem,4vw,3.5rem)] font-bold text-ember/50">
              —
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}