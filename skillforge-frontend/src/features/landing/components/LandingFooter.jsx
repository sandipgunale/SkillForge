import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { usePressPhysics } from "@/lib/motion-gsap";
import { SECTIONS } from "../experience/registry";

/* -------------------------------------------------------------------------- */
/*  LandingFooter — the editorial close. One statement, one CTA, large        */
/*  navigation type — no corporate four-column grid. The wordmark runs as a   */
/*  ghost band across the bottom (Foundry Precision tokens).                  */
/* -------------------------------------------------------------------------- */

/* The footer is scene 14 — derived from the section registry so the scene
   numbering can never drift from the narrative. */
const FOOTER_SCENE = String(SECTIONS.length).padStart(2, "0");

const FOOTER_COLUMNS = [
  {
    heading: "Navigate",
    links: [
      { label: "Problem", href: "#problem" },
      { label: "The engine", href: "#engine" },
      { label: "Practice", href: "#practice" },
      { label: "Paths", href: "#roadmap" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Dashboard", to: ROUTES.DASHBOARD },
      { label: "Resources", to: ROUTES.RESOURCES },
      { label: "Quiz history", to: ROUTES.QUIZ_HISTORY },
      { label: "Bookmarks", to: ROUTES.BOOKMARKS },
      { label: "Engineering showcase", to: ROUTES.SHOWCASE },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", to: ROUTES.LOGIN },
      { label: "Create account", to: ROUTES.REGISTER },
      { label: "Profile", to: ROUTES.PROFILE },
    ],
  },
];

export default function LandingFooter() {
  const ctaRef = useRef(null);
  usePressPhysics(ctaRef);

  return (
    <footer
      data-motion="quiet"
      className="relative overflow-hidden border-t border-lp-border bg-lp-surface"
    >
      <div className="mx-auto max-w-[1180px] px-[clamp(24px,5vw,56px)] py-16 lg:py-24">
        {/* Statement + CTA */}
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.24em] text-lp-accent">
              <span className="text-lp-faint">{FOOTER_SCENE}</span> — The forge is open
            </p>
            <h2 className="font-lp-display mt-4 max-w-[22ch] text-[clamp(2rem,4.5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.02em]">
              Stop collecting.{" "}
              <span className="text-lp-accent">Start forging.</span>
            </h2>
            <div className="mt-8">
              <Button asChild ref={ctaRef} size="lg" className="lp-glow rounded-[4px] bg-lp-accent px-7 text-base font-semibold text-lp-accent-ink transition-colors hover:bg-lp-accent-strong">
                <Link to={ROUTES.REGISTER}>
                  Start forging
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-lp-muted lg:justify-self-end lg:text-right">
            The distraction-free learning workspace. Structured paths,
            AI-powered practice, and momentum you can measure — everything you
            need to actually finish what you start.
          </p>
        </div>

        {/* Large navigation */}
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.24em] text-lp-faint">
                {column.heading}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {column.links.map((link) =>
                  link.href ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight text-lp-text/85 transition-colors hover:text-lp-accent"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 text-lp-accent/0 transition-all duration-300 group-hover:text-lp-accent/70" />
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight text-lp-text/85 transition-colors hover:text-lp-accent"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 text-lp-accent/0 transition-all duration-300 group-hover:text-lp-accent/70" />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* Ghost wordmark band */}
        <div aria-hidden="true" className="pointer-events-none mt-20 select-none overflow-hidden">
          <p className="whitespace-nowrap font-lp-display text-[clamp(4rem,16vw,15rem)] font-black leading-[0.8] tracking-tight text-lp-text/[0.05]">
            SKILLFORGE
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-lp-border pt-6 text-sm text-lp-muted sm:flex-row">
          <p>© {new Date().getFullYear()} SkillForge. All rights reserved.</p>
          <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lp-faint">
            Forged with focus, practiced with intent.
          </p>
        </div>
      </div>
    </footer>
  );
}