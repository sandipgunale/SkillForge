import { useEffect, useImperativeHandle, useRef, useState } from "react";

import { useMotionSafe } from "@/lib/motion-gsap";

import CapEmblem from "./CapEmblem";

/* -------------------------------------------------------------------------- */
/*  ForgeSignature — the Knowledge Forge signature motif (P4).                */
/*                                                                           */
/*  A 2D canvas particle system (per T-ENG-3: 2D, not Three) that converges  */
/*  from a scattered fragment field into the graduation cap silhouette —      */
/*  fragmented -> structured -> personalized -> mastered.                     */
/*                                                                           */
/*  API                                                                      */
/*    <ForgeSignature progress={0..1} />  — scrub-driven convergence          */
/*    <ForgeSignature phase="mastered" /> — declarative phase                 */
/*                                                                           */
/*  Contract                                                                */
/*    - Lazy-mounted by consumers; IO-gated loop (pauses off-screen).        */
/*    - device-memory aware particle budget; DPR capped.                     */
/*    - Reduced motion: static silhouette, no loop, no travel.               */
/*    - No canvas context: static CapEmblem fallback (F9: no-WebGL !=        */
/*      reduced-motion).                                                     */
/*    - aria-hidden + role="presentation" (M5-t2): decorative by design.     */
/* -------------------------------------------------------------------------- */

const FRAGMENTED = 0.55;
const STRUCTURED = 0.75;
const PERSONALIZED = 0.9;
const MASTERED = 1;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* Per-window ease: each phase threshold lands on its exact scrub fraction
   (0.55/0.75/0.9/1) instead of a global easeOutCubic compressing the whole
   arc toward the start of the act. */
const windowEase = (from, to, v) =>
  v <= from ? 0 : v >= to ? 1 : easeOutCubic((v - from) / (to - from));

const PHASE_PROGRESS = { fragmented: 0.5, structured: 0.8, personalized: 0.95, mastered: 1 };

function resolveProgress(phase, progress) {
  return phase ? (PHASE_PROGRESS[phase] ?? 1) : progress;
}

function particleBudget() {
  const memory = typeof navigator !== "undefined" ? navigator.deviceMemory : undefined;
  if (memory && memory < 4) return 90;
  return 210;
}

/* The cap silhouette, sampled to a point field. Coordinates are unit-space
   (-1..1); the renderer scales them to the canvas. */
function sampleCapSilhouette(count) {
  const pts = [];
  const boardX = 0.88;
  const boardTop = -0.86;
  const boardBottom = -0.4;
  const slope = 0.08;
  const band = { cx: 0, cy: 0.08, rx: 0.42, ry: 0.34 };
  const button = { cx: 0.06, cy: -0.66, r: 0.1 };

  const edge = Math.max(8, Math.floor(count * 0.22));
  for (let i = 0; i <= edge; i++) {
    const t = i / edge;
    const x = -boardX + 2 * boardX * t;
    pts.push([x, boardTop + slope * t]);
  }
  const side = Math.max(5, Math.floor(count * 0.1));
  for (let i = 1; i <= side; i++) {
    const t = i / side;
    pts.push([boardX, boardTop + (boardBottom - boardTop) * t + slope]);
    pts.push([-boardX, boardTop + (boardBottom - boardTop) * t]);
  }
  const bandPts = Math.max(20, Math.floor(count * 0.4));
  for (let i = 0; i < bandPts; i++) {
    const a = (i / bandPts) * Math.PI * 2;
    pts.push([band.cx + Math.cos(a) * band.rx, band.cy + Math.sin(a) * band.ry]);
  }
  const buttonPts = Math.max(10, Math.floor(count * 0.16));
  for (let i = 0; i < buttonPts; i++) {
    const a = (i / buttonPts) * Math.PI * 2;
    pts.push([button.cx + Math.cos(a) * button.r, button.cy + Math.sin(a) * button.r]);
  }
  return pts.slice(0, count);
}

