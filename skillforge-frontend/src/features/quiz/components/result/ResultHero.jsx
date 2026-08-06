import { motion } from "framer-motion";
import { Award, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import CountUp from "@/components/common/CountUp";
import { EASE_OUT_EXPO } from "@/lib/motion";

const RING_RADIUS = 72;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function scoreTone(percentage) {
  if (percentage >= 90) return "success";
  if (percentage >= 70) return "info";
  if (percentage >= 50) return "warning";
  return "destructive";
}

const TONE_VAR = {
  success: {
    stroke: "var(--success)",
    glow: "color-mix(in oklch, var(--success) 30%, transparent)",
    chip: "bg-success/15 text-success",
  },
  info: {
    stroke: "var(--info)",
    glow: "color-mix(in oklch, var(--info) 30%, transparent)",
    chip: "bg-info/15 text-info",
  },
  warning: {
    stroke: "var(--warning)",
    glow: "color-mix(in oklch, var(--warning) 30%, transparent)",
    chip: "bg-warning/15 text-warning",
  },
  destructive: {
    stroke: "var(--destructive)",
    glow: "color-mix(in oklch, var(--destructive) 30%, transparent)",
    chip: "bg-destructive/15 text-destructive",
  },
};

const HEADLINES = {
  perfect: { title: "Perfect Score", message: "Flawless. This is mastery in the making." },
  excellent: { title: "Exceptional", message: "Your consistency is becoming skill." },
  good: { title: "Solid Progress", message: "The loop is working — keep forging." },
  keep: { title: "Momentum, Not Mastery — Yet", message: "Every attempt refines the craft." },
};

function getHeadline(percentage) {
  if (percentage === 100) return HEADLINES.perfect;
  if (percentage >= 80) return HEADLINES.excellent;
  if (percentage >= 60) return HEADLINES.good;
  return HEADLINES.keep;
}

export default function ResultHero({ percentage }) {
  const tone = scoreTone(percentage);
  const { stroke, glow, chip } = TONE_VAR[tone];
  const { title, message } = getHeadline(percentage);

  const Icon = percentage >= 60 ? TrendingUp : TrendingDown;

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card elevate">
      {/* Ambient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 60% at 50% 0%, ${glow}, transparent 65%)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-6 py-12 text-center sm:px-10 lg:flex-row lg:justify-center lg:gap-16 lg:py-16">
        {/* Score ring */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="relative shrink-0"
          aria-label={`Score: ${percentage.toFixed(0)} percent`}
        >
          <svg
            viewBox="0 0 176 176"
            className="size-44 sm:size-52"
            role="img"
            aria-hidden="true"
          >
            <circle
              cx="88"
              cy="88"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-foreground/10"
            />
            <motion.circle
              cx="88"
              cy="88"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke={stroke}
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - percentage / 100) }}
              transition={{ duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
              transform="rotate(-90 88 88)"
              style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: EASE_OUT_EXPO }}
            >
              <CountUp
                to={percentage}
                decimals={percentage % 1 !== 0 ? 1 : 0}
                suffix="%"
                className="display text-6xl font-extrabold sm:text-7xl"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT_EXPO }}
          className="max-w-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
            className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl shadow-lg lg:mx-0"
            style={{ background: stroke, color: "var(--background)" }}
          >
            {percentage === 100 ? (
              <Sparkles className="size-7" />
            ) : (
              <Icon className="size-7" />
            )}
          </motion.div>

          <h1 className="display text-3xl font-bold sm:text-4xl">
            {percentage === 100 ? (
              <>
                Perfect Score{" "}
                <Award
                  className="inline size-8 text-warning"
                  aria-hidden="true"
                />
              </>
            ) : (
              title
            )}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {message}
          </p>

          <div className={`mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${chip}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {percentage >= 60 ? "Streak preserved" : "Setback is data"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}