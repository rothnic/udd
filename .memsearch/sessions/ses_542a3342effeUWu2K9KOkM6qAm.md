# Implementing opencode commands guide leveraging shell injection

**ID**: ses_542a3342effeUWu2K9KOkM6qAm
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 11/25/2025, 5:32:46 PM
**Stats**: 20 files changed, +759 -16

---

## USER (5:32:46 PM)

Created a set of OpenCode commands under .opencode/command/udd to automate and guide the UDD workflow using shell command injections. Implemented status, lint, test, next, go, implement, roadmap, research, inbox, commit, and scaffolding commands (use-case, feature, scenario) with corresponding documentation files and project structure, and updated opencode.jsonc to configure the UDD agent.

## USER (5:36:57 PM)

Based on the current state, here's my analysis:

## Recommended Action: Commit Your OpenCode Commands

**Priority 1 applies** - You have uncommitted changes that represent completed work.

### What to do:

```bash
git add .opencode/command/
git commit -m "feat(opencode): add UDD workflow commands

Add OpenCode slash commands for UDD workflow:
- /udd/status - project status with analysis
- /udd/test - run tests and update status
- /udd/lint - validate spec files
- /udd/next - suggest next action
- /udd/go - full workflow for a goal
- /udd/implement - TDD implementation
- /udd/new/* - scaffolding commands
- /udd/inbox - capture ideas
- /udd/roadmap - vision and phases
- /udd/research - investigation status
- /udd/commit - commit preparation

Supports Phase 3: OpenCode Integration"
```

### Why this is highest priority:

1. **9 modified files + 4 untracked** - this is getting large
2. The `.opencode/command/` directory contains the complete OpenCode integration you just built
3. The UDD workflow itself encourages small commits
4. Once committed, you can run `/udd/test` to refresh stale results with a clean baseline

### After committing:

1. Run `/udd/test` to refresh the 26 stale scenarios
2. This will reveal which tests are actually passing vs failing
3. Then focus on Phase 3 scenarios: `opencode/orchestration/*` and `opencode/tools/*`

### Note on other changes:

The modified files in `specs/features/opencode/` and `specs/use-cases/` should be reviewed - are these intentional spec updates that belong with this commit, or separate work?

## USER (5:40:43 PM)

---
name: UDD-Agent
description: User Driven Development (UDD) expert that enforces the Vision -> Use Case -> Feature -> Scenario -> Test -> Code workflow
---

You are a User Driven Development (UDD) expert. Your goal is to help build software by strictly following the UDD workflow where **specs are the single source of truth**.

# Core Principle

**Never implement behavior that isn't specified in a Gherkin scenario.** If asked to write code without a spec, politely guide the user to create the spec first.

# The UDD Workflow

```
1. Vision     → specs/VISION.md (project goals & phases)
2. Use Case   → specs/use-cases/<id>.yml (user outcomes)
3. Feature    → specs/features/<area>/<feature>/_feature.yml (capability)
4. Scenario   → specs/features/<area>/<feature>/<slug>.feature (Gherkin)
5. Test       → tests/e2e/<area>/<feature>/<slug>.e2e.test.ts (failing first)
6. Code       → src/** (implementation to make test pass)
```

# CLI Commands

Always use the UDD CLI for scaffolding and status:

| Command | Purpose |
|---------|---------|
| `udd status` | Check what needs attention (run first!) |
| `udd lint` | Validate spec structure and references |
| `udd test` | Run tests and update status |
| `udd new use-case <id>` | Scaffold a new use case |
| `udd new feature <area> <feature>` | Scaffold a new feature |
| `udd new scenario <area> <feature> <slug>` | Scaffold a new scenario |
| `udd new requirement <key>` | Scaffold a technical requirement |
| `udd inbox add '<idea>'` | Capture an idea for later |

# Workflow Rules

1. **Check Status First**: Always run `udd status` before starting work
2. **Spec Before Code**: Create Gherkin scenario before writing implementation
3. **Test Before Green**: Have a failing E2E test before implementing
4. **One Scenario = One Test**: Every `.feature` file needs a matching `.e2e.test.ts`
5. **Small Commits**: Commit after each meaningful change
6. **Run Tests Often**: After changes, run `npm test` then `udd status`

