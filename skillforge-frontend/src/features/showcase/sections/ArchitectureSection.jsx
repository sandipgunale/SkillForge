import { DIAGRAM } from "@/lib/design-system";

import ChapterShell from "../components/ChapterShell";
import { FACTS } from "../data/manifest";

/* --------------------------------------------------------------------------
   ArchitectureSection — chapter 02. An animated layer diagram built from
   REAL class chips (JwtAuthFilter, AiResilienceExecutor, RequestIdFilter).
   Layers are stacked bands; the anchor is the request flow left→right.
   -------------------------------------------------------------------------- */

const LAYERS = [
  {
    name: "Edge & Filters",
    chips: ["RequestIdFilter", "JwtAuthFilter", "CorsConfig"],
  },
  {
    name: "API Surface",
    chips: [`${FACTS.controllers} controllers`],
  },
  {
    name: "Application Core",
    chips: ["services", "use-cases", "AiResilienceExecutor"],
  },
  {
    name: "Data",
    chips: ["repositories", "Flyway V1–V20", "PostgreSQL"],
  },
];

const FLOW = ["HTTP request", "RequestIdFilter", "JwtAuthFilter", "Controller", "Service", "Repository", "PostgreSQL"];

export default function ArchitectureSection({ id }) {
  return (
    <ChapterShell
      id={id}
      number="02"
      eyebrow="Architecture"
      title="One request, every layer accountable."
      claim="Every HTTP call crosses a correlation ID, an auth filter, and an executor before it touches data. Here is the real shape — annotated with real classes."
    >
      <div className={`${DIAGRAM.group} space-y-6`}>
        <div className="flex flex-col gap-3">
          {LAYERS.map((layer) => (
            <div key={layer.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card/50 px-4 py-3">
              <span className={`${DIAGRAM.layerChip} w-40 shrink-0`}>{layer.name}</span>
              <div className="flex flex-wrap gap-2">
                {layer.chips.map((chip) => (
                  <span key={chip} className={DIAGRAM.node}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2" aria-label="Request flow">
            {FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`${DIAGRAM.node} ${
                    step === "JwtAuthFilter"
                      ? DIAGRAM.nodeFocused
                      : i === FLOW.length - 1
                        ? "border-aurora/50 bg-aurora/5"
                        : DIAGRAM.nodeDim
                  }`}
                >
                  {step}
                </span>
                {i < FLOW.length - 1 ? (
                  <span className={DIAGRAM.linkArrow} aria-hidden="true">→</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        <div className={DIAGRAM.callout}>read the sequence in order — every hop is traced by a correlation ID.</div>
      </div>
    </ChapterShell>
  );
}