import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";
import { FACTS } from "../data/manifest";

/* --------------------------------------------------------------------------
   TimelineSection — chapter 08 (deep dive). The real repo arc
   (first commit → last commit, tags) as the anchor; the "since" number
   is manifest-sourced.
   -------------------------------------------------------------------------- */

export default function TimelineSection({ id }) {
  const tags = [FACTS.latestTag, "sprint-5-complete"];
  return (
    <ChapterShell
      id={id}
      number="08"
      eyebrow="Deep dive · Arc"
      title={`From ${FACTS.firstCommitDate} to ${FACTS.lastCommitDate}`}
      claim={`${FACTS.commits} commits · ${FACTS.authors} author · ${FACTS.javaMainFiles} Java main files, walked in order, not slides.`}
    >
      <div className={`${DIAGRAM.group}`}>
        <ol className="relative space-y-5 border-l border-border pl-6">
          <li>
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-ember" aria-hidden="true" />
            <p className="font-mono text-xs text-muted-foreground">{FACTS.firstCommitDate}</p>
            <p className="mt-1 text-sm">First commit — the repo opens.</p>
          </li>
          <li>
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-border" aria-hidden="true" />
            <p className="font-mono text-xs text-muted-foreground">{FACTS.lastCommitDate}</p>
            <p className="mt-1 text-sm">
              Latest commit — {FACTS.commits} commits, {FACTS.authors} author{FACTS.authors === 1 ? "" : "s"}, tagged.
            </p>
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={DIAGRAM.tokenPill}>
              {tag}
            </span>
          ))}
        </div>
        <div className={DIAGRAM.callout}>the snapshot above regenerates on every build — it reflects this repo, this minute.</div>
      </div>
    </ChapterShell>
  );
}