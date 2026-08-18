import { useRef } from "react";

import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

import { useSectionEntrance } from "../useEntrance";
import { Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  10 · EXPERIENCE — who the forge serves. Three voices, one workspace.     */
/* -------------------------------------------------------------------------- */

const ROLES = [
  {
    voice: "For learners",
    body: "A workspace where finishing is easier than starting: paths drafted, practice scheduled, progress read at a glance.",
    action: { label: "Start forging", to: ROUTES.REGISTER },
  },
  {
    voice: "For instructors",
    body: "Curate resource lists, assign practice, and watch real learning health — not completion theatre.",
    action: { label: "Open the dashboard", to: ROUTES.DASHBOARD },
  },
  {
    voice: "For administrators",
    body: "Workspace-level visibility over paths, practice, and adoption — with role-based access control.",
    action: { label: "Explore roles", to: ROUTES.DASHBOARD },
  },
];

export function ExperienceSection() {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef);

  return (
    <Section id="experience" sectionRef={rootRef} className="bg-lp-surface">
      <div className="max-w-[92vw] lg:max-w-[74%]">
        <p data-entrance="label" className={T.label}>
          <span className="text-lp-faint">10</span> — The experience
        </p>
        <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[16ch]`}>
          Built for everyone{" "}
          <span className="text-lp-muted">who cares how learning goes.</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-5 lg:grid-cols-3" data-entrance="content">
        {ROLES.map((role) => (
          <div key={role.voice} className="lp-panel flex flex-col justify-between p-7">
            <div>
              <p className="font-lp-mono text-[0.6875rem] uppercase tracking-[0.22em] text-lp-accent">
                {role.voice}
              </p>
              <p className={`${T.small} mt-4 text-lp-text`}>{role.body}</p>
            </div>
            <Link
              to={role.action.to}
              className="mt-8 inline-flex w-fit items-center gap-2 font-lp-mono text-[0.6875rem] uppercase tracking-[0.18em] text-lp-muted transition-colors hover:text-lp-accent"
            >
              {role.action.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}