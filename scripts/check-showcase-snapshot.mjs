/* --------------------------------------------------------------------------
   G3 — snapshot staleness guard.

   The showcase snapshot line must reflect the repo as of today. If the
   manifest's git.lastCommitDate differs from the actual latest commit
   date (or the manifest is older than the last commit), the page is
   showing stale numbers — fail the build.
   -------------------------------------------------------------------------- */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MANIFEST = join(ROOT, "skillforge-frontend", "src", "features", "showcase", "data", "manifest.json");

function fail(message) {
  console.error(`G3 FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(MANIFEST)) {
  fail("manifest.json missing. Run `node scripts/export-showcase-data.mjs` first.");
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const lastCommit = execSync("git log -1 --format=%cs", { cwd: ROOT }).toString().trim();

if (manifest.git.lastCommitDate !== lastCommit) {
  fail(
    `manifest.lastCommitDate=${manifest.git.lastCommitDate} but repo HEAD commit date is ${lastCommit}. ` +
      "Regenerate: `node scripts/export-showcase-data.mjs`.",
  );
}

const manifestDay = manifest.generatedAt.slice(0, 10);
const now = new Date().toISOString().slice(0, 10);
if (manifestDay !== now) {
  console.warn(`  note: manifest generated ${manifestDay} (today is ${now}) — fresh only if no commits landed since.`);
}

console.log(`G3 PASS: snapshot covers HEAD (${lastCommit}).`);