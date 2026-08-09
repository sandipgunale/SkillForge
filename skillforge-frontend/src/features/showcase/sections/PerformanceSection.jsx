import { FACTS } from "../data/manifest";
import ChapterShell from "../components/ChapterShell";
import { DIAGRAM } from "@/lib/design-system";

/* --------------------------------------------------------------------------
   PerformanceSection — chapter 05. Real numbers from the recorded
   benchmark reports only, parsed deterministically in the manifest
   generator (default | "—" when not recorded).
   -------------------------------------------------------------------------- */

export default function PerformanceSection({ id }) {
  const fcp = FACTS.perf?.fcp ?? "—";
  const lcp = FACTS.perf?.lcp ?? "—";
  const transferKb = FACTS.perf?.landingTransferKb;

  return (
    <ChapterShell
      id={id}
      number="05"
      eyebrow="Performance"
      title="Budgeted, measured, published."
      claim="The app ships a budget — and the numbers below are the recorded ones from the benchmark run, not marketing estimates."
    >
      <div className={`${DIAGRAM.group}`}>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="FCP" value={fcp} />
          <Metric label="LCP" value={lcp} />
          <Metric label="First-visit transfer" value={transferKb ? `${transferKb} KB` : "—"} />
          <Metric label="Route chunks" value="lazy + split" />
        </dl>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={`${DIAGRAM.nodeDim} rounded-lg bg-card/40 px-4 py-3`}>
            <p className="text-sm font-medium">Bundle discipline</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lazy routes, code-split three.js scenes, gzip at the gateway, image optimization.
            </p>
          </div>
          <div className={`${DIAGRAM.nodeDim} rounded-lg bg-card/40 px-4 py-3`}>
            <p className="text-sm font-medium">Budget kept</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Lighthouse ≥ 98 · FCP < 1.5s · LCP < 2.0s · CLS < 0.05. Latest recorded FCP: "}
              {fcp}.
            </p>
          </div>
        </div>

        <div className={DIAGRAM.callout}>budget reviewed on every PR via /benchmark — the numbers above are the recorded ones.</div>
      </div>
    </ChapterShell>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 px-4 py-3 text-center">
      <dt className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xl text-ember dark:text-ember">{value}</dd>
    </div>
  );
}