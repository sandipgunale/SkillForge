import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";
import { FACTS } from "../data/manifest";

/* --------------------------------------------------------------------------
   DatabaseSection — chapter 06 (deep dive). Bounded diagram: grouping the
   real 20 migrations into domains, not a maze. The group chips are the
   anchor; the callout states the count is migration files.
   -------------------------------------------------------------------------- */

const DOMAINS = [
  { name: "auth", items: ["users", "roles", "refresh_tokens"] },
  { name: "learning", items: ["learning_paths", "modules", "lessons"] },
  { name: "quiz", items: ["quizzes", "questions", "attempts"] },
  { name: "ai", items: ["ai_requests", "ai_caches"] },
  { name: "engagement", items: ["bookmarks", "ratings", "gamification"] },
  { name: "ops", items: ["resources", "admin tables"] },
];

export default function DatabaseSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="06"
      eyebrow="Deep dive · Data"
      title="20 migrations, six domains."
      claim={`${FACTS.migrations} Flyway migrations in V1–V20 order. Grouped by purpose — not shuffled into a noise floor.`}
    >
      <div className={`${DIAGRAM.group}`}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((domain) => (
            <div key={domain.name} className="rounded-lg border border-border bg-card/50 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-ember">{domain.name}</p>
              <ul className="mt-2 space-y-1">
                {domain.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={DIAGRAM.callout}>all schema evolution shipped as forward-only Flyway migrations — no manual DDL in prod.</div>
      </div>
    </ChapterShell>
  );
}