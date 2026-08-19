import { useEffect, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SECTION_MOTION, useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/*  Landing section motion hooks — one entrance choreography, one scrub       */
/*  primitive, one in-view deferral. All respect prefers-reduced-motion and   */
/*  run inside gsap.context scopes (reverted on unmount). Native-flow only:   */
/*  sections are ordinary document blocks — no fold geometry involved.        */
/* -------------------------------------------------------------------------- */

/**
 * Section entrance — plays one short choreography when the section crosses
 * ~78% of the viewport (once). Selectors: [data-entrance='label'|'head'|
 * 'lead'|'content'|'aside']. Deterministic from-states, once-only, disabled
 * under prefers-reduced-motion.
 *
 * `identity` declares the section's SECTION_MOTION identity (M3): when the
 * registry entry has a `build` function it runs that choreography (claim/
 * mask, trust/blur, machine/wipe, proof/quote); otherwise the fallback
 * variant system (rise/clip/activate) applies. Sections must declare their
 * identity — never inline tweens (anti-slop rule).
 */
export function useSectionEntrance(rootRef, { identity, variant = "rise" } = {}) {
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      const label = select("[data-entrance='label']");
      const head = select("[data-entrance='head']");
      const lead = select("[data-entrance='lead']");
      const content = select("[data-entrance='content']");
      const aside = select("[data-entrance='aside']");
      const units =
        variant === "activate"
          ? [...select("[data-entrance='content'] > *"), ...select("[data-entrance='aside'] > *")]
          : [];
      if (!head.length && !label.length) return undefined;

      const reset = (els) =>
        els.forEach((el) => {
          el.style.opacity = "";
          el.style.visibility = "";
          el.style.transform = "";
          el.style.clipPath = "";
          el.style.filter = "";
        });
      if (reduced) {
        reset([...label, ...head, ...lead, ...content, ...aside, ...units]);
        return undefined;
      }

      const entry = identity ? SECTION_MOTION[identity] : null;
      if (entry?.build) {
        /* Builder identity (M3): reset every slot first so the builder owns
           exactly the properties it animates (no stale inline values), then
           let the registry choreograph the section. */
        reset([...label, ...head, ...lead, ...content, ...aside, ...units]);
        return entry.build({ gsap, select, reset, root: rootRef.current });
      }

      /* ScrollTrigger defers a timeline's from-states until the trigger
         fires, which would snap every element visible → hidden and
         re-animate it at the trigger point (a flash on every entrance).
         Pre-render the from-states with direct style writes (matching the
         tween start values below) so sections are simply hidden until
         their entrance plays them in. Direct writes, not gsap.set: the
         timeline's fromTo tweens kill any pre-existing gsap.set tween on
         the same properties, and a context revert would strip them anyway.
         No clearProps on the tweens — it would clear these writes at
         creation; the entrance ends at the elements' natural values. */
      const preHide = (els, styles) =>
        els.forEach((el) => {
          Object.entries(styles).forEach(([prop, value]) => {
            el.style[prop] = value;
          });
        });
      const headStyles =
        variant === "clip"
          ? { opacity: "0", visibility: "hidden", transform: "translateY(44px)", clipPath: "inset(100% 0% 0% 0%)" }
          : { opacity: "0", visibility: "hidden", transform: "translateY(40px)" };
      preHide(label, { opacity: "0", visibility: "hidden", transform: "translateY(16px)" });
      preHide(head, headStyles);
      preHide(lead, { opacity: "0", visibility: "hidden", transform: "translateY(24px)" });
      if (units.length) preHide(units, { opacity: "0", visibility: "hidden", transform: "translateY(26px)" });
      else preHide(content, { opacity: "0", visibility: "hidden", transform: "translateY(28px)" });
      preHide(aside, { opacity: "0", visibility: "hidden", transform: "translateY(30px)" });

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
      });

      if (label.length) {
        tl.fromTo(label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.05);
      }
      if (head.length) {
        const headVars =
          variant === "clip"
            ? { autoAlpha: 0, y: 44, clipPath: "inset(100% 0% 0% 0%)" }
            : { autoAlpha: 0, y: 40 };
        const headTo =
          variant === "clip"
            ? { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 }
            : { autoAlpha: 1, y: 0, duration: 0.8 };
        tl.fromTo(head, headVars, headTo, 0);
      }
      if (lead.length) {
        tl.fromTo(lead, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.12);
      }
      if (variant === "activate") {
        if (units.length) {
          tl.fromTo(units, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.13 }, 0.2);
        }
      } else if (content.length) {
        tl.fromTo(content, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.18);
      }
      if (aside.length) {
        tl.fromTo(aside, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.18);
      }
    },
    [reduced, identity, variant],
    rootRef,
  );

  return rootRef;
}

