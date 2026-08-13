import { Link } from "react-router-dom";
import { Atom, Briefcase, Circle, Cloud, Coffee, Database, Leaf, Network, Server } from "lucide-react";

import { useTopics } from "@/features/resources/hooks/useTopics";
import { ROUTES } from "@/constants/routes";

/* -------------------------------------------------------------------------- */
/*  KnowledgeMap — the real topic catalog rendered as a constellation.        */
/*  Nodes come from GET /api/v1/topics (public); if the catalog is            */
/*  unreachable the section falls back to the topics seeded in the database   */
/*  migration (V9), so the map is always the project's own data — never       */
/*  invented. Each node links to the live resource library filtered by        */
/*  topic.                                                                    */
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

/** Deterministic radial layout in percentage coordinates. */
function nodePosition(index, count) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + RADIUS * Math.cos(angle),
    y: 50 + RADIUS * Math.sin(angle) * 0.92,
  };
}

function TopicNode({ topic, index, count }) {
  const Icon = TOPIC_ICONS[topic.icon] ?? Circle;
  const { x, y } = nodePosition(index, count);

  return (
    <Link
      to={`${ROUTES.RESOURCES}?topicId=${topic.id}`}
      aria-label={`Explore resources for ${topic.name}`}
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card/85 p-2 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:z-10 hover:scale-110 hover:border-ember/50 hover:shadow-md focus-visible:scale-110"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember transition-colors group-hover:bg-ember/20 sm:size-9">
        <Icon className="size-4 sm:size-4.5" />
      </span>
      <span className="mt-1 block max-w-[7.5rem] text-xs font-semibold leading-tight">
        {topic.name}
      </span>
      <span className="hidden text-[0.55rem] leading-snug text-muted-foreground sm:block">
        {topic.description}
      </span>
    </Link>
  );
}

export default function KnowledgeMap({ className = "" }) {
  const { data, isLoading } = useTopics();
  const topics = data?.length ? data : FALLBACK_TOPICS;

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Edge web — center hub to each node, plus the perimeter ring */}
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
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="url(#map-edge)"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {topics.map((topic, index) => {
          const a = nodePosition(index, topics.length);
          const b = nodePosition((index + 1) % topics.length, topics.length);
          return (
            <line
              key={`${topic.id}-ring`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#map-edge)"
              strokeWidth="0.25"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="1.5 1.5"
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
        />
      ))}
    </div>
  );
}