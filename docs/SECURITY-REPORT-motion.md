# Security Posture Report — feat/motion-language

- **Date:** 2026-08-19
- **Gate:** /cso (daily mode, 8/10 confidence gate), scoped to branch diff vs `origin/feat/landing-rebuild`
- **Scope:** frontend-only motion/animation branch (30 source files + 2 docs; no backend/auth/AI-module changes)
- **Mode:** `--diff` + `--code` + `--supply-chain` (Phases 0-3, 8-9, 12-14)
- **Tooling:** git-native scans (Grep/Read/Node scripts; POSIX skill preamble not runnable under PowerShell 5.1)

## Executive Summary

**PASS — no High, Medium, or Low findings.** 2 Info-level defense-in-depth hardening notes (both in unchanged files, fed by this branch's data). The branch is pure animation/motion code with zero HTML sinks, zero dynamic URL construction, and zero untrusted-data DOM writes.

## Phase 0 — Stack & Mental Model

- **Stack:** Spring Boot 3 (Java 21, Maven, JaCoCo gate) + Vite 8 / React 19 (ESM, code-split routes, lazy Three.js scene chunk). PostgreSQL 16. Node 26 / npm 12 toolchain.
- **Branch surface:** all 32 changed files are frontend (`skillforge-frontend/src/**` + `docs/` + `DESIGN.md`). No backend, auth, AI, SQL, or Flyway changes. Trust boundary unchanged: this branch adds no new input surfaces.
- **Data flow:** no new user input enters the changed code. All dynamic values are geometry/pointer/scroll math (numbers) or static developer-authored copy.

## Phase 1 — Repo / CI / Env Hygiene

- `.gitignore` (root + frontend) ignores `.env`, `.env.*` with `!.env.example` whitelist. **Clean.**
- Only `.env.example` tracked (verified `git ls-files`); contents are placeholder values only (`change-me`, `your-*`). **Clean.**
- `.github/workflows/ci.yml`: no secrets in workflow, no secret logging, runs `mvn verify` (tests + failsafe ITs + JaCoCo), `npm ci` (lockfile-driven), lint `--max-warnings 0`, build, and showcase gates (manifest freshness, claim drift, snapshot staleness, gzip budget). Pinned action versions by major tag.
- `docker-compose.yml`: secrets injected via environment (`${DB_PASSWORD}`, `${JWT_SECRET:?required}`, `${GEMINI_API_KEY}`) — nothing hardcoded. `COOKIE_SECURE: "false"` is a local-dev default (documented).
- **Hardening gaps (Info):** no dependency-scan step in CI (Dependabot / npm audit / OSSF Scorecard / CodeQL all absent).

## Phase 2 — Git History Secrets Archaeology

- Full-history scan (90 commits, `git log --all -p --full-history`) for `api_key|secret|password|token|jwt|bearer|private_key = "…16+ chars…"`: **0 hits**.
- Source-tree scan (git-tracked files only) for AIza/sk-/eyJ patterns + generic key assignments: **3 hits, all benign**:
  - `JwtServiceTest.java` — `TEST_SECRET` test fixture (JUnit constant, test sources only).
  - `showcase/AuthSection.jsx` — demo JWT header/payload strings for the marketing showcase (no signature, no secret).
  - `package-lock.json` — npm `integrity` sha512 hashes (false positive).

## Phase 3 — Dependency Supply Chain

- `npm audit --audit-level=high`: **0 vulnerabilities.**
- `package-lock.json` committed → reproducible `npm ci` in CI. Production deps all current majors (react 19.2, vite 8.1, gsap 3.15, three 0.185, @react-three/fiber 9.6).
- No external script tags / CDN includes in `index.html` — bundle is fully first-party + npm.
- **Hardening gap (Info):** add `npm audit`/Dependabot to CI; Dependabot not configured.

## Phase 8 — Skill / Build Supply Chain

- gstack skills live outside the repo (`~/.config/opencode/skills`) — not bundled into the shipped artifact. No `postinstall` scripts pulling remote code in frontend deps (verified via lockfile; no suspicious lifecycle scripts detected in production dependency set).
- **Info:** review CI action hashes (`actions/checkout@v4` etc. are tag-pinned, not SHA-pinned) for supply-chain hardening.

## Phase 9 — OWASP Top 10 (client-side, changed code)

| Category | Verdict |
| --- | --- |
| A03 XSS (`dangerouslySetInnerHTML`/`innerHTML`/`eval`/`document.write`) | OK — 0 sinks repo-wide; all dynamic text via JSX/`textContent` |
| Data-attribute / handler injection (spotlight, border-trace) | OK — numeric math only; `textContent` writes are non-HTML |
| Reverse tabnabbing (`target="_blank"` w/o rel) | OK — 0 in changed files; 4 repo-wide, all `noopener noreferrer` |
| Open redirect / dynamic `href`/`location` | OK — static routes only; blob-URL export revoked after click |
| URL scheme injection (`javascript:`/`mailto:`/`tel:`) | OK — 0 repo-wide; React blocks `javascript:` in href |
| Canvas/WebGL tainting / pixel readback | OK — self-painted canvases only, no external images, no `toDataURL` |
| CSS injection via style strings | OK — numeric geometry values only; malformed values degrade to CSS defaults |
| postMessage | OK — 0 usage |
| Storage→DOM (localStorage/sessionStorage) | OK — changed files touch no storage API |

**Info findings (defense-in-depth, unchanged files):**
- **F1 (Info)** — `useEntrance.js:156` `padStart(Number(el.dataset.pad))`: non-numeric/oversized `data-pad` could throw `RangeError` in the scroll rAF loop (client-side availability). Currently unreachable (call sites use `data-to` only). Harden with `Number.isFinite` clamp.
- **F2 (Info)** — `Markdown.jsx:35`: link renderer escapes HTML but does not scheme-allowlist URLs; `AICopilot.jsx:377` feeds AI-generated roadmap text into it. Mitigated by React's `javascript:` blocking + escaping + noopener; recommend `^https?:` scheme allowlist.

## Phase 12-14 — Remediation Plan

**Required (0 items):** none — no High/Med/Low findings; gate passes.

**Recommended hardening backlog (M8 / future, Info priority):**
1. Add `npm audit` step + Dependabot (npm + Maven) to CI.
2. SHA-pin GitHub Actions (or use dependabot action-version updates).
3. Add URL scheme allowlist in `Markdown.jsx` link branch.
4. Clamp `data-pad` parsing in `useEntrance.js` with `Number.isFinite`.

## Verdict

**SECURITY PASS** — `feat/motion-language` introduces no exploitable client-side surface. All 8/10-gate checks clean. 0 High / 0 Medium / 0 Low / 2 Info (hardening backlog).