import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useSectionReveal } from "@/lib/motion-gsap";

/* -------------------------------------------------------------------------- */
/*  ForgeCTASection — Story 8: the invitation.                                 */
/*  An ember-glowing forge panel closing the narrative. GSAP reveal;           */
/*  reduced-motion safe.                                                       */
/* -------------------------------------------------------------------------- */

export default function ForgeCTASection() {
  const rootRef = useRef(null);

  useSectionReveal(rootRef, [
    { selector: "[data-forge-cta='panel']", y: 36, scale: 0.97, duration: 0.8, trigger: "top 78%" },
    { selector: "[data-forge-cta='content'] > *", y: 22, duration: 0.6, stagger: 0.1, trigger: "top 74%" },
  ]);

  return (
    <section ref={rootRef} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div
          data-forge-cta="panel"
          className="relative overflow-hidden rounded-[2.5rem] border bg-card px-8 py-20 text-center lg:px-16 lg:py-28"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 animate-ember-glow rounded-full bg-ember/25 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-56 w-96 rounded-full bg-aurora/15 blur-3xl" />
          </div>

          <div data-forge-cta="content" className="relative">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ember/15 text-ember">
              <Flame className="size-7" />
            </div>

            <h2 className="mx-auto mt-7 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Stop collecting tutorials.{" "}
              <span className="text-gradient-ember">Start forging skills.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Your first quiz is one minute away. Your first badge is closer
              than you think.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-full px-8 text-base shadow-xl shadow-ember/25"
              >
                <Link to={ROUTES.REGISTER}>
                  Forge your first skill
                  <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-8 text-base">
                <Link to={ROUTES.LOGIN}>I already have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}