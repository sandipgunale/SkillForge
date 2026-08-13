import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

import HeroLayer from "./hero/HeroLayer";
import BookLayer from "./book/BookLayer";
import StaticBook from "./StaticBook";
import useDeferredScene from "./useDeferredScene";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

import "./book.css";

/* -------------------------------------------------------------------------- */
/*  LandingExperience — the landing page as a scroll-driven 3D book.          */
/*                                                                           */
/*  One fixed stage holds three layers: the hero, the book, and the floating  */
/*  graduation cap. Native scroll over eleven 100vh slots drives ONE GSAP     */
/*  master timeline (scrubbed, fully reversible):                             */
/*    [0.00–0.08] hero exits, the book rises, the cap flies into the cover    */
/*    [0.08–0.94] eight leaves flip — rotateY around the spine, depth z,      */
/*                hinge shadow peaking at 90° (sin(progress·π))               */
/*    [0.94–1.00] the cap returns above the final CTA, the book fades as the  */
/*                footer takes over                                            */
/*  No per-frame React state; refs only. Under prefers-reduced-motion the     */
/*  fixed stage never mounts — StaticBook renders the same content as a       */
/*  normal readable layout.                                                   */
/* -------------------------------------------------------------------------- */

const GraduationCapScene = lazy(() => import("./cap/GraduationCapScene"));

const HERO_SEG = 0.08;
const BOOK_END = 0.94;
const FLIP_DEPTH = 380;
const SETTLED_DEPTH = 1;

const SLOTS = [
  {},
  {},
  { id: "what-is" },
  { id: "how-it-works" },
  {},
  { id: "metrics" },
  { id: "architecture" },
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
  const bookLeaves = useRef({ rotations: [], stacks: [], shadows: [], fronts: [], backs: [] });

  const bindLeaves = useCallback((leaves) => {
    bookLeaves.current = leaves;
  }, []);

  /* Park the cap over the hero anchor once the scene is ready. GSAP owns the
     transform so the master timeline can animate away from this position —
     a raw CSS transform would fight the flight tween's x/y. */
  useEffect(() => {
    if (!sceneReady) return;
    const wrap = capWrapRef.current;
    const anchor = stageRef.current?.querySelector('[data-cap-anchor="hero"]');
    if (!wrap || !anchor) return;
    const w = wrap.getBoundingClientRect();
    const r = anchor.getBoundingClientRect();
    gsap.set(wrap, {
      x: r.left + r.width / 2 - w.left - w.width / 2,
      y: r.top + r.height / 2 - w.top - w.height / 2,
      scale: 1,
      opacity: 1,
      visibility: "visible",
    });
  }, [sceneReady]);

  useMotionScope(
    ({ gsap }) => {
      const { rotations, stacks, shadows, fronts, backs } = bookLeaves.current;
      if (!rotations.length || !slotsRef.current) return;

      const wrap = capWrapRef.current;

      /* Anchor center in stage coordinates (the wrap's layout origin is the
         stage's top-left corner, so GSAP x/y place its center at the anchor
         minus half its own size). */
      const anchorTo = (name) => {
        const anchor = stageRef.current?.querySelector(`[data-cap-anchor="${name}"]`);
        if (!anchor) return { x: 0, y: 0 };
        const r = anchor.getBoundingClientRect();
        const half = { x: (wrap?.offsetWidth ?? 0) / 2, y: (wrap?.offsetHeight ?? 0) / 2 };
        return {
          x: r.left + r.width / 2 - half.x,
          y: r.top + r.height / 2 - half.y,
        };
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: slotsRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      /* --- Hero exit, book rise, cap flies into the cover emblem --------- */
      tl.to(heroLayerRef.current, { opacity: 0, y: -48, scale: 1.02, duration: 0.07, ease: "power1.in" }, 0)
        .set(heroLayerRef.current, { visibility: "hidden" }, 0.071)
        .set(bookLayerRef.current, { visibility: "visible" }, 0.012)
        .fromTo(
          bookLayerRef.current,
          { opacity: 0, y: 90, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.07, ease: "power1.out" },
          0.012,
        )
        .to(
          wrap,
          {
            x: () => anchorTo("cover").x,
            y: () => anchorTo("cover").y,
            scale: 0.36,
            opacity: 0,
            duration: HERO_SEG,
            ease: "power1.in",
          },
          0,
        )
        .set(wrap, { visibility: "hidden" }, HERO_SEG + 0.001);

      /* --- Leaves: flip around the spine, depth, hinge shadow ------------ */
      const seg = (BOOK_END - HERO_SEG) / rotations.length;

      rotations.forEach((rot, index) => {
        const start = HERO_SEG + index * seg;
        tl.fromTo(
          rot,
          { rotateY: 0 },
          { rotateY: -180, transformOrigin: "left center", duration: seg },
          start,
        );
        tl.fromTo(
          stacks[index],
          { z: 4 + index * 2 },
          { z: FLIP_DEPTH, duration: seg * 0.06 },
          start,
        );
        tl.to(stacks[index], { z: SETTLED_DEPTH, duration: seg * 0.06 }, start + seg * 0.94);
        tl.fromTo(shadows[index], { opacity: 0 }, { opacity: 0.55, duration: seg * 0.5 }, start);
        tl.to(shadows[index], { opacity: 0, duration: seg * 0.5 }, start + seg * 0.5);
      });

      /* Interactive faces: the title CTAs hide once flipped; the map, FAQ,
         and final-CTA pages are unreachable until their leaf reveals them. */
      tl.set(fronts[0], { visibility: "hidden" }, HERO_SEG + seg * 0.98);
      [5, 6, 7].forEach((index) => {
        tl.set(backs[index], { visibility: "hidden" }, 0);
        tl.set(backs[index], { visibility: "visible" }, HERO_SEG + (index + 1) * seg * 0.98);
      });

      /* --- Cap returns for the final CTA --------------------------------- */
      tl.set(wrap, { visibility: "visible" }, BOOK_END)
        .to(
          wrap,
          {
            x: () => anchorTo("cta").x,
            y: () => anchorTo("cta").y,
            scale: 1,
            opacity: 1,
            duration: 0.06,
            ease: "power1.out",
          },
          BOOK_END,
        );

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

        <div
          ref={capWrapRef}
          className="absolute left-0 top-0"
          style={{
            width: "min(340px, 56vw)",
            aspectRatio: "1",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          {sceneReady && (
            <Suspense fallback={null}>
              <GraduationCapScene className="h-full w-full" />
            </Suspense>
          )}
        </div>
      </div>

      {/* Scroll height — one 100vh slot per stage beat; anchors land on the
          slot whose leaf reveals the linked chapter */}
      <div ref={slotsRef} aria-hidden="true">
        {SLOTS.map((slot, index) => (
          <section key={index} id={slot.id} className="h-screen pointer-events-none" />
        ))}
      </div>
    </>
  );
}
