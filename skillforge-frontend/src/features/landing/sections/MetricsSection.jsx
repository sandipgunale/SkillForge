import { useRef } from "react";
import { Gauge, Lightbulb, ShieldCheck, Timer } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import { useSectionReveal } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  MetricsSection — engineering performance told as numbers, not slogans.     */
/*  GSAP scroll reveal; reduced-motion safe.                                   */
/* -------------------------------------------------------------------------- */

const METRICS = [
  {
    icon: Gauge,
    value: 98,
    suffix: "+",
    label: "Lighthouse performance",
    note: "Targeted on every release",
  },
  {
    icon: Timer,
    value: 1.5,
    decimals: 1,
    suffix: "s",
    label: "First Contentful Paint",
    note: "Route-level code splitting",
  },
  {
    icon: ShieldCheck,
    value: 240,
    suffix: "+",
    label: "Automated tests",
    note: "Unit, integration, and contract",
  },
  {
    icon: Lightbulb,
    value: 0,
    suffix: "",
    label: "Lint warnings shipped",
    note: "Zero-warning gate in CI",
  },
];

export default function MetricsSection() {
  const rootRef = useRef(null);

  useSectionReveal(rootRef, [
    { selector: "[data-metrics='card']", y: 26, duration: 0.6, stagger: 0.1, trigger: "top 76%" },
  ]);

  return (
    <section id="metrics" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,color-mix(in_oklch,var(--aurora)_8%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ember">
            The metrics
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Fast is a feature.{" "}
            <span className="text-gradient-ember">Here's the budget.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(({ icon: Icon, value, suffix, decimals = 0, label, note }) => (
            <div
              key={label}
              data-metrics="card"
              className="relative overflow-hidden rounded-3xl border bg-card p-6 transition-colors duration-300 hover:border-ember/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <Icon className="size-5" />
                </div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Target
                </span>
              </div>

              <p className="display mt-6 text-4xl font-bold tracking-tight tabular-nums">
                <CountUp to={value} decimals={decimals} suffix={suffix} />
              </p>
              <p className="mt-1.5 font-semibold">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}