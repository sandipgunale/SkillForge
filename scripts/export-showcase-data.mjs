#!/usr/bin/env node
/* ==========================================================================
   SkillForge Showcase — Data Manifest Generator
   --------------------------------------------------------------------------
   T1: single source of truth for every numeric fact on /showcase.

   Facts are GENERATED from the repo, never hand-edited. The frontend
   imports manifest.json; CI gates (G1..G4) run this same generator in
   --check mode to catch drift.

   Usage (from repo root; Node 18+; git on PATH):
     node scripts/export-showcase-data.mjs            # write manifest.json
     node scripts/export-showcase-data.mjs --check    # diff + exit 1 on drift
   ========================================================================== */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "skillforge-frontend", "src", "features", "showcase", "data", "manifest.json");
const BACKEND = join(ROOT, "skillforge-backend", "skillforge-backend");
const FRONTEND_SRC = join(ROOT, "skillforge-frontend", "src");
const MIGRATIONS_DIR = join(BACKEND, "src", "main", "resources", "db", "migration");

/* ----------------------------- helpers -------------------------------- */

function git(args, opts = {}) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

function gitTry(args) {
  try {
    return git(args);
  } catch {
    return "";
  }
}

function countFiles(dir, exts) {
  if (!existsSync(dir)) return 0;
  let count = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (exts.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
        count += 1;
      }
    }
  }
  return count;
}

function countControllers() {
  const dir = join(BACKEND, "src", "main", "java");
  if (!existsSync(dir)) return 0;
  let count = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.name.endsWith(".java")) {
        const src = readFileSync(full, "utf8");
        if (/@Rest(Controller|Controller)\b/.test(src)) count += 1;
      }
    }
  }
  return count;
}

/* --------------------- recorded perf (benchmark report) ------------------ */

function readBenchmarkReport() {
  const dir = join(ROOT, ".gstack", "benchmark-reports");
  if (!existsSync(dir)) return null;
  const reports = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.includes("baseline"))
    .sort()
    .reverse();
  if (!reports.length) return null;
  try {
    return readFileSync(join(dir, reports[0]), "utf8");
  } catch {
    return null;
  }
}

function reportDate() {
  const d = readBenchmarkReport() && readBenchmarkReport().match(/(\d{4}-\d{2}-\d{2})/);
  return d ? d[1] : null;
}

function collectPerf() {
  const text = readBenchmarkReport() ?? "";
  const grab = (label) => {
    const re = new RegExp(`\\|\\s*${label}\\s*\\|[^|]*\\|\\s*([^|]+?)\\s*\\|`);
    const m = text.match(re);
    return m ? m[1]?.trim() : null;
  };
  const fcpRaw = grab("FCP") ?? "";
  const lcpRaw = grab("LCP") ?? "";
  const fcpMs = fcpRaw.match(/\d+–\d+ms|[\d.]+ms/)?.[0] ?? fcpRaw;
  const lcpMs = lcpRaw.match(/\d+–\d+ms|[\d.]+ms/)?.[0] ?? lcpRaw;
  const transfer = text.match(/Total first-visit:\s*\*{0,2}(\d+)KB/);
  return {
    recordedIn: reportDate(),
    fcp: fcpMs,
    lcp: lcpMs,
    landingTransferKb: transfer ? transfer[1] : null,
  };
}

/* ----------------------------- collect --------------------------------- */

function collect() {
  const gitLog = gitTry(["log", "--format=%h"]);
  const commits = gitLog ? gitLog.split("\n").filter(Boolean).length : 0;

  const shortlog = gitTry(["shortlog", "-sn", "--all"]);
  const authors = shortlog ? shortlog.split("\n").filter(Boolean).length : 0;

  const tags = (gitTry(["tag"]) || "")
    .split("\n")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const firstCommit = gitTry(["log", "--reverse", "--format=%ad", "--date=short"]).split("\n")[0] || null;
  const lastCommit = gitTry(["log", "-1", "--format=%cs"]) || null;

  let version = "unknown";
  try {
    version = readFileSync(join(ROOT, "VERSION"), "utf8").trim() || version;
  } catch {
    /* VERSION missing — fall back (deploy artifact expectations govern) */
  }

  return {
    generatedAt: new Date().toISOString(),
    version,
    git: {
      branch: gitTry(["branch", "--show-current"]) || null,
      commits,
      authors,
      tags,
      latestTag: tags[tags.length - 1] ?? null,
      firstCommitDate: firstCommit,
      lastCommitDate: lastCommit,
    },
    code: {
      javaMainFiles: countFiles(join(BACKEND, "src", "main", "java"), new Set([".java"])),
      javaTestFiles: countFiles(join(BACKEND, "src", "test"), new Set([".java"])),
      frontendFiles: countFiles(FRONTEND_SRC, new Set([".jsx", ".js", ".tsx", ".ts"])),
      migrations: countFiles(MIGRATIONS_DIR, new Set([".sql"])),
      controllers: countControllers(),
    },
    perf: collectPerf(),
  };
}

/* ------------------------------ actions ------------------------------- */

function build() {
  const manifest = collect();
  writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function check() {
  if (!existsSync(OUT)) {
    console.error("G1 FAIL: manifest missing — run `node scripts/export-showcase-data.mjs` first.");
    process.exit(1);
  }
  let checkedIn;
  try {
    checkedIn = JSON.parse(readFileSync(OUT, "utf8"));
  } catch (err) {
    console.error(`G1 FAIL: manifest.json unreadable: ${err.message}`);
    process.exit(1);
  }
  const fresh = collect();
  const comparable = (m) => {
    const { generatedAt, git, ...rest } = m;
    const { branch, ...gitRest } = git ?? {};
    return JSON.stringify({ ...rest, git: gitRest });
  };
  const drift = comparable(checkedIn) !== comparable(fresh);
  if (drift) {
    console.error("G1 FAIL: manifest drift detected. Regenerate and commit:");
    console.error("  node scripts/export-showcase-data.mjs");
    console.error(`  generated: ${fresh.git.commits} commits, ${fresh.code.javaMainFiles} java, ${fresh.code.frontendFiles} frontend`);
    console.error(`  checked-in: ${checkedIn.git?.commits} commits, ${checkedIn.code?.javaMainFiles} java, ${checkedIn.code?.frontendFiles} frontend`);
    process.exit(1);
  }
  console.log(`G1 PASS: manifest fresh (${checkedIn.git.commits} commits · ${checkedIn.code.javaMainFiles} java · ${checkedIn.code.frontendFiles} frontend · ${checkedIn.code.migrations} migrations)`);
}

/* ------------------------------- main ---------------------------------- */

const mode = process.argv.includes("--check") ? "check" : "build";
if (mode === "check") {
  check();
} else {
  const m = build();
  console.log(`manifest.json written: ${OUT}`);
  console.log(`  ${m.git.commits} commits | ${m.code.javaMainFiles} java main | ${m.code.frontendFiles} frontend | ${m.code.migrations} migrations | v${m.version}`);
}