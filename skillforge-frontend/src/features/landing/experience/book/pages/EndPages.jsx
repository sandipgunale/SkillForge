import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import BookPage from "../BookPage";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  The closing pages.                                                        */
/*  CtaInside (last leaf): the book's final page — the invitation that        */
/*  finishes the book before the footer takes over.                           */
/* -------------------------------------------------------------------------- */

export function CtaInside({ number, total }) {
  return (
    <BookPage chapter="The final chapter" number={number} total={total} side="left">
      <div className="flex h-full flex-col items-center justify-center text-center">
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
