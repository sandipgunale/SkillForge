import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

import { ROUTES } from "@/constants/routes";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Method", href: "#method" },
      { label: "AI practice", href: "#ai" },
      { label: "Roles", href: "#roles" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Dashboard", href: ROUTES.DASHBOARD },
      { label: "Resources", href: ROUTES.RESOURCES },
      { label: "Quiz history", href: ROUTES.QUIZ_HISTORY },
      { label: "Bookmarks", href: ROUTES.BOOKMARKS },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: ROUTES.LOGIN },
      { label: "Create account", href: ROUTES.REGISTER },
      { label: "Profile", href: ROUTES.PROFILE },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto max-w-screen-2xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame className="size-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">SkillForge</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The distraction-free learning workspace. Structured paths,
              AI-powered practice, and momentum you can measure — everything
              you need to actually finish what you start.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-sm font-semibold">{column.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

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
