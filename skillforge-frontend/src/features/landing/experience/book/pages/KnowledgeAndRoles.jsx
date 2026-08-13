import { BookOpen, Library, ShieldCheck } from "lucide-react";

import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import KnowledgeMap from "../KnowledgeMap";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Six — "The knowledge map" and who it serves.                      */
/*  Left: the live topic catalog as a constellation (real API data).          */
/*  Right: the three roles that share the workspace (real platform roles).    */
/* -------------------------------------------------------------------------- */

export function MapLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Six" number={number} total={total} side="left">
      <ChapterOpener
        number="VI"
        chapter="The knowledge map"
        title="The catalog, alive"
        lead="Every topic in the library — live from the platform. Follow any node to the resources, quizzes, and paths built around it."
      >
        <div className="relative h-44 w-full sm:h-52">
          <KnowledgeMap />
        </div>
        <p className={`${PAGE.small} ${PAGE.muted} mt-2 text-center`}>
          Topics and tags keep the catalog navigable — governed by
          administrators, consumed by everyone.
        </p>
      </ChapterOpener>
    </BookPage>
  );
}

const ROLES = [
  {
    icon: BookOpen,
    role: "For learners",
    headline: "Your path, your pace, your proof",
    points: [
      "One focused workspace replacing scattered tabs",
      "AI quizzes after every learning session",
      "Visible progress: health score, mastery, badges",
    ],
    accent: "bg-ember/12 text-ember",
  },
  {
    icon: Library,
    role: "For instructors",
    headline: "Publish to the platform, not the void",
    points: [
      "Curate resources that become structured curriculum",
      "Track how learners engage with your content",
      "Quizzes and paths built around your material",
    ],
    accent: "bg-aurora/12 text-aurora",
  },
  {
    icon: ShieldCheck,
    role: "For administrators",
    headline: "Run the platform with clarity",
    points: [
      "User management: roles, activation, search",
      "Platform-wide statistics at a glance",
      "Every action audited with request tracing",
    ],
    accent: "bg-success/12 text-success",
  },
];

export function RolesRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Six" number={number} total={total} side="right">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>One platform, three roles</p>
        <h3 className={`${PAGE.h3} mt-2`}>Everyone who touches learning gets a workspace</h3>

        <ul className="mt-4 grid flex-1 gap-3">
          {ROLES.map(({ icon: Icon, role, headline, points, accent }) => (
            <li
              key={role}
              className="flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className={`${PAGE.small} ${PAGE.muted} block font-semibold uppercase tracking-[0.14em]`}>
                  {role}
                </span>
                <span className={`${PAGE.body} mt-0.5 block font-bold`}>{headline}</span>
                <ul className="mt-1.5 space-y-1">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ember" />
                      <span className={`${PAGE.small} ${PAGE.muted} leading-snug`}>{point}</span>
                    </li>
                  ))}
                </ul>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </BookPage>
  );
}