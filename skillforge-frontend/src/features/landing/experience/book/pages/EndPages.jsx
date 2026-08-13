import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import BookPage from "../BookPage";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  The closing pages.                                                        */
/*  CtaInside (leaf back): the book's final page — the invitation, with the   */
/*  cap floating above it. BackCoverOutside (static right cover): the        */
/*  branded outside back cover.                                               */
/* -------------------------------------------------------------------------- */

export function CtaInside({ number, total }) {
  return (
    <BookPage chapter="The final chapter" number={number} total={total} side="left">
      <div className="flex h-full flex-col items-center justify-center text-center">
        {/* The cap returns to float over this anchor */}
        <div
          data-cap-anchor="cta"
          aria-hidden="true"
          className="pointer-events-none relative mb-6 flex h-16 w-full justify-center"
        />

        <p className={`${PAGE.overline} ${PAGE.ember}`}>The final chapter</p>

        <h2 className={`${PAGE.h2} mt-4 max-w-[16ch]`}>
          Your next chapter{" "}
          <span className="text-gradient-ember">starts here.</span>
        </h2>

        <p className={`${PAGE.body} ${PAGE.muted} mt-5 max-w-[44ch]`}>
          Stop collecting tutorials. Start forging skills. Your first quiz is
          one minute away — your first badge is closer than you think.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full px-6 text-sm shadow-lg shadow-ember/25"
          >
            <Link to={ROUTES.REGISTER}>
              Forge your first skill
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-6 text-sm">
            <Link to={ROUTES.LOGIN}>I already have an account</Link>
          </Button>
        </div>

        <p className={`${PAGE.small} ${PAGE.muted} mt-8`}>
          Forged with focus, practiced with intent.
        </p>
      </div>
    </BookPage>
  );
}

export function BackCoverOutside() {
  return (
    <div className="book-cover-surface flex h-full flex-col items-center justify-between px-[7%] py-[8%] text-center">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-ember/15 text-ember">
          <Flame className="size-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-[var(--book-cover-text)]">
          SkillForge
        </span>
      </div>

      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--book-cover-muted)]">
          The craft of focused learning
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-[color-mix(in_oklch,var(--ember)_70%,transparent)]" />
        <p className="mt-4 max-w-[24ch] text-sm leading-relaxed text-[var(--book-cover-muted)]">
          Read again when you're ready to build.
        </p>
      </div>

      <p className="text-xs text-[var(--book-cover-muted)] opacity-70">
        © {new Date().getFullYear()} SkillForge
      </p>
    </div>
  );
}