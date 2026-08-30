import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ==========================================================================
   SkillForge Three.js Engine — the single reusable 3D building block set.

   All scenes (LivingCoreScene, KnowledgeConstellation, …) compose from here:
   node fields, edge builders, glow textures, dust, and adaptive runtime
   (reduced-motion, tab visibility, DPR, device capability).

   Colors resolve through the CSS tokens (--ember, --aurora, --muted-foreground)
   at runtime via a 1×1 canvas, so light/dark themes drive 3D without any
   hardcoded hex in scenes.
   ========================================================================== */

let colorCanvas = null;

function colorCanvasCtx() {
  if (!colorCanvas) {
    colorCanvas = document.createElement("canvas");
    colorCanvas.width = 1;
    colorCanvas.height = 1;
  }
  return colorCanvas.getContext("2d", { willReadFrequently: true });
}

/** Resolve a CSS token (or any CSS color string) to a THREE.Color via the
 *  browser's own color parser (supports oklch()). Falls back to a neutral
 *  dim color if the value can't be parsed (SSR / unsupported syntax).
 *  `root` lets scoped systems (the landing's Foundry Precision scope on
 *  .landing-shell) resolve their own token values instead of the global
 *  document root — default keeps the app-wide behavior. */
export function resolveColor(token, root) {
  const fallback = new THREE.Color(0x8a94a6);
  const host = root ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (typeof window === "undefined" || !host) {
    return fallback;
  }
  try {
    const prop = token.startsWith("--") ? token : `--${token}`;
    const raw = getComputedStyle(host).getPropertyValue(prop).trim();
    const value = raw || token;
    const ctx = colorCanvasCtx();
    /* Sentinel technique: an invalid value leaves fillStyle untouched, so we
       can distinguish "unparsable" from a legitimately dark color. "#010203"
       is used because it serializes to a form no real token would equal. */
    ctx.fillStyle = "#010203";
    ctx.fillStyle = value;
    if (
      ctx.fillStyle === "rgb(1, 2, 3)" &&
      value !== "#010203" &&
      value !== "rgb(1, 2, 3)"
    ) {
      return fallback;
    }
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  } catch {
    return fallback;
  }
}

function resolveScenePalette(rootRef) {
  const root = rootRef?.current ?? null;
  return {
    ember: resolveColor("--ember", root),
    aurora: resolveColor("--aurora", root),
    dim: resolveColor("--muted-foreground", root),
    board: resolveColor("--cap-board", root),
    fabric: resolveColor("--cap-fabric", root),
    gold: resolveColor("--cap-gold", root),
  };
}

function samePalette(a, b) {
  return ["ember", "aurora", "dim", "board", "fabric", "gold"].every(
    (key) => a[key].getHex() === b[key].getHex(),
  );
}

/**
 * Shared palette hook. On-mount the design tokens resolve synchronously
 * (stable per store lifetime), then once more via rAF — the container ref
 * attaches only after first render, so scoped token systems (the landing's
 * Foundry Precision scope on .landing-shell) apply even for deferred mounts.
 * The same-palette guard skips the re-render when the values match, so
 * app-wide scenes (global root tokens) never re-render on mount.
 *
 * `live` additionally re-resolves whenever the theme class on <html> changes
 * (next-themes toggles `.dark`) or prefers-color-scheme flips — scenes that
 * must re-tint on theme switch (the graduation cap, the constellation) use
 * it; the palette object stays referentially stable, so materials lerp
 * toward the new values in their frame loops instead of rebuilding. All
 * setState calls happen in event callbacks (observer/media) or async (rAF),
 * never synchronously in the effect body.
 */
function useScenePaletteInternal(rootRef, live) {
  const [palette, setPalette] = useState(() => resolveScenePalette(rootRef));

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const probe = () =>
      setPalette((prev) => {
        const resolved = resolveScenePalette(rootRef);
        return samePalette(prev, resolved) ? prev : resolved;
      });
    const raf = requestAnimationFrame(probe);
    if (!live) return () => cancelAnimationFrame(raf);
    const observer = new MutationObserver(probe);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", probe);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", probe);
      cancelAnimationFrame(raf);
    };
  }, [rootRef, live]);

  return palette;
}

