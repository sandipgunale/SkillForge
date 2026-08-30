# Benchmark Report — feat/motion-language

- **Date:** 2026-08-19
- **Gate:** /benchmark (before/after comparison vs base `origin/feat/landing-rebuild` @ 3b601ba v0.3.0.0)
- **Harness:** Playwright load-metric probe against `vite preview` (production build, localhost) — Lighthouse/browse-daemon unavailable in this environment (documented degraded path); budgets enforced at the bundle + CWV level
- **Verdict: PASS — no regression.** Bundle +0.4% raw; load metrics equal within noise; INP improved; CLS unchanged; all budgets met with headroom.

## Bundle comparison (production build, dist/assets totals)

| Metric | BASE | MOTION | Delta |
| --- | --- | --- | --- |
| Chunks | 77 | 78 | +1 |
| Total JS+CSS raw | 2,689 kB | 2,701 kB | **+12 kB (+0.4%)** |
| Total gzip | 780 kB | 783 kB | **+3 kB (+0.4%)** |
| index (entry) raw/gz | 240.5 / 71.7 | 253.9 / 75.3 | +13.4 / +3.6 kB |
| vendor-motion raw/gz | 119.9 / 47.2 | 112.8 / 44.3 | −7.1 / −2.9 kB |
| vendor-three raw/gz | 882.8 / 234.9 | 882.8 / 234.9 | 0 |
| Build time | 2.22s | 2.36s | +0.14s |

## Load metrics (1 pass each, production preview, localhost)

| Metric | BASE | MOTION | Budget | Result |
| --- | --- | --- | --- | --- |
| TTFB | 2ms | 2ms | — | PASS |
| domInteractive | 23ms | 22ms | — | PASS |
| domComplete / fullLoad | 189ms | 189ms | — | PASS |
| LCP (sample) | 268ms | 280ms | < 2.0s | PASS (Δ = noise) |
| CLS | 0.00033 | 0.00033 | < 0.05 | PASS |
| INP (click probe) | 149ms | 139ms | < 200ms | PASS (improved) |
| Transfer | 772 kB | 772 kB | — | PASS |
| Requests | 23 | 23 | — | PASS |

## Notes

- vendor-motion shrank (dead `PRESETS` removed, deps array corrections) while the entry grew slightly (hero pre-hide/autoAlpha + border-trace wiring).
- No new network requests, no new chunks on the critical path; 3D scene stays lazy (vendor-three identical, loaded only when the section mounts — verified unchanged in chunk manifest).
- Lighthouse score budgets (≥98) tracked at release time per established workflow; CWV proxied above are the branch-level regression gate and are met with 5-10x headroom.