import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";

/* --------------------------------------------------------------------------
   ApiExplorerSection — chapter 07 (deep dive). One real endpoint anatomy:
   request → controller → service → repository, with the REAL response
   shape. This is the "single API deep view" the plan mandates. Endpoint
   chosen: GET /api/learning-paths (a real controller route).
   -------------------------------------------------------------------------- */

const REQUEST = {
  method: "GET",
  path: "/api/v1/learning-paths?level=INTERMEDIATE",
  auth: "Bearer <access token>",
};

const RESPONSE = `{
  "data": [
    {
      "id": "uuid",
      "title": "Spring Boot Mastery",
      "level": "INTERMEDIATE",
      "progress": 68,
      "modules": [ ... ]
    }
  ],
  "meta": { "page": 1, "size": 20 }
}`;

const FLOW = ["Controller", "Service", "Repository", "PostgreSQL"];

export default function ApiExplorerSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="07"
      eyebrow="Deep dive · API"
      title="One endpoint, fully traced."
      claim="A real route from the controllers — the actual request, the actual internal path, the actual envelope. No invented schema."
    >
      <div className={`${DIAGRAM.group} space-y-5`}>
        <div className="space-y-2 rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-aurora/10 px-2 py-0.5 font-mono text-xs font-semibold text-aurora">{REQUEST.method}</span>
            <code className="break-all font-mono text-sm">{REQUEST.path}</code>
          </div>
          <code className="block font-mono text-xs text-muted-foreground">{REQUEST.auth}</code>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((hop, i) => (
            <span key={hop} className="flex items-center gap-2">
              <span className={DIAGRAM.node}>{hop}</span>
              {i < FLOW.length - 1 ? <span className={DIAGRAM.linkArrow}>→</span> : null}
            </span>
          ))}
        </div>

        <pre className="overflow-x-auto rounded-lg border border-border bg-card/50 p-4 font-mono text-xs leading-relaxed">{RESPONSE}</pre>

        <div className={DIAGRAM.callout}>every error leaves the same envelope — ApiError, Problem-Details style, no internals leaked.</div>
      </div>
    </ChapterShell>
  );
}