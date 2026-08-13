import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import AppLogo from "@/components/layout/AppLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ROUTES } from "@/constants/routes";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
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
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
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