/**
 * Scrub reveal — elements with [data-scrub-step] light in sequence as the
 * section scrolls through (reversible, fast-scroll safe). Optionally a
 * [data-scrub-rail] > span progress line and [data-scrub-num] counters
 * (data-to, data-pad, data-suffix). Direct style writes only — no React
 * state per frame.
 */
export function useScrubReveal(sectionRef) {
  const reduced = useReducedMotion();

  /* Layout effect: the reduced-motion final state (and the GSAP from-states)
     apply before first paint — no flash of the dimmed markup state. */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const steps = [...section.querySelectorAll("[data-scrub-step]")];
    const rail = section.querySelector("[data-scrub-rail] > span");
    const nums = [...section.querySelectorAll("[data-scrub-num]")];
    if (!steps.length && !nums.length && !rail) return undefined;

    const setCounter = (el, ratio) => {
      const to = Number(el.dataset.to || 0);
      const value = Number.isFinite(to) ? Math.round(to * ratio) : to;
      const base = el.dataset.pad
        ? String(value).padStart(Number(el.dataset.pad), "0")
        : String(value);
      const text = base + (el.dataset.suffix || "");
      if (el.textContent !== text) el.textContent = text;
    };

    if (reduced) {
      steps.forEach((step) => {
        step.style.opacity = "1";
        step.style.transform = "translate3d(0,0,0)";
      });
      nums.forEach((el) => setCounter(el, 1));
      if (rail) rail.style.transform = "scaleX(1)";
      return undefined;
    }

    const ctx = gsap.context(() => {
      const apply = (self) => {
        const p = self.progress;
        steps.forEach((step, i) => {
          const active = p > i / steps.length;
          const nextOpacity = active ? "1" : "0.3";
          if (step.style.opacity !== nextOpacity) step.style.opacity = nextOpacity;
          const nextTransform = active ? "translate3d(0,0,0)" : "translate3d(-12px,0,0)";
          if (step.style.transform !== nextTransform) step.style.transform = nextTransform;
        });
        nums.forEach((el) => setCounter(el, p));
        if (rail) rail.style.transform = `scaleX(${p.toFixed(3)})`;
      };
      ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom 55%",
        scrub: 0.4,
        onUpdate: apply,
      });
    }, section);

    return () => ctx.revert();
  }, [reduced, sectionRef]);
}

/**
 * useContentResizeSync — runtime content that changes the page height (an
 * open FAQ <details>) invalidates both GSAP ScrollTrigger positions and the
 * shared section-top cache. Sections dispatch "lp:contentchange"; this hook
 * re-syncs ScrollTrigger while LandingNavbar/ScrollProgress re-measure on
 * the same event. One rAF-debounced refresh per burst.
 */
export function useContentResizeSync() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let raf = 0;
    const onContentChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("lp:contentchange", onContentChange);
    return () => {
      window.removeEventListener("lp:contentchange", onContentChange);
      cancelAnimationFrame(raf);
    };
  }, []);
}

/**
 * useInView — one-shot IntersectionObserver (rootMargin −200px) for
 * deferring heavy children until the section nears the viewport.
 */
export function useInView(ref, margin = "-200px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      const t = setTimeout(() => setNear(true), 0);
      return () => clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return near;
}