export function useScenePalette(rootRef) {
  return useScenePaletteInternal(rootRef, false);
}

export function useScenePaletteLive(rootRef) {
  return useScenePaletteInternal(rootRef, true);
}

/* -------------------------------------------------------------------------- */
/*  WebGL context-loss lifecycle                                             */
/* -------------------------------------------------------------------------- */

/**
 * Attach WebGL context-loss/restore listeners to a renderer canvas. When the
 * browser drops a context (GPU pressure, driver reset, too many live contexts),
 * a Three.js canvas goes permanently dead — there is no built-in handling in
 * R3F 9.6.x. The caller supplies onLost/onRestored so the decorative scene can
 * swap in its fallback (e.g. CapEmblem) or hide itself, and resume rendering
 * when the context is restored (three re-initializes internally on restore).
 * Returns a detach function for unmount cleanup.
 */
export function attachContextLoss(canvas, onLost, onRestored) {
  if (!canvas) return () => {};
  const handleLost = (event) => {
    event.preventDefault();
    onLost();
  };
  const handleRestored = () => onRestored();
  canvas.addEventListener("webglcontextlost", handleLost, false);
  canvas.addEventListener("webglcontextrestored", handleRestored, false);
  return () => {
    canvas.removeEventListener("webglcontextlost", handleLost);
    canvas.removeEventListener("webglcontextrestored", handleRestored);
  };
}

/* -------------------------------------------------------------------------- */
/*  Soft radial glow sprite texture (shared by all scenes)                     */
/* -------------------------------------------------------------------------- */

export function softGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* -------------------------------------------------------------------------- */
/*  Field builders — filled sphere (denser core) with optional flattening      */
/* -------------------------------------------------------------------------- */

/** Build a spherical node field — positions only, so geometry can stay
 *  memoized independently of the palette (theme toggles re-tint without
 *  re-randomizing the field). `flatten` squashes the sphere into an
 *  ellipsoid; `outlierChance`/`outlierScale` scatter a few nodes further out. */
export function buildFieldPositions({
  nodeCount,
  radius,
  flatten = [1, 0.8, 0.72],
  outlierChance = 0.85,
  outlierScale = 1.32,
}) {
  const home = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const u = Math.random();
    const r = radius * Math.cbrt(u * 0.72 + 0.28) * (Math.random() > outlierChance ? outlierScale : 1);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;

    home[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    home[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) * flatten[1];
    home[i * 3 + 2] = r * Math.cos(theta) * flatten[2];
  }
  return home;
}

/** Assign vertex colors to an existing field across a palette (e.g. ember /
 *  aurora / dim) by weight. `weights` are cumulative [0..1] thresholds
 *  choosing which palette color each node gets. Cheap enough to re-run on
 *  palette changes. */
export function colorizeField(home, palette, weights = [0.42, 0.74]) {
  const nodeCount = home.length / 3;
  const colors = new Float32Array(nodeCount * 3);
  const base = new THREE.Color();

  for (let i = 0; i < nodeCount; i++) {
    const t = Math.random();
    let pick = palette[palette.length - 1];
    for (let w = 0; w < weights.length; w += 1) {
      if (t < weights[w]) {
        pick = palette[w];
        break;
      }
    }
    base.copy(pick);
    const bright = 0.5 + Math.random() * 0.5;
    colors[i * 3] = base.r * bright;
    colors[i * 3 + 1] = base.g * bright;
    colors[i * 3 + 2] = base.b * bright;
  }

  return colors;
}

/** Build a spherical node field. Returns home positions + vertex colors
 *  distributed across a palette (e.g. ember / aurora / dim) by weight.
 *  `palette` is an array of THREE.Color; `weights` are cumulative [0..1]
 *  thresholds choosing which palette color each node gets. */
export function buildNodeField({
  nodeCount,
  radius,
  palette,
  weights = [0.42, 0.74],
  flatten = [1, 0.8, 0.72],
  outlierChance = 0.85,
  outlierScale = 1.32,
}) {
  const home = buildFieldPositions({ nodeCount, radius, flatten, outlierChance, outlierScale });
  const colors = colorizeField(home, palette, weights);
  return { home, colors };
}

