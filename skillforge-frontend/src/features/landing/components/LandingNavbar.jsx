import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import AppLogo from "@/components/layout/AppLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { slotVersion } from "../experience/forge/geometry";

const NAV_LINKS = [
  { label: "Problem", href: "#what-is" },
  { label: "Method", href: "#how-it-works" },
  { label: "AI", href: "#architecture" },
  { label: "Roles", href: "#experience" },
  { label: "FAQ", href: "#faq" },
];

const SHOWCASE_LINK = { label: "For recruiters", to: ROUTES.SHOWCASE };

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const rafRef = useRef(0);

  useEffect(() => {
    /* One rAF-throttled scroll listener drives both states — no React
       render per scroll event, and marker positions are cached (the fold
       re-publishes geometry; we refresh on resize/fonts, never per event).
       In the Forge Fold every sheet is pinned to the viewport top, so the
       current section is the one whose STATIC slot has been scrolled past —
       the cached slot model carries those positions (untouched by the pin
       transforms). In the static reduced-motion layout there are no markers,
       so fall back to the sections' document positions, measured once. */
    const topsRef = { values: null, version: -1 };

    const readTops = () => {
      const fold = document.querySelector(".forge-fold");
      if (fold) {
        /* Fold mode: the fold controller itself positions the anchor markers
           (style.top — a string read, zero layout). Track the slot-cache
           version so we refresh when the fold re-measures (resize, accordion
           growth, fonts). */
        const tops = {};
        for (const link of NAV_LINKS) {
          const id = link.href.slice(1);
          const marker = document.querySelector(`[data-anchor="${id}"]`);
          tops[id] = marker ? parseFloat(marker.style.top) || 0 : Infinity;
        }
        topsRef.values = tops;
        topsRef.version = slotVersion();
        return;
      }
      topsRef.values = {};
      for (const link of NAV_LINKS) {
        const id = link.href.slice(1);
        const section = document.querySelector(`section#${id}`);
        topsRef.values[id] = section
          ? section.getBoundingClientRect().top + window.scrollY
          : Infinity;
      }
      topsRef.version = slotVersion();
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const y = window.scrollY;
        setScrolled(y > 12);
        if (!topsRef.values || topsRef.version !== slotVersion()) readTops();
        let current = null;
        for (const link of NAV_LINKS) {
          const id = link.href.slice(1);
          if (topsRef.values[id] <= y + 1) current = id;
        }
        setActiveId(current);
      });
    };
    const onResize = () => {
      topsRef.values = null;
      onScroll();
    };

    onScroll();
    readTops();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        topsRef.values = null;
        onScroll();
      });
    }
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			/* Zero the id: the ref survives StrictMode's double mount, and a
			   stale non-zero id would make the next mount's guard block the
			   rAF forever. */
			rafRef.current = 0;
		};
  }, []);

  const linkClass = (active) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b" : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-6 px-6 lg:px-10"
        aria-label="Main navigation"
      >
        <AppLogo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = activeId === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active ? "true" : undefined}
                  className={linkClass(active)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          <li>
            <Link
              to={SHOWCASE_LINK.to}
              className="rounded-full px-3.5 py-2 font-mono text-xs uppercase tracking-[0.08em] text-ember transition-colors hover:bg-accent hover:text-ember/80"
            >
              {SHOWCASE_LINK.label}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle align="end" />

          <Link
            to={ROUTES.LOGIN}
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:block"
          >
            Sign in
          </Link>

          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to={ROUTES.REGISTER}>Start free</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-1 pt-2">SkillForge</SheetTitle>
              <ul className="mt-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = activeId === link.href.slice(1);
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? "true" : undefined}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
                    className="block rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-ember transition-colors hover:bg-accent hover:text-ember/80"
                  >
                    {SHOWCASE_LINK.label}
                  </Link>
                </li>
                <li className="mt-3 flex items-center gap-2 border-t pt-4">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to={ROUTES.LOGIN}>Sign in</Link>
                  </Button>
                  <Button asChild className="w-full rounded-full">
                    <Link to={ROUTES.REGISTER}>Start free</Link>
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
