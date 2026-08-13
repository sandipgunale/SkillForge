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
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      const hovered = e.target.closest(HOT_TARGETS);
      scale.target = hovered ? 2.1 : 1;
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.22;
      ringPos.y += (pos.y - ringPos.y) * 0.22;
      scale.value += (scale.target - scale.value) * 0.22;
      ring.style.transform = `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0) scale(${scale.value})`;
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
        className="pointer-events-none fixed left-0 top-0 z-[90] size-1.5 rounded-full bg-ember"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      <div
        ref={ringRef}
        data-cursor-ring
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] size-9 rounded-full border border-ember/60"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}