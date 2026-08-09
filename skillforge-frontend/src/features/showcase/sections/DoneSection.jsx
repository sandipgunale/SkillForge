import { Button } from "@/components/ui/button";

import ChapterShell from "../components/ChapterShell";
import { FACTS } from "../data/manifest";

export default function DoneSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="09"
      eyebrow="Recap"
      title="Read the repo — not this page."
      claim="If the walkthrough made you want the source: it is here, next to the docs that keep it honest."
    >
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="#top" onClick={(e) => e.preventDefault()}>
              Raise a concern
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
              Print this walkthrough
            </a>
          </Button>
        </div>
        <p className="max-w-prose text-sm text-muted-foreground">
          Snapshot: {FACTS.commits} commits · {FACTS.javaMainFiles} Java files · {FACTS.migrations} migrations · tag{" "}
          {FACTS.latestTag} · generated {FACTS.lastCommitDate}.
        </p>
      </div>
    </ChapterShell>
  );
}