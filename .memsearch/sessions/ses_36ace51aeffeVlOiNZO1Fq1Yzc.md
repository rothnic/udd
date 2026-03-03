# Session ses_36ace51aeffeVlOiNZO1Fq1Yzc

## user (2026-02-25T14:26:27.251Z)

<system-reminder>

[SYSTEM DIRECTIVE: OH-MY-OPENCODE - SINGLE TASK ONLY]

**STOP. READ THIS BEFORE PROCEEDING.**

If you were NOT given **exactly ONE atomic task**, you MUST:
1. **IMMEDIATELY REFUSE** this request
2. **DEMAND** the orchestrator provide a single, specific task

**Your response if multiple tasks detected:**
> "I refuse to proceed. You provided multiple tasks. An orchestrator's impatience destroys work quality.
> 
> PROVIDE EXACTLY ONE TASK. One file. One change. One verification.
> 
> Your rushing will cause: incomplete work, missed edge cases, broken tests, wasted context."

**WARNING TO ORCHESTRATOR:**
- Your hasty batching RUINS deliverables
- Each task needs FULL attention and PROPER verification  
- Batch delegation = sloppy work = rework = wasted tokens

**REFUSE multi-task requests. DEMAND single-task clarity.**
</system-reminder>

<Work_Context>
## Notepad Location (for recording learnings)
NOTEPAD PATH: .sisyphus/notepads/{plan-name}/
- learnings.md: Record patterns, conventions, successful approaches
- issues.md: Record problems, blockers, gotchas encountered
- decisions.md: Record architectural choices and rationales
- problems.md: Record unresolved issues, technical debt

You SHOULD append findings to notepad files after completing work.
IMPORTANT: Always APPEND to notepad files - never overwrite or use Edit tool.

## Plan Location (READ ONLY)
PLAN PATH: .sisyphus/plans/{plan-name}.md

CRITICAL RULE: NEVER MODIFY THE PLAN FILE

