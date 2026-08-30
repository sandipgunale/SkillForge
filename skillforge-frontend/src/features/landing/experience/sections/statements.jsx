import { Chapter, Section, T } from "./shared";

/* -------------------------------------------------------------------------- */
/*  01 · PROBLEM — the editorial statement. 02 · SHIFT — the direction turn. */
/*  Both are quiet statement sections: a mono numeral, one display line,      */
/*  a short lead. No stats, no grids — the landing sells transformation.     */
/* -------------------------------------------------------------------------- */

export function ProblemSection() {
  return (
    <Section id="problem" motion="claim" className="bg-lp-bg">
      <Chapter
        num="01"
        label="The problem"
        title={
          <>
            More information doesn&rsquo;t create more{" "}
            <span className="text-lp-muted">skill.</span>
          </>
        }
        lead="Bookmarks, tabs, saved posts, endless search results — the web hands you raw material by the terabyte and calls it learning. You collect resources the way a scrap yard collects metal: pile after pile, nothing forged."
        aside={
          <div className="mt-2 flex flex-col gap-3 border-l-2 border-lp-border pl-6">
            <p className={`${T.small} font-lp-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lp-faint`}>
              The pile grows
            </p>
            <p className={T.small}>
              A library of unread bookmarks is not progress. It is deferred
              decision-making — and it compounds.
            </p>
          </div>
        }
      />
    </Section>
  );
}

export function ShiftSection() {
  return (
    <Section id="shift" motion="claim" className="bg-lp-surface">
      <Chapter
        num="02"
        label="The shift"
        title={
          <>
            Direction, not{" "}
            <span className="text-lp-accent">information.</span>
          </>
        }
        lead="The raw material already exists — courses, articles, docs, repos. What's missing is direction: a path that sequences what you learn, a workspace that holds it all, and feedback that tells you whether you actually learned it."
        aside={
          <div className="mt-2 flex flex-col gap-3 border-l-2 border-lp-border pl-6">
            <p className={`${T.small} font-lp-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lp-accent`}>
              The forge takes over
            </p>
            <p className={T.small}>
              One workspace. One sequence. One measure of momentum. Everything
              else gets out of the way.
            </p>
          </div>
        }
      />
    </Section>
  );
}