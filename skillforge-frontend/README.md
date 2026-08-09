# SkillForge Frontend

React 19 + Vite 8 frontend for the SkillForge learning platform. Pair with the
backend (`skillforge-backend/skillforge-backend`); the backend serves OpenAPI docs
at `http://localhost:8080/swagger-ui.html`, with the full endpoint reference in
`docs/API_REFERENCE.md` (repo root).

> **For recruiters:** `/showcase` — an engineering walkthrough (architecture,
> auth, AI, performance) backed by an auto-generated repo manifest. Entry link
> "For recruiters" in the landing navbar.

## Stack

- React 19.2, Vite 8, react-router-dom 7, TanStack Query 5, Zustand (persist)
- Tailwind 4 (`@tailwindcss/vite`), Base UI (shadcn-style), GSAP motion system,
  Three.js/R3F (lazy-loaded premium scenes), recharts
- react-hook-form + zod, sonner
- Design tokens live in `src/lib/design-system.js`; ALL animation is centralized
  in `src/lib/motion-gsap.js` (see AGENTS.md — GSAP Motion System, Three.js System).

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (default
`http://localhost:8080/api`). Frontend runs on `http://localhost:5173`.

## Scripts

```bash
npm run dev          # Vite dev server (HMR)
npm run build        # production build (Route + 3D scenes code-split)
npm run preview      # serve the production build (default http://localhost:4173)
npm run lint         # ESLint — must be warning-free before merge
```

## Performance Budgets

See AGENTS.md — Lighthouse >= 98, FCP < 1.5 s, LCP < 2.0 s, INP < 200 ms,
CLS < 0.05. Routes and heavy 3D scenes are lazy-loaded; keep the JS bundle
minimized and re-check with `/benchmark` on performance-sensitive PRs.

## Project Structure

```
src/
  features/    # feature modules (auth, quiz, resources, workspace, ...)
  layouts/     # Landing / Auth / Main app shells
  lib/         # design-system.js, motion-gsap.js, three-engine.js, chart-colors.js
  routes/      # route definitions (lazy) + guards
  services/    # shared API layer (axios + interceptors — unwraps ApiResponse, refresh)
  store/       # authStore (in-memory session + refresh rotation)
```