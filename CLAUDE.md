## gstack (REQUIRED — global install)

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

See AGENTS.md for the full workflow: Standard Engineering Workflow,
Mandatory Usage Rules, Skill Usage Matrix, and SkillForge Specific Rules.

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
The landing page follows the "Foundry Precision" system (see DESIGN.md); the
showcase follows "Ember Forge".

## Health Stack

- typecheck: vite build (JSX frontend; no TS)
- lint: eslint . (frontend; must be warning-free)
- test: .\mvnw.cmd verify (backend; unit + failsafe ITs + JaCoCo gate)

