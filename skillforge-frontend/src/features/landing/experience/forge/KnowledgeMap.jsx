import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Atom,
  Briefcase,
  Circle,
  Cloud,
  Coffee,
  Database,
  Leaf,
  Network,
  Server,
} from "lucide-react";

import { useTopics } from "@/features/resources/hooks/useTopics";
import { useReducedMotion } from "@/lib/motion-gsap";
import { ROUTES } from "@/constants/routes";
import { cachedSlots } from "./geometry";
import { SECTIONS } from "./registry";

/* -------------------------------------------------------------------------- */
/*  KnowledgeMap — the real topic catalog rendered as a constellation.        */
/*  Nodes come from GET /api/v1/topics (public); if the catalog is            */
/*  unreachable the section falls back to the topics seeded in the database   */
/*  migration (V9), so the map is always the project's own data — never       */
/*  invented. Each node links to the live resource library filtered by        */
/*  topic.                                                                    */
/*                                                                             */
/*  Choreography (all scroll-scrubbed, all direct DOM writes, no state per    */
/*  frame): as the knowledge chapter's window opens, the edges draw in and    */
/*  the nodes emerge one by one — the map builds itself while you scroll.     */
/*  Hovering (or tapping) a node grows it, brightens its connections,         */
/*  nudges its ring neighbours, and shows what it covers in the readout.      */
/* -------------------------------------------------------------------------- */

const TOPIC_ICONS = {
  java: Coffee,
  spring: Leaf,
  "data-structures": Network,
  "system-design": Server,
  react: Atom,
  databases: Database,
  devops: Cloud,
  "interview-prep": Briefcase,
};

const FALLBACK_TOPICS = [
  {
    id: "java",
    name: "Java",
    slug: "java",
    description: "Core Java and advanced concepts",
    icon: "java",
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    slug: "spring-boot",
    description: "Spring framework and REST APIs",
    icon: "spring",
  },
  {
    id: "data-structures",
    name: "Data Structures",
    slug: "data-structures",
    description: "Arrays, Trees, Graphs, and algorithms",
    icon: "data-structures",
  },
  {
    id: "system-design",
    name: "System Design",
    slug: "system-design",
    description: "Scalable system architecture",
    icon: "system-design",
  },
  {
    id: "react",
    name: "React",
    slug: "react",
    description: "React fundamentals and patterns",
    icon: "react",
  },
  {
    id: "databases",
    name: "Databases",
    slug: "databases",
    description: "SQL, NoSQL, and query optimization",
    icon: "databases",
  },
  {
    id: "devops",
    name: "DevOps",
    slug: "devops",
    description: "Docker, CI/CD, and cloud deployment",
    icon: "devops",
  },
  {
    id: "interview-prep",
    name: "Interview Prep",
    slug: "interview-prep",
    description: "Technical interview preparation",
    icon: "interview-prep",
  },
];

const RADIUS = 33;

/* The window in which the map builds itself: the first ~28% of the
   chapter's scroll window (mirrors the fold's marker geometry). */
const BUILD_WINDOW = 0.28;

/** Deterministic radial layout in percentage coordinates. */
function nodePosition(index, count) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + RADIUS * Math.cos(angle),
    y: 50 + RADIUS * Math.sin(angle) * 0.92,
  };
}

/* Scroll-scrubbed build: edges draw, nodes emerge. Ground truth is the
   anchor marker geometry (same source as the fold and the entrances), read
   fresh every apply so re-measures can never drift it. */
function useScrubBuild(anchorId) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    const apply = () => {
      const stage = document.querySelector(".forge-fold");
      if (!stage) return;
      const slotIndex = SECTIONS.findIndex((s) => s.id === anchorId);
      const slot = cachedSlots(stage).slots[slotIndex];
      if (!slot) return;
      const top = slot.top;
      const pageH = slot.height;
      const windowPx = Math.max(200, pageH * BUILD_WINDOW);
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / windowPx));

      const lines = [...document.querySelectorAll(`section[id="${anchorId}"] [data-scrub-draw]`)];
      const offset = (1 - p).toFixed(3);
      lines.forEach((line) => {
        if (line.style.strokeDashoffset !== offset) line.style.strokeDashoffset = offset;
      });

      const nodes = [...document.querySelectorAll(`section[id="${anchorId}"] [data-map-node]`)];
      const count = Math.max(1, nodes.length);
      nodes.forEach((node, i) => {
        const active = p > i / count;
        if (node.style.opacity !== active) node.style.opacity = active ? "1" : "0";
        node.style.transform = active ? "translate3d(0,0,0)" : "translate3d(0,10px,0)";
      });
    };

    apply();
    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply();
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    let frames = 0;
    const poll = () => {
      frames += 1;
      apply();
      if (frames < 30) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, anchorId]);
}