The plan file (.sisyphus/plans/*.md) is SACRED and READ-ONLY.
- You may READ the plan to understand tasks
- You may READ checkbox items to know what to do
- You MUST NOT edit, modify, or update the plan file
- You MUST NOT mark checkboxes as complete in the plan
- Only the Orchestrator manages the plan file

VIOLATION = IMMEDIATE FAILURE. The Orchestrator tracks plan state.
</Work_Context>
Find all local files and patterns relevant to Phase 2 Task 2 (system boundary model).
Search for use-case schemas, boundary concepts, external actor/system markers, and naming conventions.
Return:
1) Files containing boundary-like semantics
2) Current schema fields that can host boundary data
3) Gaps and inconsistencies
4) Exact path references.
Read-only only; no edits.
---

## assistant (2026-02-25T14:26:27.261Z)

**glob:**

```
No files found
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup documentation for Z")

// Then continue your work while they run in backg...
```

**glob:**

```
No files found
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup documentation for Z")

// Then continue your work while they run in backg...
```

**grep:**

```
Found 184 match(es) in 57 file(s)

/Users/nroth/workspace/udd/AGENTS.md
  25: ├── actors.md                     # Who uses it

/Users/nroth/workspace/udd/scripts/patch-vitest-cucumber.ts
  28: if (!importPath.startsWith(".")) return null; // Ignore external packages

/Users/nroth/workspace/udd/src/types.ts
  18: actors: z.array(z.string()).optional(),

/Users/nroth/workspace/udd/DRAFT_PR_SUMMARY_EDGE_CASE_HARDENING.md
  18: - specs/use-cases/edge_case_hardening.yml — new use case linking edge sc...
```

**grep:**

```
Found 51 match(es) in 12 file(s)

/Users/nroth/workspace/udd/src/services/task_service.ts
  16: export const CreateTaskRequestSchema = z.object({
  25: export interface CreateTaskResponse {
  33: export interface TaskValidationError {
  45: export interface TaskServiceError {

/Users/nroth/workspace/udd/src/commands/sync.ts
  10: interface JourneyStep {
  15: interface Journey {
  24: interface ManifestJourney {
  30: interface ManifestScenario {
  36: interface Manifest {

/Users/nroth/workspac...
```
---

## assistant (2026-02-25T14:26:34.129Z)

**read:**

```
<path>/Users/nroth/workspace/udd/src/types.ts</path>
<type>file</type>
<content>1: import { z } from "zod";
2: 
3: export const VisionFrontmatterSchema = z.object({
4: 	id: z.string(),
5: 	name: z.string(),
6: 	version: z.string().optional(),
7: 	current_phase: z.number().optional(),
8: 	phases: z.record(z.string(), z.string()).optional(),
9: 	goals: z.array(z.string()),
10: 	success_metrics: z.array(z.string()).optional(),
11: 	use_cases: z.array(z.string()),
12: });
13: 
14: export const UseCa...
```

**read:**

```
<path>/Users/nroth/workspace/udd/templates/template-use-case.yml</path>
<type>file</type>
<content>1: id: "<id_or_key>" # unique use-case id, e.g. capture_task
2: name: "<Short Name>" # human readable name
3: summary: "<One-line summary of the use case>"
4: actor: "<primary_actor>" # e.g. team_member, admin, end_user
5: 
6: # Goals: list of measurable goals for this use case
7: goals:
8:   - "<goal-1>"
9:   - "<goal-2>"
10: 
11: # Scenarios: canonical scenario slugs that exercise the use case
12...
```

**read:**

```
<path>/Users/nroth/workspace/udd/templates/template-component.md</path>
<type>file</type>
<content>1: # Component Specification Template
2: 
3: Layer: 4 - Component
4: 
5: Summary
6: -------
7: Briefly describe the component's purpose in one or two sentences. Keep scope narrow and focused on the single responsibility this component owns.
8: 
9: Actor
10: -----
11: - <primary_actor>  # e.g., team_member, system_agent
12: 
13: Alignment
14: ---------
15: - Map to relevant journeys, use-cases, or f...
```

**read:**

```
<path>/Users/nroth/workspace/udd/product/actors.md</path>
<type>file</type>
<content>1: # Actors
2: 
3: This file documents who uses the product. Keep entries short, focused, and actionable.
4: 
5: ## Team Member
6: 
7: **Who.** A team member is an individual contributor who works on tasks assigned by the team or themselves.
8: 
9: **Goals.**
10: - Capture tasks and ideas quickly so nothing is lost.
11: - Stay focused on the current work while making visible progress.
12: 
13: **Context.**
14: -...
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/use-cases/capture_task.yml</path>
<type>file</type>
<content>1: id: capture_task
2: name: Capture Task
3: summary: Record tasks with minimal friction
4: actor: team_member
5: goals:
6:   - Capture in <30s
7:   - Works from any context
8: scenarios:
9:   - mobile_widget
10:   - voice_input
11:   - desktop_shortcut
12:   - offline_sync
13: 
14: # Manual mapping from goals to scenario slugs
15: manual_mapping:
16:   "Capture in <30s":
17:     - mobile_widget
1...
```

**read:**

```
<path>/Users/nroth/workspace/udd/src/lib/query.ts</path>
<type>file</type>
<content>1: import crypto from "node:crypto";
2: import fs from "node:fs/promises";
3: import path from "node:path";
4: import { glob } from "glob";
5: import yaml from "yaml";
6: 
7: export interface Actor {
8: 	name: string;
9: 	use_cases: string[];
10: }
11: 
12: export interface Journey {
13: 	id: string;
14: 	name: string;
15: 	actor: string;
16: 	goal: string;
17: 	scenario_count: number;
18: 	scenarios_missing: num...
```

**read:**

```
<path>/Users/nroth/workspace/udd/src/commands/validate.ts</path>
<type>file</type>
<content>1: import fs from "node:fs/promises";
2: import path from "node:path";
3: import chalk from "chalk";
4: import { Command } from "commander";
5: import { glob } from "glob";
6: 
7: export const validateCommand = new Command("validate")
8: 	.description("Check feature scenario completeness")
9: 	.option(
10: 		"-f, --feature <path>",
11: 		"Validate specific feature file (default: all in specs/)",
12: 	)
13...
```

**read:**

```
<path>/Users/nroth/workspace/udd/src/lib/status.ts</path>
<type>file</type>
<content>1: import { exec } from "node:child_process";
2: import crypto from "node:crypto";
3: import fs from "node:fs/promises";
4: import path from "node:path";
5: import { promisify } from "node:util";
6: import { glob } from "glob";
7: import yaml from "yaml";
8: 
9: const execAsync = promisify(exec);
10: 
11: export interface GitStatus {
12: 	branch: string;
13: 	clean: boolean;
14: 	modified: number;
15: 	staged: n...
```
---

## assistant (2026-02-25T14:26:40.441Z)

**glob:**

```
Found 12 file(s)

/Users/nroth/workspace/udd/specs/use-cases/capture_task.yml
/Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml
/Users/nroth/workspace/udd/specs/use-cases/orchestrated_iteration.yml
/Users/nroth/workspace/udd/specs/use-cases/run_tests.yml
/Users/nroth/workspace/udd/specs/use-cases/capture_ideas.yml
/Users/nroth/workspace/udd/specs/use-cases/phased_development.yml
/Users/nroth/workspace/udd/specs/use-cases/validate_specs.yml
/Users/nroth/workspace/udd/specs/use-ca...
```

**glob:**

```
Found 45 file(s)

/Users/nroth/workspace/udd/specs/features/test_domain/sample_feature/sample_feature.feature
/Users/nroth/workspace/udd/specs/features/tasks/quick_capture/mobile_widget.feature
/Users/nroth/workspace/udd/specs/features/tasks/quick_capture/_feature.yml
/Users/nroth/workspace/udd/specs/features/tasks/quick_capture/voice_input.feature
/Users/nroth/workspace/udd/specs/features/udd/cli/status_edge_cases.feature
/Users/nroth/workspace/udd/specs/features/udd/cli/init_edge_cases.feature...
```

**grep:**

```
Error: rg: : IO error for operation on : No such file or directory (os error 2)
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup document...
```

**glob:**

```
Found 1 file(s)

/Users/nroth/workspace/udd/product/journeys/daily_planning.md
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup documenta...
```
---

## assistant (2026-02-25T14:26:49.484Z)

**grep:**

```
Found 1 match(es) in 1 file(s)

specs/use-cases/capture_task.yml
  4: actor: team_member

[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Looku...
```

**grep:**

```
No matches found
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup documentation for Z")

// Then continue your work while they run in bac...
```

**grep:**

```
Error: rg: : IO error for operation on : No such file or directory (os error 2)
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents simultaneously
task(agent="explore", prompt="Find all files matching pattern X")
task(agent="explore", prompt="Search for implementation of Y") 
task(agent="librarian", prompt="Lookup document...
```
---

## assistant (2026-02-25T14:27:04.723Z)

<analysis>
**Literal Request**: "Find all local files and patterns relevant to Phase 2 Task 2 (system boundary model). Search for use-case schemas, boundary concepts, external actor/system markers, and naming conventions. Return: 1) Files containing boundary-like semantics 2) Current schema fields that can host boundary data 3) Gaps and inconsistencies 4) Exact path references. Read-only only; no edits."

**Actual Need**: You are preparing a "system boundary model" (Phase 2 Task 2). You need a complete map of where the repo currently encodes actors/external systems, which schemas and templates can carry boundary data, and the places where code or content is inconsistent (so you can plan schema changes, migrations, and where to read/write new fields). The deliverable must let you immediately plan schema additions and a migration/compatibility strategy without further discovery.

**Success Looks Like**: A concise, exhaustive list of files that already express boundary/actor/external-system semantics; an enumerated list of concrete schema fields that can (today) host boundary data; an actionable list of gaps and inconsistencies (with examples); and absolute path references so a developer can open and update the right files and code paths to add a boundary model and compatibility layers.
</analysis>

Parallel tool calls: I ran multiple repo-wide searches and file reads in parallel to extract schemas, templates, use-cases, feature files, and the code that parses them (see results below).

<results>
<files>
- /Users/nroth/workspace/udd/src/types.ts — central Zod schemas (UseCaseSpecSchema, FeatureSpecSchema, TechnicalRequirementSchema): primary place for schema-level host fields
- /Users/nroth/workspace/udd/src/lib/query.ts — code that reads use-case YAMLs and extracts actors (expects `actors` array). Important for read compatibility and actor discovery.
- /Users/nroth/workspace/udd/src/lib/status.ts — project/use-case/feature status analysis; expects fully-qualified scenario IDs in use-cases/outcomes and inspects scenario phase/deferred state. Also defines UseCaseOutcome types.
- /Users/nroth/workspace/udd/src/commands/validate.ts — feature completeness checks (edge-case/phase checks, user-need comments). Useful for conventions and feature-level boundary guidance.
- /Users/nroth/workspace/udd/templates/template-use-case.yml — canonical use-case template; shows fields users are instructed to write (note: uses `actor:` singular in template)
- /Users/nroth/workspace/udd/templates/template-component.md — component template that documents "External" dependencies and "Actor" placeholders (useful for modeling external systems at component-level)
- /Users/nroth/workspace/udd/templates/feature-template.feature — feature template that prompts SysML-like context, edge cases, and has guidance for phases/tags
- /Users/nroth/workspace/udd/product/actors.md — canonical actor/persona docs (human readable actor definitions)
- /Users/nroth/workspace/udd/product/journeys/daily_planning.md — example journey referencing use-case(s); journeys parsing (src/lib/query.ts, src/lib/status.ts) extracts "**Actor:**" and linked scenarios from journeys
- /Users/nroth/workspace/udd/specs/use-cases/capture_task.yml — concrete use-case example (uses `actor:` singular; scenarios are short slugs like `mobile_widget`)
- /Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml — use-case file (pattern same as other use-cases)
- /Users/nroth/workspace/udd/specs/use-cases/orchestrated_iteration.yml
- /Users/nroth/workspace/udd/specs/use-cases/run_tests.yml
- /Users/nroth/workspace/udd/specs/use-cases/capture_ideas.yml
- /Users/nroth/workspace/udd/specs/use-cases/phased_development.yml
- /Users/nroth/workspace/udd/specs/use-cases/validate_specs.yml
- /Users/nroth/workspace/udd/specs/use-cases/fix_test_discovery.yml
- /Users/nroth/workspace/udd/specs/use-cases/enforce_code_style.yml
- /Users/nroth/workspace/udd/specs/use-cases/agent_customization.yml
- /Users/nroth/workspace/udd/specs/use-cases/manage_wip.yml
- /Users/nroth/workspace/udd/specs/use-cases/project_setup.yml
- /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/_feature.yml — feature metadata YAML for quick_capture feature (used by status/getFeatures)
- /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/mobile_widget.feature — concrete scenario referenced by use-cases (slug mapping)
- /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/voice_input.feature — another concrete scenario that aligns with capture_task.yml
- /Users/nroth/workspace/udd/docs/sysml-informed-discovery.md — guidance on actor/questioning; useful for naming conventions and what "boundary" should capture
</files>

<answer>
Summary (direct, actionable):

1) Where boundary-like semantics currently live (how to find them)
- Schema-level places you can put boundary/actor/external-system data:
  - /Users/nroth/workspace/udd/src/types.ts
    - UseCaseSpecSchema fields: id, name, summary, actors (z.array(z.string()).optional()), outcomes (array of { description, scenarios? }), phase (optional), metadata via templates.
    - FeatureSpecSchema: use_cases (array), phase, kind.
    - TechnicalRequirementSchema: use_cases (array).
  - status-level types that carry outcome/satisfaction and scenario status:
    - /Users/nroth/workspace/udd/src/lib/status.ts — UseCaseOutcome and UseCaseStatus types (outcomes: UseCaseOutcome[] with description and scenarios).
- Authoring templates and content that contain actor/external hints:
  - /Users/nroth/workspace/udd/templates/template-use-case.yml — canonical file for authoring use-cases; includes goals, scenarios, outcomes, metadata (phase, related_features).
  - /Users/nroth/workspace/udd/templates/template-component.md — explicit "External" section for listing external services and purpose.
  - /Users/nroth/workspace/udd/product/actors.md — human actor definitions (personas).
  - /Users/nroth/workspace/udd/templates/feature-template.feature — encourages # User Need, # Alternatives, # Edge Cases — good place for boundary notes at feature level.
- Runtime/automation code that reads actors/outcomes and scenarios:
  - /Users/nroth/workspace/udd/src/lib/query.ts — expects use-case YAMLs to contain `actors` array (reads actors?: string[]). This is the canonical actor-discovery code path.
  - /Users/nroth/workspace/udd/src/lib/status.ts — reads use-cases (scenarios and outcomes) and expects scenario IDs to look like `featureId/slug` (it splits on last slash) when computing outcome satisfaction. It also uses the feature files' preamble for @phase tags.

2) Current schema fields that can host boundary data (concrete list)
- UseCaseSpecSchema (src/types.ts)
  - actors: z.array(z.string()).optional()  — primary place to store actor names (external or internal actors).
  - outcomes: array of { description: string, scenarios?: z.array(z.string()).optional() } — can map an outcome to scenario(s) that realize it (can be used to mark boundary satisfaction).
  - metadata (template field): metadata.phase, metadata.related_features — flexible key for adding "boundaries" or "external_systems" entries.
  - phase: z.number().optional() — can mark staged/deferred responsibilities.
- FeatureSpecSchema (src/types.ts)
  - use_cases: z.array(z.string()).optional() — reverse linkage from feature to use cases; can contain boundary metadata via feature-level comments or extension fields.
  - kind / phase — can be used to scope where interfaces cross boundary (e.g., "extension" <-> external system).
- TechnicalRequirementSchema (src/types.ts)
  - use_cases: z.array(z.string()).optional() — requirements tied to use cases (useful for external system contracts).
- Status types (src/lib/status.ts)
  - UseCaseOutcome.scenarios: string[] — used to calculate whether an outcome is "satisfied"; a good spot to reference externally-hosted integration scenarios.
  - UseCaseStatus.validation_errors and UseCaseStatus.outcomes — can host notes about boundaries not satisfied.
- Templates (template-use-case.yml)
  - coverage_gaps, coverage_check, outcomes entries — free-form to document boundary gaps and deferred external integrations.

3) Gaps and inconsistencies (explicit examples you can act on)
- actor vs actors mismatch (critical)
  - Template uses `actor: "<primary_actor>"` (singular) at line 4 of /Users/nroth/workspace/udd/templates/template-use-case.yml.
  - Many real use-case files (e.g., /Users/nroth/workspace/udd/specs/use-cases/capture_task.yml) use `actor: team_member` (singular).
  - Code that enumerates actors (getActors in /Users/nroth/workspace/udd/src/lib/query.ts) parses YAML expecting `actors?: string[]` (plural). Result: singular `actor:` entries will not be discovered by getActors (actors omitted from automation).
  - Actionable consequence: actor discovery and query commands will miss actors unless code is made backward-compatible or YAMLs migrated.
- scenario identifier format mismatch (short slug vs fully-qualified id)
  - Use-case scenarios in /Users/nroth/workspace/udd/specs/use-cases/*.yml often list short slugs (e.g., `mobile_widget`) — see /Users/nroth/workspace/udd/specs/use-cases/capture_task.yml.
  - The status logic in /Users/nroth/workspace/udd/src/lib/status.ts expects scenario identifiers referenced in use-cases/outcomes to include a feature prefix (it splits scenarioId on the last `/` and uses the part before the last slash as featureId). If a scenario string lacks a slash, status treats it as missing or legacy.
  - Actionable consequence: outcome satisfaction calculation and cross-checks will often report "missing" or log validation errors for many use-cases (or require additional resolution logic).
- outcomes field accepts multiple shapes (strings vs objects)
  - status.ts contains legacy-handling: it tolerates outcome entries that are strings and flags them as legacy. This indicates schema evolution but inconsistent use.
  - Actionable consequence: A canonical shape is needed (object with description and scenarios) to reliably map boundaries.
- No explicit "external_system" or "boundary" typed field
  - There is no first-class, documented "boundary" or "external_system" field in UseCase or Feature schemas. External systems are currently expected to be expressed via:
    - actors (treating external system as an actor), or
    - free-form component templates (templates/template-component.md) or notes in feature/discussion text.
  - Actionable consequence: To model system boundaries formally you must either add new fields (e.g., `external_systems` or `boundary.interfaces`) in src/types.ts and templates, or explicitly agree to use `actors` and `outcomes` with a naming convention (less robust).
- Phase/tag handling scattered between files
  - Feature-level @phase:N tags are processed by src/lib/status.ts and getFeatures (they must appear before "Feature:" keyword).
  - Validation and templates mention phase but there’s no unified enforcement; authoring mistakes (placing the tag after Feature:) will be ignored and can silently change status.
  - Actionable consequence: Define an authoring rule and add validation (validate.ts or schema checks) for where phase tags must go.

4) Exact path references (all the files you need to inspect and change to implement a boundary model)
- Schemas / core types:
  - /Users/nroth/workspace/udd/src/types.ts
- Actor discovery / use-case reading:
  - /Users/nroth/workspace/udd/src/lib/query.ts
- Project status & outcome satisfaction logic:
  - /Users/nroth/workspace/udd/src/lib/status.ts
- Validation & authoring rules:
  - /Users/nroth/workspace/udd/src/commands/validate.ts
- Templates / doc sources to update (authoring guidance):
  - /Users/nroth/workspace/udd/templates/template-use-case.yml
  - /Users/nroth/workspace/udd/templates/template-component.md
  - /Users/nroth/workspace/udd/templates/feature-template.feature
  - /Users/nroth/workspace/udd/docs/sysml-informed-discovery.md
- Content files to migrate / inspect for needed updates:
  - /Users/nroth/workspace/udd/product/actors.md
  - /Users/nroth/workspace/udd/product/journeys/daily_planning.md
  - All use-case YAMLs (list of files discovered):
    - /Users/nroth/workspace/udd/specs/use-cases/capture_task.yml
    - /Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml
    - /Users/nroth/workspace/udd/specs/use-cases/orchestrated_iteration.yml
    - /Users/nroth/workspace/udd/specs/use-cases/run_tests.yml
    - /Users/nroth/workspace/udd/specs/use-cases/capture_ideas.yml
    - /Users/nroth/workspace/udd/specs/use-cases/phased_development.yml
    - /Users/nroth/workspace/udd/specs/use-cases/validate_specs.yml
    - /Users/nroth/workspace/udd/specs/use-cases/fix_test_discovery.yml
    - /Users/nroth/workspace/udd/specs/use-cases/enforce_code_style.yml
    - /Users/nroth/workspace/udd/specs/use-cases/agent_customization.yml
    - /Users/nroth/workspace/udd/specs/use-cases/manage_wip.yml
    - /Users/nroth/workspace/udd/specs/use-cases/project_setup.yml
- Relevant feature files (for mapping short slugs to feature paths)
  - /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/_feature.yml
  - /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/mobile_widget.feature
  - /Users/nroth/workspace/udd/specs/features/tasks/quick_capture/voice_input.feature
</answer>

<next_steps>
1) Decide model: Add a first-class "boundary" (or `external_systems`) element to UseCaseSpecSchema and template, or adopt the pattern "external actors" (actors array includes 'system:Email' style names). I recommend adding a new field to make boundaries explicit:
   - Add to /Users/nroth/workspace/udd/src/types.ts UseCaseSpecSchema.metadata.external_systems: z.array(z.object({ id: z.string(), type: z.string().optional(), description: z.string().optional(), interface_contract: z.string().optional() })).optional()
   - Update /Users/nroth/workspace/udd/templates/template-use-case.yml to include example external_systems block and guidance.

2) Backward compatibility patch plan:
   - Update /Users/nroth/workspace/udd/src/lib/query.ts to read both `actors` (array) and `actor` (string) so existing files are discovered:
     * if (data.actors) ... else if (data.actor) actorMap.set(data.actor,...)
   - Update /Users/nroth/workspace/udd/src/lib/status.ts to canonicalize scenario references:
     * If a referenced scenario string has no slash, attempt to resolve it by searching features for a matching slug (e.g., glob search for `**/<slug>.feature`) and convert to `area/feature/slug` for outcome evaluation. Log ambiguous matches as validation errors.

3) Migration guidelines to roll out:
   - Run a script (or `rg`) to list use-cases using `actor:` (singular) and short scenario slugs. Convert them to the canonical schema (actors: [ ... ], outcomes[].scenarios: fully-qualified ids) — or rely on the compatibility shims above while migrating content over time.
   - Update templates and docs (template-use-case.yml, template-component.md, docs/sysml-informed-discovery.md) so all new authoring follows the new model.

4) Validation and enforcement:
   - Add automated checks in /Users/nroth/workspace/udd/src/commands/validate.ts or in the CI linter to:
     * detect `actor:` singular and warn/suggest `actors: []`
     * detect scenario strings without a slash in use-case scenarios/outcomes and warn or attempt resolution
     * require phase tags to appear before Feature: if present

If you want, I can:
- produce the precise patch text you would add to src/types.ts, src/lib/query.ts, and src/lib/status.ts, along with the template updates and an automated migration script (dry-run only) that lists affected files and suggested transformations — or
- run a non-destructive dry-run scanner that prints all use-case YAMLs that need changes (e.g., those using `actor:` singular or listing unqualified scenario slugs).

Which follow-up should I do next? (Note: I will not modify files unless you explicitly ask.)
</next_steps>
</results>