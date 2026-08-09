/* --------------------------------------------------------------------------
   G4 — showcase chunk gzip budget.

   Builds the frontend (fast, incremental) and measures the ShowcasePage
   chunk. Fails if the raw JS or its gzip size breaks the budget. The
   showcase must stay a cheap, recruiter-facing page load.
   -------------------------------------------------------------------------- */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const FE = join(ROOT, "skillforge-frontend");
const DIST = join(FE, "dist", "assets");

const BUDGETS = { gzipKb: 12, rawKb: 200 };

function fail(message) {
  console.error(`G4 FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(DIST)) {
  execSync("npm run build", { cwd: FE, stdio: "inherit" });
}

const files = readdirSync(DIST).filter((f) => /^ShowcasePage-.*\.js$/.test(f));
if (!files.length) {
  fail("ShowcasePage chunk not found — did the build emit it?");
}

const chunk = files[0];
const raw = readFileSync(join(DIST, chunk));
const gzip = gzipSync(raw).length;

console.log(`  ${chunk}: ${(raw.length / 1024).toFixed(2)} kB raw, ${(gzip / 1024).toFixed(2)} kB gzip`);

if (gzip / 1024 > BUDGETS.gzipKb) fail(`gzip ${(gzip / 1024).toFixed(2)} kB > ${BUDGETS.gzipKb} kB budget`);
if (raw.length / 1024 > BUDGETS.rawKb) fail(`raw ${(raw.length / 1024).toFixed(2)} kB > ${BUDGETS.rawKb} kB budget`);

console.log(`G4 PASS: showcase chunk within budget (${BUDGETS.gzipKb} kB gzip / ${BUDGETS.rawKb} kB raw).`);