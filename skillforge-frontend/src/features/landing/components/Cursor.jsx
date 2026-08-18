import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Cursor — restrained custom cursor for the landing (desktop only).          */
/*  A small ember dot follows the pointer instantly; a trailing ring eases    */
/*  behind it and swells over interactive elements. The native cursor is      */
/*  hidden via `.sf-cursor-none` while mounted, so the pair replaces it       */
/*  without ever intercepting input (both layers are pointer-events: none).   */
/*  Gated on fine pointer + wide viewport + no reduced-motion, matching the   */
/*  brief's desktop-only premium feel. Runs entirely on direct DOM writes     */
/*  (no per-frame React state).                                                */
/* -------------------------------------------------------------------------- */

const HOT_TARGETS =
  "a, button, [role='button'], [role='menuitem'], input, textarea, [data-cursor]";

function canMount() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  return true;
}

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [visible] = useState(() => canMount());

  useEffect(() => {
    if (!visible) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const scale = { value: 1, target: 1 };
    let raf = 0;
    let lastX = -100;
    let lastY = -100;
    let lastScale = 1;
    let settleFrames = 0;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      const target = e.target instanceof Element ? e.target : null;
      const hovered = target?.closest(HOT_TARGETS);
      scale.target = hovered ? 2.1 : 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.22;
      ringPos.y += (pos.y - ringPos.y) * 0.22;
      scale.value += (scale.target - scale.value) * 0.22;
      /* Dirty-guard: skip the style write when nothing moved (the ring has
         settled) — no wasted style churn on a static page. After a few
         clean frames the loop stops entirely and re-arms on the next
         pointer move, so a static page costs zero idle frames. */
      if (
        Math.abs(ringPos.x - lastX) > 0.05 ||
        Math.abs(ringPos.y - lastY) > 0.05 ||
        Math.abs(scale.value - lastScale) > 0.005
      ) {
        settleFrames = 0;
        lastX = ringPos.x;
        lastY = ringPos.y;
        lastScale = scale.value;
        ring.style.transform = `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0) scale(${scale.value})`;
      } else if (settleFrames++ < 3) {
        /* keep easing through the tail of the damped spring */
      } else {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    document.documentElement.classList.add("sf-cursor-none");
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("sf-cursor-none");
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={dotRef}
        data-cursor-dot
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-90 size-1.5 rounded-full bg-ember"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      <div
        ref={ringRef}
        data-cursor-ring
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-90 size-9 rounded-full border border-ember/60"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
