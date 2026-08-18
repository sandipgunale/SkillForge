import { useMemo, useRef, useState } from "react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  ForgeGraph — the 03 · ENGINE knowledge map. One curated SVG, positions    */
/*  precomputed deterministically (no layout at runtime, no reflow, SSG-safe)  */
/*  — well under the 80-node budget, real topic labels only, copper = in      */
/*  progress, steel = known, "You" at the center. Slow ambient drift under    */
/*  GSAP (static under prefers-reduced-motion), native <title> tooltips.      */
/* -------------------------------------------------------------------------- */

/* Deterministic PRNG so the layout is identical on every render. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CORE_TOPICS = ["React", "TypeScript", "GSAP", "Tailwind", "React Query", "Vite", "Three.js"];

const KNOWN_TOPICS = [
  "JavaScript",
  "Node.js",
  "PostgreSQL",
  "REST",
  "GraphQL",
  "WebSockets",
  "Git",
  "Docker",
  "Linux",
  "Algorithms",
  "Data Structures",
  "Networking",
  "Web Security",
  "Testing",
  "System Design",
  "Observability",
  "Machine Learning",
  "Prompt Engineering",
  "Playwright",
  "CI/CD",
  "Clean Architecture",
  "Microservices",
  "Caching",
  "Concurrency",
  "Performance",
  "Accessibility",
  "AWS",
  "Kafka",
  "gRPC",
  "Redis",
  "Spring Boot",
  "OAuth2",
];

const W = 920;
const H = 560;
const CX = W / 2;
const CY = H / 2;

/* Ring slots around the center for the in-progress cluster, then two outer
   rings for known topics — all precomputed once at module load. */
function buildLayout() {
  const rand = mulberry32(20260817);
  const jitter = (radius) => (rand() - 0.5) * radius * 0.28;

  const nodes = [];
  nodes.push({ id: "you", label: "You", state: "core", x: CX, y: CY, r: 7 });

  CORE_TOPICS.forEach((label, i) => {
    const angle = (i / CORE_TOPICS.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: `core-${i}`,
      label,
      state: "core",
      x: CX + Math.cos(angle) * 96 + jitter(96),
      y: CY + Math.sin(angle) * 96 + jitter(96),
      r: 5,
    });
  });

  KNOWN_TOPICS.forEach((label, i) => {
    const angle = (i / KNOWN_TOPICS.length) * Math.PI * 2 - Math.PI / 2;
    const ring = i % 3 === 0 ? 178 : 232;
    nodes.push({
      id: `known-${i}`,
      label,
      state: "known",
      x: CX + Math.cos(angle) * ring + jitter(ring),
      y: CY + Math.sin(angle) * ring + jitter(ring),
      r: 3.6,
    });
  });

  return nodes;
}

/* Hand-authored relevance edges: each core topic links to the known topics it
   actually builds on, plus a few cross-links. ~40 edges, all precomputed. */
const EDGES = [
  ["core-0", "known-0"], ["core-0", "known-1"], ["core-0", "known-4"], ["core-0", "known-2"],
  ["core-1", "known-0"], ["core-1", "known-2"], ["core-1", "known-3"], ["core-1", "known-6"],
  ["core-2", "known-0"], ["core-2", "known-19"], ["core-2", "known-22"],
  ["core-3", "known-0"], ["core-3", "known-22"], ["core-3", "known-1"],
  ["core-4", "known-0"], ["core-4", "known-1"], ["core-4", "known-4"],
  ["core-5", "known-0"], ["core-5", "known-4"], ["core-5", "known-17"],
  ["core-6", "known-0"], ["core-6", "known-24"], ["core-6", "known-14"],
  ["you", "core-0"], ["you", "core-1"], ["you", "core-2"], ["you", "core-3"],
  ["you", "core-4"], ["you", "core-5"], ["you", "core-6"],
  ["known-1", "known-3"], ["known-2", "known-28"], ["known-4", "known-28"],
  ["known-5", "known-26"], ["known-6", "known-5"], ["known-7", "known-26"],
  ["known-8", "known-27"], ["known-10", "known-27"], ["known-13", "known-14"],
  ["known-18", "known-20"], ["known-21", "known-29"],
];

export default function ForgeGraph() {
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  const { nodes, edges } = useMemo(() => {
    const layout = buildLayout();
    const byId = new Map(layout.map((n) => [n.id, n]));
    const edgeLines = EDGES.flatMap(([a, b]) => {
      const na = byId.get(a);
      const nb = byId.get(b);
      if (!na || !nb) return [];
      return [{ x1: na.x, y1: na.y, x2: nb.x, y2: nb.y, core: na.state === "core" || nb.state === "core" }];
    });
    return { nodes: layout, edges: edgeLines };
  }, []);

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: "top 80%", once: true },
        defaults: { ease: "power2.out" },
      });
      tl.fromTo(
        select("[data-edge]"),
        { opacity: 0 },
        { opacity: 1, duration: 0.8, stagger: 0.008 },
        0,
      ).fromTo(
        select("[data-node]"),
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, stagger: 0.012 },
        0.2,
      );
      return undefined;
    },
    [reduced],
    rootRef,
  );

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;
      const body = select("[data-graph-body]");
      if (!body.length) return undefined;
      gsap.to(body, {
        x: 10,
        rotation: 0.6,
        duration: 16,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        /* Pause the ticker while the graph is off-screen */
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause",
        },
      });
      return undefined;
    },
    [reduced],
    rootRef,
  );

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A knowledge graph of topics you are learning: React, TypeScript, GSAP, Tailwind, and more around a central You node"
      className="h-auto w-full"
    >
      <g data-graph-body style={{ transformOrigin: `${CX}px ${CY}px` }}>
        {edges.map((e, i) => (
          <line
            key={`e-${i}`}
            data-edge
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.core ? "var(--lp-accent)" : "var(--lp-border-strong)"}
            strokeOpacity={e.core ? 0.28 : 0.55}
            strokeWidth="1"
          />
        ))}
        {nodes.map((n) => (
          <g
            key={n.id}
            data-node
            data-state={n.state}
            className={activeId === n.id ? "forge-node is-active" : "forge-node"}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            onMouseEnter={() => setActiveId(n.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            {n.state === "core" ? (
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r + 5}
                fill="var(--lp-accent)"
                opacity="0.14"
              />
            ) : null}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={
                n.state === "core"
                  ? "var(--lp-accent)"
                  : n.state === "you"
                    ? "var(--lp-accent-strong)"
                    : "var(--lp-secondary)"
              }
            />
            <text
              x={n.x + n.r + 7}
              y={n.y + 3}
              className="font-lp-mono"
              fontSize="10"
              letterSpacing="0.04em"
              fill={n.state === "core" || n.state === "you" ? "var(--lp-accent)" : "var(--lp-muted)"}
            >
              {n.label}
              <title>{n.label}</title>
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}