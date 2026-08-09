import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";

/* --------------------------------------------------------------------------
   AiSection — chapter 04. The pipeline is the anchor: prompt → guardrail →
   model → schema parse → validated answer. Failure stages are explicit —
   the executors are real classes (AiResilienceExecutor, circuit breaker).
   -------------------------------------------------------------------------- */

export default function AiSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="04"
      eyebrow="AI Module"
      title="Every answer survives a gauntlet."
      claim="LLM output is the only data that arrives untrusted. The pipeline parses a schema, validates it, and serves a cached answer — or a graceful fallback, never a broken sentence."
    >
      <div className={`${DIAGRAM.group}`}>
        {/* Pipeline as a stepped band */}
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {[
            "Prompt template",
            "Guardrail scan",
            "Model call",
            "Schema parse",
            "Validator gate",
          ].map((stage, i) => (
            <li
              key={stage}
              className={`flex items-center justify-center rounded-lg border border-border bg-card/50 px-3 py-3 text-center text-sm ${
                i === 0 ? "border-ember/40 bg-ember/5" : i === 4 ? "border-aurora/40 bg-aurora/5" : ""
              }`}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {stage}
            </li>
          ))}
        </ol>

        {/* Resolver chain */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={`${DIAGRAM.nodeDim} rounded-lg bg-card/40 px-4 py-3`}>
            <p className="text-sm font-medium">Primary provider</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Gemini · timeout 30s</p>
          </div>
          <div className={`${DIAGRAM.nodeDim} rounded-lg bg-card/40 px-4 py-3`}>
            <p className="text-sm font-medium">Fallback path</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">circuit-broken → cached answer/fallback</p>
          </div>
        </div>

        <div className={DIAGRAM.callout}>prompt internals never leave the server — the client only ever sees a structured answer or an envelope.</div>
      </div>
    </ChapterShell>
  );
}