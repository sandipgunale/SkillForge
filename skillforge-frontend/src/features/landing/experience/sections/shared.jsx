import { Component, useRef } from "react";

import { useSectionEntrance } from "../useEntrance";

import { T } from "./type";

export { T } from "./type";

/* -------------------------------------------------------------------------- */
/*  Shared section scaffolding — the editorial chapter layout for the         */
/*  Foundry Precision landing (see DESIGN.md → Landing).                      */
/* -------------------------------------------------------------------------- */

/**
 * SceneErrorBoundary — degrades gracefully if a lazy 3D scene chunk fails
 * to load or throws (renders its children as null instead of crashing the
 * section). Decorative scenes only — copy and CTAs never live inside it.
 */
export class SceneErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* Swallow silently: the scene is decorative, the fallback is null. */
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Chapter — statement-first editorial section body: mono label above a
 * display statement, lead + content below, optional aside column.
 * Wires the entrance choreography via data-entrance attributes.
 */
export function Chapter({ num, label, title, lead, children, aside, variant = "rise" }) {
  const rootRef = useRef(null);
  useSectionEntrance(rootRef, { variant });

  return (
    <div ref={rootRef} className="grid gap-12 lg:gap-16">
      <div className="max-w-[92vw] lg:max-w-[80%]">
        <p data-entrance="label" className={T.label}>
          <span className="text-lp-faint">{num}</span> — {label}
        </p>
        <h2 data-entrance="head" className={`${T.h2} mt-5`}>
          {title}
        </h2>
      </div>
      <div
        className={`grid gap-12 lg:gap-16 ${aside ? "lg:grid-cols-[1.3fr_1fr]" : "max-w-[72ch]"}`}
      >
        <div>
          <p data-entrance="lead" className={T.body}>
            {lead}
          </p>
          <div data-entrance="content">{children}</div>
        </div>
        {aside ? <div data-entrance="aside" className="flex flex-col">{aside}</div> : null}
      </div>
    </div>
  );
}

/** Section — native-flow wrapper with the standard vertical rhythm. */
export function Section({ id, children, className = "", sectionRef }) {
  return (
    <section
      ref={sectionRef}
      id={id}
      data-landing-section={id}
      className={`relative ${className}`}
    >
      <div className="lp-container py-[clamp(56px,9vw,120px)]">{children}</div>
    </section>
  );
}