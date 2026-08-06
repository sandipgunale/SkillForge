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
