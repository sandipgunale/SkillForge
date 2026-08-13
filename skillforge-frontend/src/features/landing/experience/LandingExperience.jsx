import { lazy, Suspense, useCallback, useRef } from "react";

import HeroLayer from "./hero/HeroLayer";
import BookLayer from "./book/BookLayer";
import StaticBook from "./StaticBook";
import useDeferredScene from "./useDeferredScene";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

import "./book.css";

/* -------------------------------------------------------------------------- */
/*  LandingExperience — the landing page as a scroll-driven 3D book.          */
/*                                                                           */
/*  One fixed stage holds three layers: the atmospheric graduation cap       */
/*  (background), the hero, and the book. Native scroll over eleven 100vh    */
/*  slots drives ONE GSAP master timeline (scrubbed, fully reversible):      */
/*    [0.00–0.08] hero exits, the book rises, the cap recedes but stays      */
/*    [0.08–0.94] sixteen single pages flip — rotateY around the fixed       */
/*                right-hand spine, depth z, hinge shadow peaking at 90°     */
/*    [0.94–1.00] the book fades as the footer takes over                    */
/*  Each page's front face is visible for exactly one segment and swapped    */
/*  at the 90° apex, so exactly one page is ever readable or tabbable.       */
/*  No per-frame React state; refs only. Under prefers-reduced-motion the    */
/*  fixed stage never mounts — StaticBook renders the same content as a      */
/*  normal readable layout.                                                  */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("./cap/GraduationCapScene"));

const HERO_SEG = 0.08;
const BOOK_END = 0.94;
const FLIP_DEPTH = 380;
const SETTLED_DEPTH = 0.5;

const SLOTS = [
  {},
  {},
  { id: "what-is" },
  { id: "how-it-works" },
  {},
  { id: "architecture" },
  {},
  {},
  { id: "experience" },
  { id: "faq" },
  {},
];

export default function LandingExperience() {
  const reduced = useReducedMotion();
  const sceneReady = useDeferredScene();

  const stageRef = useRef(null);
  const heroLayerRef = useRef(null);
  const bookLayerRef = useRef(null);
  const capWrapRef = useRef(null);
  const slotsRef = useRef(null);
  const bookLeaves = useRef({ rotations: [], stacks: [], shadows: [], fronts: [] });

  const bindLeaves = useCallback((leaves) => {
    bookLeaves.current = leaves;
  }, []);

  useMotionScope(
    ({ gsap }) => {
      const { rotations, stacks, shadows, fronts } = bookLeaves.current;
      if (!rotations.length || !slotsRef.current) return;

      const wrap = capWrapRef.current;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: slotsRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      /* --- Hero exit, book rise, cap recedes into the backdrop ---------- */
      tl.to(heroLayerRef.current, { opacity: 0, y: -48, scale: 1.02, duration: 0.07, ease: "power1.in" }, 0)
        .set(heroLayerRef.current, { visibility: "hidden" }, 0.071)
        .set(bookLayerRef.current, { visibility: "visible" }, 0.012)
        .fromTo(
          bookLayerRef.current,
          { opacity: 0, y: 90, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.07, ease: "power1.out" },
          0.012,
        )
        .fromTo(
          wrap,
          { opacity: 1, scale: 1 },
          { opacity: 0.45, scale: 0.85, duration: 0.16, ease: "none" },
          0,
        );

      /* --- Leaves: flip around the right-hand spine, depth, hinge shadow */
      const seg = (BOOK_END - HERO_SEG) / rotations.length;

      rotations.forEach((rot, index) => {
        const start = HERO_SEG + index * seg;
        tl.fromTo(rot, { rotateY: 0 }, { rotateY: 180, duration: seg }, start);
        tl.fromTo(
          stacks[index],
          { z: 2 + (rotations.length - 1 - index) * 1.5 },
          { z: FLIP_DEPTH, duration: seg * 0.06 },
          start,
        );
        tl.to(stacks[index], { z: SETTLED_DEPTH, duration: seg * 0.06 }, start + seg * 0.94);
        tl.fromTo(shadows[index], { opacity: 0 }, { opacity: 0.5, duration: seg * 0.5 }, start);
        tl.to(shadows[index], { opacity: 0, duration: seg * 0.5 }, start + seg * 0.5);
      });

      /* Interactive faces: page 1 is visible from the start; every other
         front swaps in at its leaf's 90° apex and out at the next one, so
         exactly one page is readable (and tabbable) at any moment. */
      tl.set(fronts[0], { visibility: "hidden" }, HERO_SEG + seg * 0.5);
      for (let index = 1; index < fronts.length; index += 1) {
        tl.set(fronts[index], { visibility: "visible" }, HERO_SEG + (index - 1) * seg + seg * 0.5);
        tl.set(fronts[index], { visibility: "hidden" }, HERO_SEG + index * seg + seg * 0.5);
      }

      /* --- Footer takeover ------------------------------------------------ */
      tl.to(bookLayerRef.current, { opacity: 0, duration: 0.005 }, 0.995)
        .set(bookLayerRef.current, { visibility: "hidden" }, 1)
        .set(stageRef.current, { pointerEvents: "none" }, 0.996);
    },
    [reduced, sceneReady],
    stageRef,
  );

  if (reduced) {
    return <StaticBook />;
  }

  return (
    <>
      <div ref={stageRef} className="experience-stage fixed inset-0 z-0">
        {/* The giant atmospheric cap — first in the stage DOM so it sits
            behind the hero and the book; pointer-events-none so it never
            blocks content. It recedes on scroll but never fully hides. */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[4vh]">
          <div
            ref={capWrapRef}
            data-cap-wrap
            className="aspect-square w-[120vw] sm:w-[min(110vw,115vh)] lg:w-[min(92vw,100vh)]"
          >
            {sceneReady && (
              <Suspense fallback={null}>
                <GraduationCapScene className="h-full w-full" />
              </Suspense>
            )}
          </div>
        </div>

        <div ref={heroLayerRef} className="absolute inset-0">
          <HeroLayer />
        </div>

        <div
          ref={bookLayerRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <BookLayer bindLeaves={bindLeaves} />
        </div>
      </div>

      {/* Scroll height — one 100vh slot per stage beat; anchors land on the
          slot whose page reveals the linked chapter */}
      <div ref={slotsRef} aria-hidden="true">
        {SLOTS.map((slot, index) => (
          <section key={index} id={slot.id} className="h-screen pointer-events-none" />
        ))}
      </div>
    </>
  );
}
