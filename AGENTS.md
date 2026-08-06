# AGENTS.md — SkillForge AI Engineering Workflow

## GStack

This repository uses GStack as the standard AI engineering workflow.

- Always use the GStack browser (/browse) for browser automation.
- Prefer GStack workflows over ad-hoc implementations.
- Never bypass review workflows.
- Use GStack skills whenever applicable.

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.config/opencode/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
> cd ~/gstack && ./setup --host opencode
> (cd ~/gstack && ./setup --team)
> ~/gstack/bin/gstack-team-init required
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/gstack/... for gstack file paths (the global path).

### Registered Skills

The following GStack skills are available for this repository:

- /office-hours — product/idea incubation
- /plan-ceo-review — business/strategy review of plans
- /plan-eng-review — architecture review of plans
- /plan-design-review — UX/design review of plans
- /plan-devex-review — developer-experience review of plans
- /design-consultation — design advice
- /design-shotgun — UI exploration/ideation
- /design-html — approved mockup to production code
- /review — code review
- /design-review — design review
- /cso — security audit
- /autoplan — plan generation from an idea
- /qa — QA testing workflow
- /qa-only — run QA checks without fixes
- /benchmark — performance audit
- /ship — ship checklist and release
- /land-and-deploy — deploy workflow
- /canary — post-release monitoring
- /document-release — release documentation
- /document-generate — generate docs
- /investigate — bug investigation
- /retro — weekly improvements retrospective
- /browse — browser automation
- /setup-browser-cookies — cookie setup for browser automation
- /setup-deploy — deploy configuration
- /setup-gbrain — gbrain (context memory) setup
- /careful — slow, careful mode
- /freeze — freeze a skill/behavior
- /guard — guardrails for AI work
- /unfreeze — unfreeze a skill/behavior
- /gstack-upgrade — upgrade gstack
- /learn — learn a new skill
- /codex — codex integration

## Standard Engineering Workflow

Every significant task must follow this workflow:

```
Idea
  ↓
/office-hours
  ↓
/autoplan
  ↓
/plan-ceo-review
  ↓
/plan-design-review
  ↓
/plan-eng-review
  ↓
Implementation
  ↓
/review
  ↓
/cso
  ↓
/qa
  ↓
/benchmark
  ↓
/document-release
  ↓
/ship
```

No feature should skip planning, review, QA, or documentation.

## Mandatory Usage Rules

Before implementing any feature:

1. Run /office-hours (idea incubation)
2. Run /autoplan (generate plan)
3. Review architecture with /plan-eng-review
4. Review UX with /plan-design-review
5. Implement
6. Review code with /review
7. Security audit with /cso
8. QA with /qa
9. Performance with /benchmark
10. Update documentation with /document-release
11. Ship with /ship

## Skill Usage Matrix

| Task | Skill |
| --- | --- |
| Product ideas | /office-hours |
| Architecture | /plan-eng-review |
| Design System | /plan-design-review |
| UI Exploration | /design-shotgun |
| Convert approved mockup into production code | /design-html |
| Code Review | /review |
| Security Audit | /cso |
| Bug Investigation | /investigate |
| QA Testing | /qa |
| Performance Audit | /benchmark |
| Documentation | /document-release |
| Release | /ship |
| Post Release Monitoring | /canary |
| Weekly Improvements | /retro |

## SkillForge Specific Rules

For THIS project, always use:

| Area | Skill |
| --- | --- |
| Landing Page | /design-shotgun |
| Dashboard | /design-shotgun |
| Authentication Pages | /plan-design-review |
| Learning Roadmap | /plan-eng-review |
| AI Module | /cso |
| Quiz Engine | /review |
| Analytics | /benchmark |
| Profile | /design-review |

Every UI redesign must go through:

```
design-shotgun
  ↓
design review
  ↓
design-html
```

before implementation.

## Repository Layout

- Repo root: `D:\OpenCode\SkillForge\SkillForge`
- Backend (nested Maven project): `skillforge-backend/skillforge-backend`
  - Build with PowerShell: `.\mvnw.cmd -q compile` / `.\mvnw.cmd test` / `.\mvnw.cmd verify` (JaCoCo gate enforced)
- Backend module layout: `src/main/java/com/project/skillforgebackend/<feature>/` (auth, quiz, learningpath, analytics, ai, bookmark, rating, gamification, resource, admin, common, config)
- AI subsystem: `ai/` (client, resilience, service, guardrail, exception) + `config/properties/` (GeminiProperties, AiResilienceProperties)