function TopicNode({ topic, index, count, hoveredIndex, onHover }) {
  const Icon = TOPIC_ICONS[topic.icon] ?? Circle;
  const { x, y } = nodePosition(index, count);
  const isHovered = hoveredIndex === index;
  const isNeighbor =
    hoveredIndex >= 0 &&
    (index === (hoveredIndex + 1) % count || index === (hoveredIndex - 1 + count) % count);

  return (
    /* Position wrapper: layout centering lives here (translate classes).
       Hover scale lives on the Link. The scrub owns ONLY the inner
       [data-map-node] (opacity + emerge translate) — one controller per
       element, never mixed. */
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <Link
        to={`${ROUTES.RESOURCES}?topicId=${topic.id}`}
        aria-label={`Explore resources for ${topic.name}`}
        onMouseEnter={() => onHover(topic.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(topic.id)}
        onBlur={() => onHover(null)}
        className={`block rounded-xl border bg-card/85 p-2 text-center shadow-sm backdrop-blur-sm transition-all duration-300 motion-reduce:transition-none ${
          isHovered
            ? "z-10 scale-110 border-ember/60 shadow-md"
            : isNeighbor
              ? "z-10 scale-105 border-ember/30"
              : "border-border hover:z-10 hover:scale-110 hover:border-ember/50 hover:shadow-md focus-visible:scale-110"
        }`}
      >
        {/* The scrub owns this box's opacity/transform per frame — no CSS
            transition on it (a transition would fight the scrub on fast
            scroll). Hover scale lives on the Link above. */}
        <div data-map-node>
          <span
            className={`mx-auto flex size-8 items-center justify-center rounded-lg transition-colors sm:size-9 ${
              isHovered || isNeighbor ? "bg-ember/20 text-ember" : "bg-ember/12 text-ember"
            }`}
          >
            <Icon className="size-4 sm:size-4.5" />
          </span>
          <span className="mt-1 block max-w-[7.5rem] text-xs font-semibold leading-tight">
            {topic.name}
          </span>
          <span className="hidden text-[0.55rem] leading-snug text-muted-foreground sm:block">
            {topic.description}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function KnowledgeMap({ className = "" }) {
  const { data, isLoading } = useTopics();
  const topics = data?.length ? data : FALLBACK_TOPICS;
  const [hoveredId, setHoveredId] = useState(null);
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useScrubBuild("knowledge");

  const hovered = topics.find((t) => t.id === hoveredId) ?? null;
  const hoveredIndex = hoveredId ? topics.findIndex((t) => t.id === hoveredId) : -1;

  return (
    <div ref={rootRef} className={`relative h-full w-full ${className}`}>
      {/* Edge web — center hub to each node, plus the perimeter ring. The
          edges DRAW IN on scroll (pathLength normalises the dash); under
          reduced motion they render fully drawn. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="map-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--ember)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--aurora)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {topics.map((topic, index) => {
          const { x, y } = nodePosition(index, topics.length);
          return (
            <line
              key={`${topic.id}-hub`}
              data-scrub-draw
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={reduced ? 0 : 1}
              stroke="url(#map-edge)"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
              style={{
                strokeOpacity: hoveredIndex >= 0
                  ? (index === hoveredIndex ? 1 : 0.18)
                  : 0.55,
                transition: "stroke-opacity 0.3s",
              }}
            />
          );
        })}
        {topics.map((topic, index) => {
          const a = nodePosition(index, topics.length);
          const b = nodePosition((index + 1) % topics.length, topics.length);
          return (
            <line
              key={`${topic.id}-ring`}
              data-scrub-draw
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={reduced ? 0 : 1}
              stroke="url(#map-edge)"
              strokeWidth="0.25"
              vectorEffect="non-scaling-stroke"
              style={{
                strokeOpacity:
                  hoveredIndex >= 0
                    ? (index === hoveredIndex || (index + 1) % topics.length === hoveredIndex
                        ? 1
                        : 0.18)
                    : 0.55,
                transition: "stroke-opacity 0.3s",
              }}
            />
          );
        })}
      </svg>

      {/* Center hub */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ember/40 bg-card shadow-[0_0_0_6px_color-mix(in_oklch,var(--ember)_12%,transparent)] sm:size-16"
      >
        <span className="text-sm font-bold tracking-tight text-ember">
          {isLoading ? "…" : `${topics.length}`}
        </span>
      </div>

      {topics.map((topic, index) => (
        <TopicNode
          key={topic.id}
          topic={topic}
          index={index}
          count={topics.length}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredId}
        />
      ))}

      {/* Hover readout — the quiet metadata line that answers "what is
          this node?" without a popup. */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-9 items-center justify-center gap-2 text-xs"
      >
        {hovered ? (
          <>
            <span className="size-1.5 rounded-full bg-ember" />
            <span className="font-semibold text-foreground">{hovered.name}</span>
            <span className="hidden text-muted-foreground sm:inline">
              — {hovered.description}
            </span>
            <span className="text-muted-foreground/60">→ explore resources</span>
          </>
        ) : (
          <span className="text-muted-foreground/60">
            Hover a node to see what it covers
          </span>
        )}
      </div>
    </div>
  );
}