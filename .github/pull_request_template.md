## Description

<!-- What changes are in this PR and why? Link to the /autoplan output and plan
     review gates (/plan-ceo-review, /plan-eng-review, /plan-design-review,
     /plan-devex-review) where applicable. -->

## Changes

<!-- List the files/areas touched. -->

## Mandatory Gates

Every item below MUST be checked before requesting review. If one does not
apply, state why.

- [ ] **Workflow**: The feature followed /office-hours -> /autoplan -> plan
      reviews -> implementation before this PR (unless this PR *is* that work).
- [ ] **Engineering review** (/review) passed — no duplicated logic, no code
      smells, SOLID/Clean Architecture respected.
- [ ] **Security review** (/cso) passed — no secrets, injection resistance for
      AI inputs, no internal leakage in error responses.
- [ ] **Design review** (for anything user-facing) — /design-review passed.
- [ ] **Benchmark** (/benchmark) comparison done for performance-sensitive
      changes; frontend stays within the perf budget (Lighthouse >= 98, LCP <
      2.0s, INP < 200ms, CLS < 0.05).
- [ ] **Tests passing**: backend `mvn verify` (ITs + JaCoCo gate), frontend
      `npm run build` + `npm run lint` (zero warnings).
- [ ] **QA** (/qa) completed.
- [ ] **Documentation** (/document-release) updated.
- [ ] **Cleanliness**: no build/lint warnings, no TS errors, no Spring Boot
      startup warnings, no dead code, no TODO comments, no commented-out code,
      no unused imports.
- [ ] New feature verified manually (not just by tests).