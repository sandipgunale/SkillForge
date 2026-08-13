import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import CountUp from "@/components/common/CountUp";
import { ROUTES } from "@/constants/routes";
import { useMagnetic } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  HeroContent — the hero promise (badge, title, subtitle, CTAs, stats).     */
/*  Shared by the fixed 3D stage (HeroLayer) and the static reduced-motion    */
/*  layout, so the copy never drifts between the two modes.                   */
/* -------------------------------------------------------------------------- */

const HERO_STATS = [
  { count: 100, suffix: "%", value: "100%", label: "Your attention, protected" },
  { value: "AI", label: "Practice forged for you, on demand" },
  { count: 0, suffix: "", value: "0", label: "Distractions, by design" },
];

export default function HeroContent() {
  const primaryCtaRef = useRef(null);
  useMagnetic(primaryCtaRef);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        data-hero="badge"
        className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
      >
        <Flame className="size-4 text-ember" />
        Forged by The Forge — focused, made
      </div>

      <h1
        data-hero="title"
        className="mt-7 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.25rem]"
      >
        The internet is infinite.
        <br />
        <span className="text-gradient-ember">Your focus is forged.</span>
      </h1>

      <p
        data-hero="subtitle"
        className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
      >
        SkillForge hammers scattered videos, articles, and tutorials into one
        structured, distraction-free path — with AI quizzes, instant feedback,
        and momentum that keeps you finishing.
      </p>

      <div
        data-hero="cta"
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <div ref={primaryCtaRef}>
          <Button
            asChild
            size="lg"
            className="group h-12 w-full rounded-full px-7 text-base shadow-lg shadow-ember/20 sm:w-auto"
          >
            <Link to={ROUTES.REGISTER}>
              Start learning free
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-full px-7 text-base transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] sm:w-auto"
        >
          <Link to={ROUTES.LOGIN}>Explore the dashboard</Link>
        </Button>
      </div>

      <dl
        data-hero="stats"
        className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <dt className="text-2xl font-bold text-gradient-ember">
              {stat.count != null ? (
                <CountUp to={stat.count} suffix={stat.suffix ?? ""} />
              ) : (
                stat.value
              )}
            </dt>
            <dd className="max-w-[13rem] text-sm text-muted-foreground">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
