# Codex Tooling

Codex should use the same UDD status, verification, and review contracts as
other agents. This directory documents Codex-side hooks and tooling for
UDD-driven development sessions.

## Session Hook

Install the Codex hook into an external UDD project:

```bash
udd hooks install-codex
```

New projects can opt in during initialization:

```bash
udd init --codex-hooks
```

Installed files:

- `.codex/hooks.json`
- `.codex/hooks/pre-task.sh`

The hook is advisory and does not block work. It surfaces the same baseline
health checks available in UDD projects:

- `udd status`
- `udd status --doctor`
- `git status --short`

## Shared Utility Path

Codex tooling should consume UDD state and guardrails instead of copying
runtime-specific prompts:

- Project state: `udd status`
- Diagnostics: `udd status --doctor`
- Spec validation: `udd lint` and `udd validate`

## Local Codex Environment

Codex desktop shells may provide `node` without `npm` or `npx`. Use the
repo-local setup wrapper before running verification:

```bash
scripts/codex-setup.sh
```

The setup wrapper adds `~/.bun/bin` to `PATH` and runs `bunx npm ci`, which keeps
installation anchored to `package-lock.json` without requiring a globally
installed npm binary.

Run Codex verification through:

```bash
scripts/codex-verify.sh tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
```

The verifier runs `udd status`, `udd lint`, and `udd test` with
`UDD_TEST_RUNTIME=bun`. That runtime avoids Codex's signed bundled Node loading
macOS native Rollup modules while still using the repository's local Vitest
dependency.

## Tooling Scope

In scope for Codex tooling:

- Lightweight hooks that report UDD project health.
- Project initialization options that install those hooks.

Out of scope for this slice:

- Full Codex plugin implementation.
- Forking the OpenCode command set.
- Prompt or skill helpers beyond the installed hook.
- Runtime-specific status formats that duplicate shared payloads.
