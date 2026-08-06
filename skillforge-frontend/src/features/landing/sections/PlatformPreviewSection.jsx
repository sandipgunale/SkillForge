import { motion } from "framer-motion";
import { CheckCircle2, Flame, LayoutDashboard, LineChart } from "lucide-react";

import SectionHeading from "../components/SectionHeading";
import { EASE_OUT_EXPO } from "@/lib/motion";

const BAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const BAR_HEIGHTS = [34, 58, 42, 76, 52, 88, 66];

export default function PlatformPreviewSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_80%_20%,color-mix(in_oklch,var(--aurora)_7%,transparent)_0%,transparent_60%),radial-gradient(ellipse_40%_40%_at_10%_70%,color-mix(in_oklch,var(--ember)_6%,transparent)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-screen-2xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="The forge"
          title="One workspace for the whole loop"
          description="Search a topic, follow a generated path, prove it with a quiz, and watch your health score climb — all without leaving the app."
        />

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="relative mt-16"
        >
          <FlareGlow />

          <div className="elevate-float relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border bg-card">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
              <span className="size-3 rounded-full bg-rose-400/70" />
              <span className="size-3 rounded-full bg-amber-400/70" />
              <span className="size-3 rounded-full bg-emerald-400/70" />
              <div className="mx-auto flex items-center gap-1.5 rounded-full bg-muted/70 px-4 py-1 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                app.skillforge.io/dashboard
              </div>
            </div>

            {/* App mock */}
            <div className="grid md:grid-cols-[12rem_1fr]">
              {/* Sidebar */}
              <div className="hidden border-r bg-muted/25 p-4 md:block">
                <div className="flex items-center gap-2 px-1">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-ember text-white">
                    <Flame className="size-4" />
                  </span>
                  <span className="text-sm font-semibold tracking-tight">
                    SkillForge
                  </span>
                </div>

                <nav className="mt-6 space-y-1.5">
                  <NavPill active icon={LayoutDashboard} label="Dashboard" />
                  <NavPill icon={LineChart} label="Analytics" active={false} />
                  <NavPill icon={Flame} label="Progress" active={false} />
                </nav>
              </div>

              {/* Main */}
              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Your workspace
                    </p>
                    <p className="display mt-0.5 text-sm font-bold tracking-tight">
                      Good evening, Ananya
                    </p>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-ember/15 text-xs font-bold text-ember">
                    AR
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Health", value: 87, unit: "%" },
                    { label: "Streak", value: 12, unit: "d" },
                    { label: "Mastery", value: 71, unit: "%" },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border bg-card p-3"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="display mt-0.5 text-lg font-bold tabular-nums text-ember">
                        {metric.value}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {metric.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart + health ring */}
                <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">Weekly activity</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        218 mins
                      </span>
                    </div>
                    <div className="mt-4 flex h-24 items-end gap-2">
                      {BAR_HEIGHTS.map((height, index) => (
                        <motion.div
                          key={BAR_DAYS[index]}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true, margin: "-60px" }}
                          transition={{
                            delay: 0.4 + index * 0.07,
                            duration: 0.5,
                            ease: EASE_OUT_EXPO,
                          }}
                          style={{ height: `${height}%` }}
                          className="flex-1 origin-bottom rounded-md bg-ember/80"
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between px-1 text-[9px] text-muted-foreground">
                      {BAR_DAYS.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>

                  <HealthRing />
                </div>

                {/* Quiz chip */}
                <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/8 p-3">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  <p className="text-xs text-muted-foreground">
                    Web Fundamentals quiz —{" "}
                    <span className="font-semibold text-foreground">
                      scored 92%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FlareGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-10 -top-8 bottom-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,color-mix(in_oklch,var(--ember)_12%,transparent)_0%,transparent_70%)] blur-2xl"
    />
  );
}

function NavPill({ icon: Icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${
        active
          ? "bg-ember text-white shadow-lg shadow-ember/25"
          : "text-muted-foreground"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </div>
  );
}

const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function HealthRing() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-4">
      <div className="relative">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          className="-rotate-90"
        >
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="7"
            className="stroke-muted"
          />
          <motion.circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            whileInView={{
              strokeDashoffset: RING_CIRCUMFERENCE * (1 - 0.76),
            }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.5, duration: 1.1, ease: EASE_OUT_EXPO }}
            className="stroke-ember"
            strokeDasharray={RING_CIRCUMFERENCE}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="display text-lg font-bold tabular-nums">76</p>
        </div>
      </div>
      <p className="mt-1.5 text-[10px] font-medium text-muted-foreground">
        Health score
      </p>
    </div>
  );
}