/** Build a torus mesh with the same count — used for sphere <-> torus morphs. */
export function buildTorus(home, nodeCount, R = 3.3, r = 1.5) {
  const torus = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    torus[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
    torus[i * 3 + 1] = r * Math.sin(v) * 0.9;
    torus[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
  }
  return torus;
}

/* -------------------------------------------------------------------------- */
/*  Edge builders                                                              */
/* -------------------------------------------------------------------------- */

/** Build near-neighbor edges. Returns interleaved edge positions/colors a
 *  line-segments geometry plus a Vector3 edge list for travelling pulses. */
export function buildEdges(home, nodeCount, maxDistance, maxEdges) {
  const positionValues = [];
  const colorValues = [];
  const edgeList = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  for (let i = 0; i < nodeCount; i++) {
    if (positionValues.length / 6 >= maxEdges) break;
    for (let j = i + 1; j < nodeCount; j++) {
      if (positionValues.length / 6 >= maxEdges) break;
      const dx = home[i * 3] - home[j * 3];
      const dy = home[i * 3 + 1] - home[j * 3 + 1];
      const dz = home[i * 3 + 2] - home[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < maxDistance) {
        positionValues.push(
          home[i * 3], home[i * 3 + 1], home[i * 3 + 2],
          home[j * 3], home[j * 3 + 1], home[j * 3 + 2],
        );
        const alpha = 0.08 + Math.random() * 0.1;
        colorValues.push(alpha, alpha, alpha, alpha, alpha, alpha);
        edgeList.push({
          a: a.set(home[i * 3], home[i * 3 + 1], home[i * 3 + 2]).clone(),
          b: b.set(home[j * 3], home[j * 3 + 1], home[j * 3 + 2]).clone(),
        });
      }
    }
  }

  return {
    edgePositions: new Float32Array(positionValues),
    edgeColors: new Float32Array(colorValues),
    edgeList,
  };
}

/** Ambient dust shell orbiting well outside the field. */
export function buildDust(count, { inner = 9, outer = 13.5, flatten = 1 } = {}) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = inner + Math.random() * (outer - inner);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) * flatten;
    positions[i * 3 + 2] = radius * Math.cos(theta) * flatten;
  }
  return positions;
}

/* -------------------------------------------------------------------------- */
/*  Adaptive runtime — reduced motion, tab visibility, device capability       */
/* -------------------------------------------------------------------------- */

/* useReducedMotion lives in motion-gsap.js (the single motion library);
   re-exported here so scene imports keep their path. */
import { useReducedMotion } from "./motion-gsap";
export { useReducedMotion };

/** Tracks document.visibilitychange so the Canvas frameloop can pause. */
export function useTabHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onChange = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return hidden;
}

/** Tracks element visibility in the viewport (120px margin) so Canvas
 *  frameloops pause when scrolled out of view — off-screen scenes never
 *  render (perf budget: 60 FPS where the user is looking, zero elsewhere). */
export function useOffscreen() {
  const ref = useRef(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setOff(!entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, off };
}

/**
 * Near-viewport gate: true only while `ref` is within `rootMargin` of the
 * viewport, false once scrolled away. Used to keep heavy WebGL scenes (the
 * graduation cap) mounted on exactly one section at a time, so the page never
 * holds more than one cap renderer simultaneously. Defaults to false so a
 * section off-screen at load stays unmounted until scrolled near.
 */
export function useNearViewport(ref, rootMargin = "250px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return near;
}

/** Adaptive node count + DPR based on screen size / device capability. */
export function useSceneBudget({ high = 480, low = 240, baseDpr = 1.5 }) {
  const reduced = useReducedMotion();
  return useMemo(() => {
    if (typeof window === "undefined") {
      return { nodeCount: low, dpr: [1, baseDpr], detail: false };
    }
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;

    const reducedNodeCount = Math.round(low * 0.7);
    if (reduced || lowMemory) {
      return { nodeCount: reducedNodeCount, dpr: [1, 1], detail: false };
    }
    if (isSmallScreen || lowPower) {
      return { nodeCount: low, dpr: [1, 1.25], detail: false };
    }
    return { nodeCount: high, dpr: [1, baseDpr], detail: true };
  }, [high, low, baseDpr, reduced]);
}