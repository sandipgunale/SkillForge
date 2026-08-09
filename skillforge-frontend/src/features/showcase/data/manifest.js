import manifest from "./manifest.json";

/* ==========================================================================
   Showcase Facts — the single source of truth for every numeric claim on
   /showcase. Values come from the generated manifest (run
   `node scripts/export-showcase-data.mjs` from the repo root) and are
   asserted fresh by CI gate G1. NEVER hardcode numeric facts in chapter
   copy — import them from here (G2 claim-drift gate).
   ========================================================================== */

export const FACTS = {
  commits: manifest.git.commits,
  authors: manifest.git.authors,
  javaMainFiles: manifest.code.javaMainFiles,
  javaTestFiles: manifest.code.javaTestFiles,
  frontendFiles: manifest.code.frontendFiles,
  migrations: manifest.code.migrations,
  controllers: manifest.code.controllers,
  version: manifest.version,
  latestTag: manifest.git.latestTag,
  firstCommitDate: manifest.git.firstCommitDate,
  lastCommitDate: manifest.git.lastCommitDate,
  generatedAt: manifest.generatedAt,
  perf: manifest.perf,
};

export const MANIFEST = manifest;

/** Human readable snapshot stamp, e.g. "snapshot: 2026-06-25 · v0.1.0.0". */
export const SNAPSHOT_LABEL = `snapshot: ${FACTS.firstCommitDate} · v${FACTS.version}`;

export default manifest;