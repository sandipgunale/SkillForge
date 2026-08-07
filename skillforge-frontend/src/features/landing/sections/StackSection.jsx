import { useRef } from "react";
import {
  Activity,
  Boxes,
  Cpu,
  Database,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  StackSection — the honest engineering stack, grouped by discipline.        */
/*  GSAP scroll reveal; reduced-motion safe.                                   */
/* -------------------------------------------------------------------------- */

const STACK = [
  {
    icon: Cpu,
    title: "Frontend",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: ["React 19", "Vite 8", "Tailwind v4", "GSAP", "Recharts", "Zustand"],
  },
  {
    icon: Database,
    title: "Backend",
    accent: "text-aurora",
    chip: "bg-aurora/12",
    items: ["Spring Boot 3", "PostgreSQL", "Flyway", "JWT", "Resilience4j", "Bucket4j"],
  },
  {
    icon: Sparkles,
    title: "AI",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: ["Gemini", "Provider failover", "Schema validation", "Guardrails"],
  },
  {
    icon: Gauge,
    title: "Quality Gates",
    accent: "text-success",
    chip: "bg-success/12",
    items: ["149+ tests", "JaCoCo gate", "Zero-warning lint", "Perf budgets"],
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, text: "No hardcoded secrets. Ever." },
  { icon: Boxes, text: "Small files, composed over inherited." },
  { icon: RefreshCw, text: "Retries, failover, and graceful degradation." },
  { icon: Activity, text: "Metrics on every layer, correlation IDs everywhere." },
];

export default function StackSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;

      gsap.from(select("[data-stack='cell']"), {
        opacity: 0,
        y: 22,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 76%", once: true },
      });
      gsap.from(select("[data-stack='principle']"), {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="stack" ref={rootRef} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ember">
            The craft
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            No toys. <span className="text-gradient-ember">Production steel</span>{" "}
            included.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every choice is boring on purpose — so reliability is never a
            gamble. The wow is in the craft, not the novelty.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map(({ icon: Icon, title, accent, chip, items }) => (
            <div
              key={title}
              data-stack="cell"
              className="rounded-3xl border bg-card p-6 transition-colors duration-300 hover:border-ember/40"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${chip} ${accent}`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              data-stack="principle"
              className="flex items-center gap-3 rounded-2xl border border-foreground/10 px-5 py-4"
            >
              <Icon className="size-4 shrink-0 text-ember" />
              <p className="text-sm font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}