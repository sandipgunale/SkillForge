import { Link } from "react-router-dom";
import { ArrowUpRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

/* -------------------------------------------------------------------------- */
/*  LandingFooter — the editorial close. One statement, one CTA, large        */
/*  navigation type — no corporate four-column grid. The wordmark runs as a   */
/*  ghost band across the bottom, echoing the landing's repeated-typography   */
/*  motif.                                                                     */
/* -------------------------------------------------------------------------- */

const FOOTER_COLUMNS = [
  {
    heading: "Navigate",
    links: [
      { label: "Problem", href: "#what-is" },
      { label: "The forge loop", href: "#how-it-works" },
      { label: "The AI", href: "#architecture" },
      { label: "The roadmap", href: "#experience" },
      { label: "Questions", href: "#faq" },
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
  return (
    <footer className="relative overflow-hidden border-t bg-card/40">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 lg:px-10 lg:py-24">
        {/* Statement + CTA */}
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              The forge is open
            </p>
            <h2 className="mt-4 max-w-[24ch] text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[1.05] tracking-tight">
              Stop collecting.{" "}
              <span className="text-gradient-ember">Start forging.</span>
            </h2>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-ember/20">
                <Link to={ROUTES.REGISTER}>
                  Start learning free
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground lg:justify-self-end lg:text-right">
            The distraction-free learning workspace. Structured paths,
            AI-powered practice, and momentum you can measure — everything you
            need to actually finish what you start.
          </p>
        </div>

        {/* Large navigation */}
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {column.heading}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {column.links.map((link) =>
                  link.href ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground/85 transition-colors hover:text-ember"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 text-ember/0 transition-all duration-300 group-hover:text-ember/70" />
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground/85 transition-colors hover:text-ember"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 text-ember/0 transition-all duration-300 group-hover:text-ember/70" />
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
          <p className="whitespace-nowrap text-[clamp(4rem,16vw,15rem)] font-bold leading-[0.8] tracking-tight text-foreground/[0.05]">
            SKILLFORGE
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SkillForge. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Flame className="size-3.5 text-ember" />
            Forged with focus, practiced with intent.
          </p>
        </div>
      </div>
    </footer>
  );
}