function makeScatter(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.35 + Math.random() * 0.85;
    out.push([Math.cos(a) * r, Math.sin(a) * r * 0.7]);
  }
  return out;
}

function readAccent(canvas, fallback = "#e8b273") {
  try {
    return getComputedStyle(canvas).getPropertyValue("--lp-accent").trim() || fallback;
  } catch {
    return fallback;
  }
}

export default function ForgeSignature({ ref, progress = 1, phase = null, className = "", style }) {
  const { reduced } = useMotionSafe();
  const canvasRef = useRef(null);
  const [canvasBroken, setCanvasBroken] = useState(false);

  /* Scrub consumers pass progress={0} and drive via the imperative handle
     (setProgress on every scrub tick — no re-renders). Declarative phase API
     adopts props on change. The prop default (1) is the declarative
     converged state; scrub consumers must pass progress={0} explicitly. */
  const progressRef = useRef(phase ? (PHASE_PROGRESS[phase] ?? 1) : 0);
  const lastProps = useRef({ phase, progress });

  /* Scrub driver: consumers call setProgress(p) on every scrub tick without
     re-rendering. Prop changes (declarative phase API) re-adopt on change. */
  useImperativeHandle(
    ref,
    () => ({
      setProgress: (p) => {
        progressRef.current = clamp01(p);
      },
    }),
    [],
  );
  useEffect(() => {
    if (phase !== lastProps.current.phase || progress !== lastProps.current.progress) {
      progressRef.current = resolveProgress(phase, progress);
      lastProps.current = { phase, progress };
    }
  }, [phase, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCanvasBroken(true);
      return undefined;
    }
    setCanvasBroken(false);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const count = reduced ? 0 : particleBudget();
    const targets = reduced ? [] : sampleCapSilhouette(count);
    const scatter = reduced ? [] : makeScatter(count);
    const speeds = reduced ? [] : targets.map((_, i) => 0.4 + ((i * 37) % 10) / 12);
    const accent = reduced ? null : readAccent(canvas);
    const iron = "rgba(170, 176, 190, 0.85)";

    let raf = 0;
    let inView = true;
    const ringSweep = { v: 0 };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(draw);
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (inView && !raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = (now) => {
      raf = 0;
      if (!inView) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const raw = clamp01(progressRef.current);
      const converge = windowEase(FRAGMENTED, STRUCTURED, raw);
      const mastered = windowEase(PERSONALIZED, MASTERED, raw);
      const scale = Math.min(w, h) * 0.42;
      const cx = w / 2;
      const cy = h / 2;

      const n = Math.min(count, targets.length, scatter.length);
      for (let i = 0; i < n; i++) {
        const [tx, ty] = targets[i];
        const [sx, sy] = scatter[i];
        const idle = 1 - converge;
        const drift = Math.sin(now * 0.001 * speeds[i] + i) * 0.22;
        const x = cx + (sx + drift * idle) * scale;
        const y = cy + (sy - drift * 0.4 * idle) * scale;
        const x2 = x + (tx * scale - (x - cx)) * converge;
        const y2 = y + (ty * scale - (y - cy)) * converge;

        const alpha = 0.35 + 0.65 * clamp01(converge);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = converge > 0.55 ? accent : iron;
        const size = (converge > 0.55 ? 1.9 : 1.3) * dpr;
        ctx.fillRect(x2 - size / 2, y2 - size / 2, size, size);
      }

      if (mastered > 0) {
        ringSweep.v = Math.max(ringSweep.v, mastered);
        ctx.globalAlpha = 0.85 * ringSweep.v;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.6 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy + 0.08 * scale, scale * 0.62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringSweep.v);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  /* Reduced motion: static converged silhouette, no loop. */
  const fallback = canvasBroken || reduced;

  return (
    <div
      data-signature
      role="presentation"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      style={style}
    >
      {fallback ? (
        <CapEmblem className="h-full w-full opacity-90" />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  );
}
