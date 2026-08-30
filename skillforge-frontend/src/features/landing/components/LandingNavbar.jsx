import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import AppLogo from "@/components/layout/AppLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import {
  measureSectionTops,
  NAV_LINKS,
  probeUntilSectionsReady,
  resolveActiveSection,
  subscribeFontsReady,
} from "../experience/registry";

const SHOWCASE_LINK = { label: "For recruiters", to: ROUTES.SHOWCASE };
const SCROLLED_THRESHOLD = 12;

/* -------------------------------------------------------------------------- */
/*  LandingNavbar — the Foundry Precision iron bar. Flat mono links, copper   */
/*  underline for the active section. Native-flow measurement: section tops   */
/*  are read once per resize/font-ready/content-change, never per scroll      */
/*  frame.                                                                     */
/* -------------------------------------------------------------------------- */

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const rafRef = useRef(0);
  const topsRef = useRef({ values: null });
  const shellRef = useRef(null);

  useEffect(() => {
    shellRef.current = document.querySelector(".landing-shell");
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((link) => link.href.slice(1));
    const readTops = () => {
      topsRef.current.values = measureSectionTops(ids);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const y = window.scrollY;
        setScrolled(y > SCROLLED_THRESHOLD);
        if (!topsRef.current.values) readTops();
        setActiveId(resolveActiveSection(topsRef.current.values, ids, y));
      });
    };
    const onResize = () => {
      topsRef.current.values = null;
      onScroll();
    };
    const onContentChange = () => {
      topsRef.current.values = null;
      onScroll();
    };

    const stopProbe = probeUntilSectionsReady(onContentChange);
    const stopFonts = subscribeFontsReady(onContentChange);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("lp:contentchange", onContentChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("lp:contentchange", onContentChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      stopProbe();
      stopFonts();
    };
  }, []);

  const linkClass = (active) =>
    `py-2 font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-colors ${
      active
        ? "text-lp-accent underline underline-offset-8"
        : "text-lp-muted hover:text-lp-text"
    }`;

  return (
    <header
      data-motion="shell"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-lp-border bg-lp-bg/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-[clamp(24px,5vw,56px)]"
        aria-label="Main navigation"
      >
        <AppLogo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = activeId === link.href.slice(1);
            return (
              <li key={link.href}>
                <a href={link.href} aria-current={active ? "true" : undefined} className={linkClass(active)}>
                  {link.label}
                </a>
              </li>
            );
          })}
          <li>
            <Link
              to={SHOWCASE_LINK.to}
              className="py-2 font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] text-lp-accent transition-colors hover:text-lp-accent-strong"
            >
              {SHOWCASE_LINK.label}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle align="end" />

          <Link
            to={ROUTES.LOGIN}
            className="font-lp-mono hidden py-2 text-[0.6875rem] uppercase tracking-[0.18em] text-lp-muted transition-colors hover:text-lp-text sm:block"
          >
            Sign in
          </Link>

          <Button asChild className="hidden h-11 rounded-[2px] bg-lp-accent px-4 text-[0.8125rem] font-semibold text-lp-accent-ink transition-colors hover:bg-lp-accent-strong sm:inline-flex">
            <Link to={ROUTES.REGISTER}>Start forging</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-[2px] border-lp-border-strong bg-transparent text-lp-text lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              container={shellRef}
              className="w-72 border-l border-lp-border bg-lp-bg"
            >
              <SheetTitle className="px-1 pt-2 text-lp-text">SkillForge</SheetTitle>
              <ul className="mt-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = activeId === link.href.slice(1);
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? "true" : undefined}
                        className={`block rounded-[2px] px-3 py-2.5 font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-colors ${
                          active
                            ? "bg-lp-accent/10 text-lp-accent"
                            : "text-lp-muted hover:bg-lp-surface-2 hover:text-lp-text"
                        }`}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <Link
                    to={SHOWCASE_LINK.to}
                    className="block rounded-[2px] px-3 py-2.5 font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] text-lp-accent transition-colors hover:bg-lp-surface-2"
                  >
                    {SHOWCASE_LINK.label}
                  </Link>
                </li>
                <li className="mt-3 flex items-center gap-2 border-t border-lp-border pt-4">
                  <Button asChild variant="outline" className="w-full rounded-[2px] border-lp-border-strong bg-transparent text-lp-text hover:bg-lp-surface-2">
                    <Link to={ROUTES.LOGIN}>Sign in</Link>
                  </Button>
                  <Button asChild className="w-full rounded-[2px] bg-lp-accent text-lp-accent-ink hover:bg-lp-accent-strong">
                    <Link to={ROUTES.REGISTER}>Start forging</Link>
                  </Button>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}