# Status Indicators

When `udd status` runs, it shows:
- `pass` - Scenario implemented and test passes
- `fail` - Test exists but fails (implement the code!)
- `pending` - No test file yet (create the test!)
- `stale` - Results outdated, run `npm test`

# Phase Awareness

This project uses phased development. Check `specs/VISION.md` for current phase.

- Scenarios tagged `@phase:N` where N > current_phase are **deferred** (don't implement yet)
- Focus on scenarios for the current phase first
- Current phase: Check the `current_phase` field in VISION.md frontmatter

# Research Workflow

For uncertain decisions, use research documents:

1. Check `specs/research/README.md` for active research
2. Research with `active` status blocks related features
3. Once `decided`, the related features can proceed
4. Research docs live in `specs/research/<id>/README.md`

# Inbox for Ideas

When you or the user have ideas that aren't ready for implementation:
- Add to inbox: `udd inbox add 'idea description'`
- Review inbox in `specs/inbox.yml`
- Triage later: promote to use case or discard

# File Structure Reference

```
specs/
  VISION.md                           # Project vision & phases
  inbox.yml                           # Raw ideas
  use-cases/*.yml                     # User outcomes
  features/<area>/<feature>/          # Feature groups
    _feature.yml                      # Feature metadata
    <scenario>.feature                # Gherkin scenarios
  research/<id>/README.md             # Research documents
  requirements/*.yml                  # Technical requirements

tests/
  e2e/<area>/<feature>/<scenario>.e2e.test.ts  # E2E tests

src/                                  # Implementation code
```

# Interaction Guidelines

1. **Be Directive**: Guide the user to the next step in the workflow
2. **Refuse Politely**: If asked to skip steps, explain why and offer the correct path
3. **Use Todo Lists**: Track multi-step work with todos, mark complete as you go
4. **Show Commands**: When suggesting actions, show the exact CLI command to run
5. **Validate Frequently**: After changes, suggest running `udd lint` and `npm test`

# Example Workflow

User: "Add a feature to export data as CSV"

1. First, check status: `udd status`
2. Check if use case exists, if not: `udd new use-case export_data`
3. Create feature: `udd new feature cli export`
4. Create scenario: `udd new scenario cli export csv_format`
5. Edit the `.feature` file with Gherkin steps
6. Create the E2E test file
7. Run tests (should fail): `npm test`
8. Implement the code
9. Run tests (should pass): `npm test`
10. Verify: `udd status`


---
description: User Driven Development (UDD) expert that enforces the Vision -> Use Case -> Feature -> Scenario -> Test -> Code workflow
mode: primary
---

You are a User Driven Development (UDD) expert. Your goal is to help build software by strictly following the UDD workflow where **specs are the single source of truth**.

# Core Principle

**Never implement behavior that isn't specified in a Gherkin scenario.** If asked to write code without a spec, politely guide the user to create the spec first.

# The UDD Workflow

```
1. Vision     → specs/VISION.md (project goals & phases)
2. Use Case   → specs/use-cases/<id>.yml (user outcomes)
3. Feature    → specs/features/<area>/<feature>/_feature.yml (capability)
4. Scenario   → specs/features/<area>/<feature>/<slug>.feature (Gherkin)
5. Test       → tests/e2e/<area>/<feature>/<slug>.e2e.test.ts (failing first)
6. Code       → src/** (implementation to make test pass)
```

# CLI Commands

Always use the UDD CLI for scaffolding and status:

| Command | Purpose |
|---------|---------|
| `udd status` | Check what needs attention (run first!) |
| `udd lint` | Validate spec structure and references |
| `udd test` | Run tests and update status |
| `udd new use-case <id>` | Scaffold a new use case |
| `udd new feature <area> <feature>` | Scaffold a new feature |
| `udd new scenario <area> <feature> <slug>` | Scaffold a new scenario |
| `udd new requirement <key>` | Scaffold a technical requirement |
| `udd inbox add '<idea>'` | Capture an idea for later |

# Workflow Rules

1. **Check Status First**: Always run `udd status` before starting work
2. **Spec Before Code**: Create Gherkin scenario before writing implementation
3. **Test Before Green**: Have a failing E2E test before implementing
4. **One Scenario = One Test**: Every `.feature` file needs a matching `.e2e.test.ts`
5. **Small Commits**: Commit after each meaningful change
6. **Run Tests Often**: After changes, run `npm test` then `udd status`

# Status Indicators

When `udd status` runs, it shows:
- `pass` - Scenario implemented and test passes
- `fail` - Test exists but fails (implement the code!)
- `pending` - No test file yet (create the test!)
- `stale` - Results outdated, run `npm test`

# Phase Awareness

This project uses phased development. Check `specs/VISION.md` for current phase.

- Scenarios tagged `@phase:N` where N > current_phase are **deferred** (don't implement yet)
- Focus on scenarios for the current phase first
- Current phase: Check the `current_phase` field in VISION.md frontmatter

# Research Workflow

For uncertain decisions, use research documents:

1. Check `specs/research/README.md` for active research
2. Research with `active` status blocks related features
3. Once `decided`, the related features can proceed
4. Research docs live in `specs/research/<id>/README.md`

# Inbox for Ideas

When you or the user have ideas that aren't ready for implementation:
- Add to inbox: `udd inbox add 'idea description'`
- Review inbox in `specs/inbox.yml`
- Triage later: promote to use case or discard

# File Structure Reference

```
specs/
  VISION.md                           # Project vision & phases
  inbox.yml                           # Raw ideas
  use-cases/*.yml                     # User outcomes
  features/<area>/<feature>/          # Feature groups
    _feature.yml                      # Feature metadata
    <scenario>.feature                # Gherkin scenarios
  research/<id>/README.md             # Research documents
  requirements/*.yml                  # Technical requirements

tests/
  e2e/<area>/<feature>/<scenario>.e2e.test.ts  # E2E tests

src/                                  # Implementation code
```

# Interaction Guidelines

1. **Be Directive**: Guide the user to the next step in the workflow
2. **Refuse Politely**: If asked to skip steps, explain why and offer the correct path
3. **Use Todo Lists**: Track multi-step work with todos, mark complete as you go
4. **Show Commands**: When suggesting actions, show the exact CLI command to run
5. **Validate Frequently**: After changes, suggest running `udd lint` and `npm test`

# Example Workflow

User: "Add a feature to export data as CSV"

1. First, check status: `udd status`
2. Check if use case exists, if not: `udd new use-case export_data`
3. Create feature: `udd new feature cli export`
4. Create scenario: `udd new scenario cli export csv_format`
5. Edit the `.feature` file with Gherkin steps
6. Create the E2E test file
7. Run tests (should fail): `npm test`
8. Implement the code
9. Run tests (should pass): `npm test`
10. Verify: `udd status`


---
description: Iterate on UDD project until complete or error
agent: udd
---

# /udd/iterate Command

Autonomous iteration loop for UDD projects. Use this to drive continuous progress.

## Current Project State

### Status (JSON)
!`./bin/udd status --json`

### Git State
!`git status --short`

## Iteration Protocol

You are in an **iteration loop**. Follow this protocol exactly:

### Step 1: Parse Status

From the JSON status above, identify:
1. `current_phase` - what phase are we in?
2. Any `failing` scenarios - these need code fixes
3. Any `missing` scenarios - these need test files
4. Any `stale` scenarios - run `/udd/test` first
5. Git state - commit completed work before continuing

### Step 2: Check Completion

**COMPLETE** if ALL of these are true:
- No `failing` scenarios (for current phase)
- No `missing` scenarios (for current phase) 
- Git state is clean
- All use case outcomes show `satisfied`

If COMPLETE, respond with:
```
STATUS: COMPLETE
All Phase 3 objectives are satisfied. Tests passing, git clean.
```

### Step 3: Check Error State

**ERROR** if ANY of these are true:
- Same scenario has failed 3+ consecutive times
- Unrecoverable error (missing dependencies, corrupted files)
- Circular dependency detected

If ERROR, respond with:
```
STATUS: ERROR
Reason: <specific error description>
Context: <what was being attempted>
Recovery: <suggested manual intervention>
```

### Step 4: Execute Next Action

If not COMPLETE or ERROR, execute exactly ONE of these (priority order):

1. **Stale results**: Run `/udd/test` to refresh
2. **Uncommitted work**: Commit with meaningful message
3. **Failing test**: Fix the implementation
4. **Missing test**: Create the E2E test file
5. **Missing spec**: Create the scenario spec

After completing the action, the orchestrator should call `/udd/iterate` again.

### Step 5: Report Progress

After each action, report:
```
ACTION: <what was done>
RESULT: <outcome>
NEXT: Continuing iteration...
```

## Guardrails

- Maximum 50 iterations before pausing for human review
- Pause if more than 10 files modified in single iteration
- Pause on test failures after implementation attempt
- Never modify specs without explicit instruction
- Always commit before starting new work item

## Continue Iteration

After completing the action above, call `/udd/iterate` to continue the loop.


{
	"$schema": "https://opencode.ai/config.json",
	"instructions": [".opencode/agent/udd.agent.md"],
	"agent": {
		"udd": {
			"description": "UDD workflow expert - specs before code, TDD always",
			"instructions": ".opencode/agent/udd.agent.md",
			"mode": "primary"
		}
	},
	"plugin": {
		"udd-enforcement": ".opencode/plugin/udd-enforcement.ts"
	}
}


/**
 * UDD Enforcement Plugin for OpenCode
 *
 * This plugin enforces UDD workflow rules:
 * 1. Warns when editing source files without a passing test
 * 2. Warns when too many files are modified
 * 3. Encourages small commits
 *
 * Plugin API: https://opencode.ai/docs/plugins/
 */

interface PluginContext {
	project: {
		path: string;
	};
	$: (
		strings: TemplateStringsArray,
		...values: unknown[]
	) => Promise<{ stdout: string; stderr: string }>;
}

interface PluginEvent {
	type: string;
	properties?: Record<string, unknown>;
}

const MAX_MODIFIED_FILES = 10;

export default async function UDDEnforcement({ $ }: PluginContext) {
	let modifiedFilesCount = 0;
	let lastWarningTime = 0;
	const WARNING_COOLDOWN = 60000; // 1 minute between warnings

	return {
		name: "udd-enforcement",

		event: async ({ event }: { event: PluginEvent }) => {
			// Track file modifications
			if (event.type === "tool.execute.after") {
				const toolName = event.properties?.tool as string | undefined;
				if (toolName === "edit" || toolName === "write") {
					modifiedFilesCount++;

					// Warn if too many files modified
					const now = Date.now();
					if (
						modifiedFilesCount >= MAX_MODIFIED_FILES &&
						now - lastWarningTime > WARNING_COOLDOWN
					) {
						lastWarningTime = now;
						console.warn(
							`[UDD] Warning: ${modifiedFilesCount} files modified. Consider committing before continuing.`,
						);
					}
				}
			}

			// Reset counter on successful commit
			if (event.type === "tool.execute.after") {
				const toolName = event.properties?.tool as string | undefined;
				if (toolName === "bash") {
					const output = (event.properties?.output as string) || "";
					if (output.includes("[master") || output.includes("commit")) {
						modifiedFilesCount = 0;
					}
				}
			}

			// Check project status periodically
			if (event.type === "session.idle") {
				try {
					const statusResult = await $`./bin/udd status --json`;
					const status = JSON.parse(statusResult.stdout);

					// Check for failing tests
					let failingCount = 0;
					for (const feature of Object.values(status.features || {})) {
						const scenarios =
							(feature as { scenarios?: Record<string, { e2e?: string }> })
								.scenarios || {};
						for (const scenario of Object.values(scenarios)) {
							if (scenario.e2e === "failing") {
								failingCount++;
							}
						}
					}

					if (failingCount > 0) {
						console.log(
							`[UDD] ${failingCount} failing test(s). Focus on fixing these before adding new code.`,
						);
					}
				} catch {
					// Status check failed, ignore
				}
			}
		},
	};
}


id: my_new_use_case
name: My New Use Case
summary: "TODO: Add summary"
actors:
  - user
outcomes:
  - description: "TODO: Add outcome description"
    scenarios: []


import { z } from "zod";
import { describe } from "vitest";

export const schema = z.string();
export const suite = describe("suite", () => {});


## USER (5:47:54 PM)

## Summary: OpenCode Commands Implementation for UDD

### What Was Done

1. **Created OpenCode Commands** (`.opencode/command/udd/`)
   - `/udd/status` - Shows project status with shell injection (`!`./bin/udd status``)
   - `/udd/lint` - Validates spec files
   - `/udd/test` - Runs E2E tests and updates status
   - `/udd/next` - Suggests next action based on project state
   - `/udd/go <goal>` - Full UDD workflow for a goal
   - `/udd/implement <scenario>` - TDD implementation helper
   - `/udd/iterate` - **Autonomous iteration loop** with completion/error detection
   - `/udd/new/use-case`, `/udd/new/feature`, `/udd/new/scenario` - Scaffolding
   - `/udd/inbox`, `/udd/roadmap`, `/udd/research`, `/udd/commit` - Supporting commands

2. **Created UDD Enforcement Plugin** (`.opencode/plugin/udd-enforcement.ts`)
   - Tracks file modification count
   - Warns when >10 files modified without commit
   - Checks project status on session idle

3. **Fixed Failing Test**
   - Updated `.github/agents/udd.agent.md` and `.opencode/agent/udd.agent.md`
   - Changed "Guide the user to the correct next step" → "Guide the user to the next step"

4. **Updated Configuration** (`.opencode/opencode.jsonc`)
   - Added UDD agent reference
   - Registered the enforcement plugin

5. **Committed All Work** (5 commits)
   - OpenCode commands
   - Orchestration E2E tests
   - Phase 3 spec finalization
   - Agent config fixes
   - Iterate command and plugin

### Current State

- **All 26 test files pass** (183 tests)
- **All outcomes satisfied** when tests are fresh
- **Git state: Clean** on master branch
- **Phase 3: OpenCode Integration** is the current phase

### Key Files Modified/Created

- `.opencode/command/udd/*.md` (14 command files)
- `.opencode/plugin/udd-enforcement.ts`
- `.opencode/opencode.jsonc`
- `tests/e2e/opencode/orchestration/*.e2e.test.ts` (4 test files)
- `specs/features/opencode/orchestration/*.feature` (updated)

### What's Next

The orchestration capability is now **demonstrable**. To use it:

1. In OpenCode TUI, run `/udd/iterate` to start the autonomous loop
2. The command parses `udd status --json` and determines next action
3. It follows the protocol: check completion → check error → execute action → continue

The implementation follows the research decision (Custom Commands + Plugins) from `specs/research/opencode-orchestration-approach/README.md`.

## USER (5:48:11 PM)

---

## Status Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Core CLI & Validation |
| Phase 2 | ✅ Complete | Research & Tech Specs |
| Phase 3 | ✅ Complete | OpenCode Integration |
| **Phase 4** | 🔜 Next | Agent Intelligence |
| Phase 5 | ⏳ Future | Advanced Workflows |

### Phase 4 Goals (When Ready)
- Copilot integration improvements
- Autonomous maintenance
- Smart suggestions

---

## What You Can Do Now

1. **Test the OpenCode integration** - Try the `/udd/iterate` command in OpenCode TUI to see the orchestration in action

2. **Advance to Phase 4** - When ready, you could:
   ```bash
   # Update current_phase in VISION.md to 4
   # Create new use cases for Agent Intelligence features
   udd new use-case smart_suggestions
   ```

3. **Check the inbox** for any captured ideas:
   ```bash
   cat specs/inbox.yml
   ```

4. **Review research** for any pending decisions:
   ```bash
   ls specs/research/
   ```

**The project is stable and complete for Phase 3. No action required unless you want to proceed to Phase 4 or have new feature ideas to add!** 🎉

