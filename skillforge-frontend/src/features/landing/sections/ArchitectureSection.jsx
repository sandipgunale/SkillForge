import { useRef } from "react";
import {
  ArrowDown,
  Boxes,
  Cpu,
  Database,
  Layers,
  Lock,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  ArchitectureSection — the engineering story. A production-grade system     */
/*  diagram told as a layered flow: client -> gateway -> services -> AI chain. */
/*  GSAP scroll reveal; reduced-motion safe.                                   */
/* -------------------------------------------------------------------------- */

const LAYERS = [
  {
    icon: Layers,
    name: "Presentation",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: [
      { icon: Cpu, label: "React 19 + Vite 8" },
      { icon: Boxes, label: "GSAP motion engine" },
      { icon: Lock, label: "JWT auth, lazy routes" },
    ],
  },
  {
    icon: Workflow,
    name: "Application",
    accent: "text-aurora",
    chip: "bg-aurora/12",
    items: [
      { icon: Boxes, label: "Spring Boot 3, clean modules" },
      { icon: ShieldCheck, label: "Rate limits + circuit breakers" },
      { icon: Database, label: "PostgreSQL + Flyway migrations" },
    ],
  },
  {
    icon: Cpu,
    name: "AI Subsystem",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: [
      { icon: ShieldCheck, label: "Prompt guardrails, schema validation" },
      { icon: Workflow, label: "Provider failover + retries" },
      { icon: Database, label: "Token & cost analytics" },
    ],
  },
];

export default function ArchitectureSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-arch='heading']"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
      });
      gsap.from(select("[data-arch='layer']"), {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.14,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section
      id="architecture"
      ref={rootRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_30%,color-mix(in_oklch,var(--ember)_7%,transparent)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div data-arch="heading" className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ember">
            The engineering
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Forged like it{" "}
            <span className="text-gradient-ember">has to survive contact.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            SkillForge isn't a tutorial app with AI bolted on — it's a
            production system engineered end-to-end: resilient AI, honest
            data, and a frontend that respects your hardware.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {LAYERS.map(({ icon: Icon, name, accent, chip, items }) => (
            <div
              key={name}
              data-arch="layer"
              className="glass group relative overflow-hidden rounded-3xl border p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-2xl ${chip} ${accent}`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{name}</h3>
              </div>

              <div className="mt-5 space-y-3">
                {items.map(({ icon: ItemIcon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border bg-card/60 px-4 py-3 transition-colors duration-300 group-hover:border-ember/40"
                  >
                    <ItemIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div data-arch="heading" className="mt-12 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border bg-card/60 px-5 py-2.5 text-sm text-muted-foreground">
            <ArrowDown className="size-4 text-ember" />
            Every layer ships with observability, health checks, and metrics.
          </div>
        </div>
      </div>
    </section>
  );
}