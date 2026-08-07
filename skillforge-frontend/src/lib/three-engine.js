import { useEffect, useMemo, useState } from "react";
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
 *  dim color if the value can't be parsed (SSR / unsupported syntax). */
export function resolveColor(token) {
  const fallback = new THREE.Color(0x8a94a6);
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }
  try {
    const prop = token.startsWith("--") ? token : `--${token}`;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(prop)
      .trim();
    const value = raw || token;
    const ctx = colorCanvasCtx();
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  } catch {
    return fallback;
  }
}

/** On-mount palette resolved from design tokens (cached per store lifetime). */
export function useScenePalette() {
  return useMemo(() => ({
    ember: resolveColor("--ember"),
    aurora: resolveColor("--aurora"),
    dim: resolveColor("--muted-foreground"),
  }), []);
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
  const home = new Float32Array(nodeCount * 3);
  const colors = new Float32Array(nodeCount * 3);
  const base = new THREE.Color();

  for (let i = 0; i < nodeCount; i++) {
    const u = Math.random();
    const r = radius * Math.cbrt(u * 0.72 + 0.28) * (Math.random() > outlierChance ? outlierScale : 1);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;

    home[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    home[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) * flatten[1];
    home[i * 3 + 2] = r * Math.cos(theta) * flatten[2];

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

/** Tracks prefers-reduced-motion with live updates. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

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