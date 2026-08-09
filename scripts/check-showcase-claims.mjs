/* --------------------------------------------------------------------------
   G2 — claim-drift guard for /showcase.

   Numeric claims a recruiter READS on the showcase must come from the
   FACTS manifest, never be hardcoded in component copy. This script scans
   string literals in showcase sources and fails on digits that are not
   denied or structurally benign.

   Skip rules (benign):
   - digits <= 9 (ordinals, sizes of first-digit)
   - deny-list tokens (stack versions, budgets, ops constants — keep tiny)
   - className/CSS utility literals (kebab tokens, "/" ratios)
   - opaque data tokens (base64 JWTs, hashes, tags)
   - code/sample blocks (contain "{" or "==")
   -------------------------------------------------------------------------- */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SHOWCASE = join(ROOT, "skillforge-frontend", "src", "features", "showcase");

const DENY = new Set([
  "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "V1", "V20",
  "19", "8", "3",
  "15", "30", "7", "20",
  "98", "1.5", "2.0", "0.05",
  "sprint-5-complete", "v0.3.0", "v0.2.0", "v0.1.0",
]);

const CSS_PREFIXES = [
  "text-", "bg-", "border-", "rounded", "shadow", "font-", "tracking-",
  "gap-", "grid-", "px-", "py-", "pb-", "pt-", "pl-", "pr-", "ps-", "pe-",
  "p-", "m-", "mt-", "mb-", "ml-", "mr-",
  "h-", "w-", "min-", "max-", "opacity-", "fill-", "stroke-", "scroll-",
  "z-", "blur-", "scale-", "translate-", "rotate-", "space-", "divide-",
  "items-", "justify-", "content-", "self-", "peer-", "group-", "backdrop",
  "-left-", "rounded-", "uppercase", "aria-", "data-", "hover:", "focus:",
  "focus-visible:", "active:", "disabled:", "sm:", "md:", "lg:", "xl:",
  "from-", "to-", "via-", "after:", "before:", "last:", "first:", "odd:",
  "size-", "w-full", "w-fit", "left-", "right-", "top-", "bottom-", "inset-",
  "mx-", "my-",
];

function maybeCssToken(token) {
  return (
    (token.includes("-") || token.includes("/") || token.includes("%")) &&
    /^[a-z0-9[\]/()%#:._;,!-]+$/i.test(token) &&
    (CSS_PREFIXES.some((p) => token.startsWith(p)) ||
      /^[a-z]+\/\d+/.test(token) ||
      /^-\w/.test(token) ||
      token.includes("%"))
  );
}

function opaqueData(literal) {
  return (
    literal.length >= 8 &&
    !/\s/.test(literal) &&
    /^[A-Za-z0-9._-]+$/.test(literal) &&
    !/^[A-Za-z]+$/.test(literal)
  );
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else if (/\.(jsx?|tsx?)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function fail(message) {
  console.error(`G2 FAIL: ${message}`);
  process.exit(1);
}

let drift = 0;

for (const file of walk(SHOWCASE)) {
  const src = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  for (const m of src.matchAll(/[`"']([^`"'\n]{2,})[`"']/g)) {
    const raw = m[1];
    if (!/\d/.test(raw)) continue;
    const body = raw.replace(/\$\{[^}]{1,120}\}/g, "");
    if (!/\d/.test(body)) continue;
    if (body.includes("{")) continue;                       // code/sample block
    if (raw.includes("import ") || raw.includes("@/")) continue;
    if (opaqueData(body)) continue;

    const tokens = body.split(/\s+/);
    const numbers = [];
    for (const token of tokens) {
      if (maybeCssToken(token)) continue;
      for (const n of token.match(/\d+(\.\d+)?/g) ?? []) {
        if (DENY.has(n)) continue;
        if (Number(n) <= 9 && Number.isInteger(Number(n))) continue;
        numbers.push(n);
      }
    }
    if (!numbers.length) continue;

    console.error(`  drift: ${file.replace(ROOT, ".")} literal "${body.slice(0, 90)}"`);
    drift += 1;
  }
}

if (drift > 0) fail(`${drift} hardcoded numeric claim(s) in showcase copy. Move them into manifest.json + FACTS.`);
console.log("G2 PASS: no hardcoded numeric claims outside the deny-list.");