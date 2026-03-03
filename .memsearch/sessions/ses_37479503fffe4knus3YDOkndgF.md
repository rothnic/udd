# Session ses_37479503fffe4knus3YDOkndgF

## user (2026-02-23T17:23:16.534Z)



---

[SYSTEM DIRECTIVE: OH-MY-OPENCODE - PROMETHEUS READ-ONLY]

You are being invoked by Prometheus (Plan Builder), a READ-ONLY planning agent.

**CRITICAL CONSTRAINTS:**
- DO NOT modify any files (no Write, Edit, or any file mutations)
- DO NOT execute commands that change system state
- DO NOT create, delete, or rename files
- ONLY provide analysis, recommendations, and information

**YOUR ROLE**: Provide consultation, research, and analysis to assist with planning.
Return your findings and recommendations. The actual implementation will be handled separately after planning is complete.

---

I need to analyze the current UDD codebase to understand:

1. **Current concept definitions**:
   - How is "use case" defined in code (look at UseCaseSpecSchema in src/types.ts)
   - How is "feature" defined?
   - How is "scenario" defined?
   - How is "journey" defined?

2. **Current relationships**:
   - How do these concepts link together currently?
   - What are the explicit references (foreign keys)?
   - What are the implicit relationships?

3. **Current gaps**:
   - What's missing for traceability?
   - Where are the disconnects?
   - What concepts overlap or conflict?

4. **File structure analysis**:
   - Look at actual use case YAML files
   - Look at actual feature _feature.yml files
   - Look at actual scenario .feature files
   - Look at journey .md files
   - Document the current hierarchy and patterns

Please read the relevant files and provide a comprehensive analysis of the current state, including concrete examples from the codebase.
---

## assistant (2026-02-23T17:23:16.540Z)

**grep:**

```
Found 4 match(es) in 2 file(s)

./src/lib/validator.ts
  8: UseCaseSpecSchema,
  54: const result = UseCaseSpecSchema.safeParse(data);

./src/types.ts
  14: export const UseCaseSpecSchema = z.object({
  91: export type UseCaseSpec = z.infer<typeof UseCaseSpecSchema>;

[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use task with explore/librarian agents for better results:

```
// Parallel exploration - fire multiple agents sim...
```

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
Found 31 file(s)

./specs/features/udd/cli/status_edge_cases.feature
./specs/features/udd/cli/init_edge_cases.feature
./specs/features/udd/cli/manifest_recovery.feature
./specs/features/udd/cli/orphan_detection.feature
./specs/features/udd/cli/sync_edge_cases.feature
./specs/features/udd/cli/validation/validate_completeness.feature
./specs/features/udd/cli/validation/discover_feature.feature
./specs/features/udd/agent/query_commands.feature
./specs/features/udd/cli/scaffold_feature.feature
./spe...
```

**glob:**

```
Found 10 file(s)

./specs/features/udd/dev-experience/test_discovery/_feature.yml
./specs/features/udd/dev-experience/_feature.yml
./specs/features/udd/cli/inbox/_feature.yml
./specs/features/udd/cli/wip_support/_feature.yml
./specs/features/udd/agent/wip_enforcement/_feature.yml
./specs/features/udd/agent/wip_support/_feature.yml
./specs/features/udd/agent/_feature.yml
./specs/features/opencode/orchestration/_feature.yml
./specs/features/opencode/tools/_feature.yml
./specs/features/udd/cli/_fea...
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
Found 17 match(es) in 4 file(s)

./docs/project/TEMP_SEED_DOC.md
  125: interface UseCaseSpec {
  308: * Every `specs/use-cases/*.yml` matches `UseCaseSpec` schema and each `scenarios` entry points to an existing `.feature` file.
  377: * To define schemas for `VisionFrontmatter`, `UseCaseSpec`, `FeatureSpec`, `TechnicalRequirement`, `SpecChange`, `ProjectStatus`.
  458: * UseCaseSpec
  654: * `UseCaseSpec`: drop `status`.

./src/types.ts
  14: export const UseCaseSpecSchema = z.object({
  91: e...
```

**grep:**

```
Found 284 match(es) in 30 file(s)

./AGENTS.md
  3: UDD is a spec-first workflow where **user journeys are requirements** and **BDD scenarios are tests**.
  28: └── journeys/                     # User outcomes
  29: └── *.md                      # One file per journey
  44: 2. **Journeys define intent** in `product/journeys/`
  53: | `udd status` | Show journey → scenario → test coverage |
  54: | `udd sync` | Detect journey changes, propose scenarios |
  56: | `udd new journey <slug>` | Create...
```
---

## assistant (2026-02-23T17:23:27.100Z)

**glob:**

```
Found 11 file(s)

./specs/use-cases/edge_case_hardening.yml
./specs/use-cases/orchestrated_iteration.yml
./specs/use-cases/run_tests.yml
./specs/use-cases/capture_ideas.yml
./specs/use-cases/phased_development.yml
./specs/use-cases/validate_specs.yml
./specs/use-cases/fix_test_discovery.yml
./specs/use-cases/enforce_code_style.yml
./specs/use-cases/agent_customization.yml
./specs/use-cases/manage_wip.yml
./specs/use-cases/project_setup.yml
[Agent Usage Reminder]

You called a search/fetch tool d...
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

**read** (input): {"filePath":"/Users/nroth/workspace/udd/product/journeys/new_user_onboarding.md"}

**read:**

```
<path>/Users/nroth/workspace/udd/specs/features/udd/cli/_feature.yml</path>
<type>file</type>
<content>1: id: "udd/cli"
2: area: "udd"
3: name: "UDD CLI"
4: summary: "Command line interface for UDD"
5: use_cases:
6:   - "validate_specs"
7:   - "scaffold_specs"
8:   - "run_tests"
9: phase: 1
10: kind: "core"

(End of file - total 10 lines)
</content>
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/features/udd/cli/sync_edge_cases.feature</path>
<type>file</type>
<content>1: Feature: Sync command edge cases
2: 
3:   # These scenarios cover edge cases for the `udd sync` command.
4:   # Keep steps concrete so E2E tests can exercise filesystem states and
5:   # verify user-observable output. Do not prescribe internal implementation.
6: 
7:   Scenario: No journeys directory present
8:     Given I am in an empty project directory
9:     When I run "udd syn...
```
---

## assistant (2026-02-23T17:23:37.861Z)

**read:**

```
<path>/Users/nroth/workspace/udd/src/commands/sync.ts</path>
<type>file</type>
<content>1: import crypto from "node:crypto";
2: import fs from "node:fs/promises";
3: import path from "node:path";
4: import { confirm } from "@inquirer/prompts";
5: import chalk from "chalk";
6: import { Command } from "commander";
7: import yaml from "yaml";
8: import { userWarn } from "../lib/cli-error.js";
9: 
10: interface JourneyStep {
11: 	description: string;
12: 	scenarioPath: string | null;
13: }
14: 
15: ...
```

**read:**

```
<path>/Users/nroth/workspace/udd/src/lib/validator.ts</path>
<type>file</type>
<content>1: import fs from "node:fs/promises";
2: import path from "node:path";
3: import { glob } from "glob";
4: import yaml from "yaml";
5: import {
6: 	FeatureSpecSchema,
7: 	TechnicalRequirementSchema,
8: 	UseCaseSpecSchema,
9: 	VisionFrontmatterSchema,
10: } from "../types.js";
11: 
12: export interface ValidationResult {
13: 	valid: boolean;
14: 	errors: string[];
15: }
16: 
17: export async function validateSp...
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml</path>
<type>file</type>
<content>1: id: edge_case_hardening
2: name: Edge Case Hardening
3: summary: "Link edge-case CLI and agent scenarios created during the edge-case-hardening plan"
4: actors:
5:   - developer
6:   - agent
7: outcomes:
8:   - description: "Edge-case CLI and agent scenarios are discoverable and linked to a use case"
9:     scenarios:
10:       - "udd/cli/sync_edge_cases"
11:       - "udd/cli/status_edge...
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/use-cases/project_setup.yml</path>
<type>file</type>
<content>1: id: project_setup
2: name: Project Setup
3: summary: "Initialize and configure the UDD project for development"
4: actors:
5:   - developer
6:   - agent
7: outcomes:
8:   - description: "Dependencies are installed"
9:     scenarios:
10:       - "udd/cli/setup"
11:   - description: "CLI tool is linked and available globally"
12:     scenarios:
13:       - "udd/cli/setup"

(End of file - total 1...
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/features/udd/cli/_feature.yml</path>
<type>file</type>
<content>1: id: "udd/cli"
2: area: "udd"
3: name: "UDD CLI"
4: summary: "Command line interface for UDD"
5: use_cases:
6:   - "validate_specs"
7:   - "scaffold_specs"
8:   - "run_tests"
9: phase: 1
10: kind: "core"

(End of file - total 10 lines)
</content>
```

**read:**

```
<path>/Users/nroth/workspace/udd/specs/features/udd/cli/orphan_detection.feature</path>
<type>file</type>
<content>1: # Feature: Orphan detection in status output
2: #
3: # Purpose: Ensure the status command reports scenarios that exist in features
4: # but are not referenced by any use case or journey. Keep steps implementation-
5: # agnostic and focused on observable CLI output and JSON output.
6: 
7: Feature: Orphan detection
8: 
9:   Background:
10:     Given I have a valid UDD spec structur...
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
---

## assistant (2026-02-23T17:23:53.498Z)

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

**glob:**

```
Found 31 file(s)

./specs/features/udd/cli/status_edge_cases.feature
./specs/features/udd/cli/init_edge_cases.feature
./specs/features/udd/cli/manifest_recovery.feature
./specs/features/udd/cli/orphan_detection.feature
./specs/features/udd/cli/sync_edge_cases.feature
./specs/features/udd/cli/validation/validate_completeness.feature
./specs/features/udd/cli/validation/discover_feature.feature
./specs/features/udd/cli/scaffold_feature.feature
./specs/features/udd/agent/query_commands.feature
./spe...
```
---

## assistant (2026-02-23T17:24:10.561Z)

<analysis>
**Literal Request**: "Analyze the current UDD codebase to understand how 'use case', 'feature', 'scenario', and 'journey' are defined (look at UseCaseSpecSchema in src/types.ts), how they link together (explicit/implicit references), what's missing for traceability, and show file-structure examples (use case YAMLs, feature _feature.yml, scenario .feature, journey .md)."

**Actual Need**: You want a complete, actionable map of the domain model and traceability surface in this repository: type/schema definitions, where semantic links are implemented in code, the formats used by authors (YAML, feature files, journeys), concrete examples, and identification of places where formats or conventions mismatch (gaps). The goal is to be able to reason about improvements (e.g., canonical scenario IDs, manifest normalization) and to act without another round of file lookups.

**Success Looks Like**:
- Clear canonical definitions of UseCase / Feature / Scenario / Journey as implemented in code (fields and expected formats).
- Precise list of explicit foreign keys and where they are checked/created (functions/files).
- Catalogue of implicit conventions (path and naming conventions) and where they are relied upon (sync, validator, status, query).
- Concrete examples from repository files showing real data and how the links are expressed.
- A concise list of files to inspect or change next (absolute paths), plus concrete next steps to fix traceability gaps or to continue work immediately.
</analysis>

Parallel searches/extractions were executed at the start (multiple tools called simultaneously to read and grep the repo): I used type-aware and text searches and read the key files in parallel to cross-check definitions and references.

Summary findings (high level)
- The canonical schema types live in: /Users/nroth/workspace/udd/src/types.ts. UseCase, Feature, and Requirement schemas are Zod schemas there.
- Use cases (specs/use-cases/*.yml) reference scenarios using an ID format like area/feature/slug (e.g. "udd/cli/sync_edge_cases"). Validator maps those IDs to files under specs/features/<area>/<feature>/<slug>.feature.
- Features are declared via per-feature metadata files _feature.yml under specs/features/**/_feature.yml (FeatureSpecSchema). Those _feature.yml files include a use_cases array that lists use case IDs (strings).
- Scenarios are Gherkin (.feature) files under specs/features/<area>/<feature>/*.feature. Scenario identity is derived from the combination: feature id (defined by _feature.yml) + slug (feature file basename).
- Journeys are author-authored markdown files under product/journeys/*.md. They are parsed by the sync and query/status code. Journey steps optionally contain an explicit path to a scenario in a Markdown inline code span (e.g. `specs/features/foo/bar.feature`) which the sync command uses to create scenario files and manifest entries.
- The sync process builds and updates specs/.udd/manifest.yml with journeys and manifest.scenarios keys — but the key format used in the manifest is the literal scenarioPath captured from journeys (i.e., the journey-provided path, often a full relative path like "specs/features/... .feature"). Use-case references use a different canonical form (area/feature/slug). This mismatch is the core traceability gap.

Structured results

<results>
<files>
- /Users/nroth/workspace/udd/src/types.ts — canonical Zod schemas (UseCaseSpecSchema, FeatureSpecSchema, TechnicalRequirementSchema): definitive definitions of "use case", "feature", "requirement".
- /Users/nroth/workspace/udd/src/lib/validator.ts — validation logic that enforces links between VISION.md, use-cases, features, scenarios, and requirements (checks that use-case scenario IDs point to files under specs/features).
- /Users/nroth/workspace/udd/src/commands/sync.ts — sync implementation: parses product/journeys/*.md, creates scenario files and tests, updates specs/.udd/manifest.yml. Shows how journeys reference scenarios (inline code path) and how the manifest is populated.
- /Users/nroth/workspace/udd/src/lib/status.ts — project status builder that assembles features, scenarios, use-cases, journeys and computes orphaned scenarios; shows how scenario IDs are composed and how journeys are parsed and compared to manifest entries.
- /Users/nroth/workspace/udd/src/lib/query.ts — query endpoints: getActors, getJourneys, getFeatures — includes journey parsing and scenario path handling for CLI queries.
- /Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml — concrete use-case example referencing scenarios (shows format: area/feature/slug).
- /Users/nroth/workspace/udd/specs/use-cases/project_setup.yml — concrete use-case example.
- /Users/nroth/workspace/udd/specs/use-cases/orchestrated_iteration.yml — (one of the set of use case YAMLs found) — real examples of use_case files.
- /Users/nroth/workspace/udd/specs/use-cases/run_tests.yml
- /Users/nroth/workspace/udd/specs/use-cases/capture_ideas.yml
- /Users/nroth/workspace/udd/specs/use-cases/phased_development.yml
- /Users/nroth/workspace/udd/specs/use-cases/validate_specs.yml
- /Users/nroth/workspace/udd/specs/use-cases/fix_test_discovery.yml
- /Users/nroth/workspace/udd/specs/use-cases/enforce_code_style.yml
- /Users/nroth/workspace/udd/specs/use-cases/agent_customization.yml
- /Users/nroth/workspace/udd/specs/use-cases/manage_wip.yml
- /Users/nroth/workspace/udd/specs/features/udd/cli/_feature.yml — feature metadata (FeatureSpecSchema): includes id, area, use_cases array (explicitly links features -> use cases).
- /Users/nroth/workspace/udd/specs/features/udd/agent/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/agent/wip_enforcement/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/agent/wip_support/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/cli/inbox/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/cli/wip_support/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/dev-experience/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/dev-experience/test_discovery/_feature.yml
- /Users/nroth/workspace/udd/specs/features/opencode/orchestration/_feature.yml
- /Users/nroth/workspace/udd/specs/features/opencode/tools/_feature.yml
- /Users/nroth/workspace/udd/specs/features/udd/cli/sync_edge_cases.feature — example scenario file that a use-case might reference (Gherkin). Used by use-case edge_case_hardening.yml.
- /Users/nroth/workspace/udd/specs/features/udd/cli/orphan_detection.feature — scenario file demonstrating orphan detection behavior and how scenarios are referenced in tests.
- /Users/nroth/workspace/udd/specs/features/udd/cli/status_edge_cases.feature — scenario file (listed among scenarios).
- /Users/nroth/workspace/udd/specs/features/udd/cli/scaffold_feature.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/manifest_recovery.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/init_edge_cases.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/validation/validate_completeness.feature
- /Users/nroth/workspace/udd/specs/features/udd/agent/query_commands.feature
- /Users/nroth/workspace/udd/specs/features/opencode/orchestration/configurable_iteration.feature
- /Users/nroth/workspace/udd/specs/features/opencode/orchestration/iterate_until_complete.feature
- /Users/nroth/workspace/udd/specs/features/opencode/orchestration/stop_on_error.feature
- /Users/nroth/workspace/udd/specs/features/udd/dev-experience/commit_hooks.feature
- /Users/nroth/workspace/udd/specs/features/udd/dev-experience/code_formatting.feature
- /Users/nroth/workspace/udd/specs/features/udd/dev-experience/test_discovery/editor_status.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/inbox/add_item_via_cli.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/run_tests.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/setup.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/check_status.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/lint_valid_specs.feature
- /Users/nroth/workspace/udd/specs/features/udd/cli/lint_invalid_specs.feature
- /Users/nroth/workspace/udd/specs/.udd/manifest.yml — manifest location used by sync/status (note: file may not exist in repo root but is created/updated at runtime by sync).
- /Users/nroth/workspace/udd/product/journeys — directory where journeys are authored (note: this directory may be empty in tree; commands create or expect files here).
</files>

<answer>
I. Canonical definitions (what the code says)
- Use case (UseCaseSpecSchema in /Users/nroth/workspace/udd/src/types.ts)
  - Fields:
    - id: string
    - name: string
    - summary: string
    - actors?: string[]
    - outcomes?: array of objects with:
      - description: string
      - scenarios?: array of string
    - phase?: number
  - Important: Use-case scenarios are represented as strings (scenario identifiers). The validator expects these strings to be in the form "area/feature/slug" and resolves them to the file path specs/features/<area>/<feature>/<slug>.feature (see validator.safeParse and file existence checks in /src/lib/validator.ts).

- Feature (FeatureSpecSchema in /Users/nroth/workspace/udd/src/types.ts, and the _feature.yml files)
  - Fields:
    - id: string (feature id)
    - area: string
    - name: string
    - summary: string
    - use_cases?: string[] (list of use case ids)
    - phase?: number
    - kind?: "core" | "extension" | "experimental"
    - plus research/tech_spec flags
  - Important: The feature's metadata is stored in _feature.yml under specs/features/**/_feature.yml. Features do not list scenario filenames explicitly in the schema. Scenario discovery is done by scanning the feature directory for .feature files (see /src/lib/status.ts and /src/lib/query.ts).

- Scenario
  - Scenario identity is implicit:
    - feature id (from _feature.yml) + slug (file basename of the .feature file) -> gives the canonical scenario ID used by use cases, e.g., "udd/cli/sync_edge_cases".
  - Files are Gherkin .feature files under specs/features/<area>/<feature>/<slug>.feature (examples: /Users/nroth/workspace/udd/specs/features/udd/cli/sync_edge_cases.feature).
  - Additional tags like @phase:N can appear in the preamble and are used to determine deferral/phase logic.

- Journey
  - Author-created markdown files under product/journeys/*.md.
  - Parsed by sync and query/status code: they contain a header "# Journey: Name", optional "**Actor:**" and "**Goal:**" meta lines, and enumerated steps in the pattern:
      1. Description → `specs/features/<area>/<feature>/<slug>.feature`
    The sync parser extracts the backticked path (anything inside `...`) as the scenarioPath for that step.
  - The sync command uses the journey steps to create scenario files, test stubs, and to populate/update the specs/.udd/manifest.yml with keys equal to the literal scenarioPath captured from the journey.

II. How the concepts link together (explicit and implicit links)
- Explicit links (code-enforced or schema fields)
  1. Feature → Use Cases: _feature.yml has use_cases: [ "use_case_id", ... ] (explicit linking). Validator checks FeatureSpecSchema.
     - File: /Users/nroth/workspace/udd/specs/features/udd/cli/_feature.yml (shows use_cases: ["validate_specs","scaffold_specs","run_tests"])
  2. Use Case → Scenarios: use-case YAML outcomes[].scenarios or scenarios[] contain scenario IDs like "area/feature/slug". validator resolves these to files under specs/features/<area>/<feature>/<slug>.feature (file existence check in /src/lib/validator.ts).
     - Example: /Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml contains:
       scenarios:
         - "udd/cli/sync_edge_cases"
  3. Requirement → Feature & Scenarios: TechnicalRequirementSchema has feature: string and scenarios: string[]; validator also checks those scenario files exist.
     - File: /Users/nroth/workspace/udd/src/types.ts (TechnicalRequirementSchema).
  4. Manifest (specs/.udd/manifest.yml) — created/updated by sync:
     - manifest.journeys[journeyKey] = { path, hash, scenarios: [ ... ] } (journey-level record)
     - manifest.scenarios[scenarioPath] = { hash, test, status } (scenario-level record)
     - Note: manifest scenario keys are the literal scenarioPath strings captured from journeys (often a path starting "specs/..."). See /src/commands/sync.ts.

- Implicit links (conventions enforced by code but not present as typed foreign keys)
  1. Feature id <-> feature directory: _feature.yml is kept in same directory as .feature files; code uses path dirname to derive the feature directory and the feature id (see status.ts and query.ts where featureDir is used and path.relative("specs/features", featureDir)).
  2. Scenario test mapping: test file path is computed from feature path:
     - tests/e2e/<relativeFeatureDir>/<slug>.e2e.test.ts is the canonical test path derived from the scenario file path (see /src/lib/status.ts and /src/lib/query.ts).
  3. Journey step scenario path vs use-case scenario id:
     - Journeys use inline code blocks in steps to reference scenarios (e.g., `specs/features/foo/bar.feature`), but use-cases use area/feature/slug tokens. The sync/manifest uses the journey literal path as manifest key while validator expects the area/feature/slug form for use cases. This creates two co-existing canonical forms for scenarios.

III. Concrete code examples showing the links
- Use case -> scenario check:
  - /src/lib/validator.ts: for each use-case file it does:
      referencedScenarios.add(scenarioPath);
      const featurePath = path.join(specsDir, "features", `${scenarioPath}.feature`);
      await fs.access(featurePath)  // fail -> validation error "References missing scenario <scenarioPath>"
  - Example: specs/use-cases/edge_case_hardening.yml lists "udd/cli/sync_edge_cases"; validator expects file at specs/features/udd/cli/sync_edge_cases.feature

- Feature -> use_case:
  - /specs/features/udd/cli/_feature.yml contains:
    use_cases:
      - "validate_specs"
      - "scaffold_specs"
      - "run_tests"
  - validator loads _feature.yml and validates via FeatureSpecSchema.

- Journey parsing and manifest update:
  - /src/commands/sync.ts parseJourneyFile extracts `scenarioPath` as the string inside backticks (line 71 in that file).
  - When sync creates a new scenario it uses step.scenarioPath directly to:
      updatedManifest.scenarios[step.scenarioPath] = { hash: hashContent(scenarioContent), test: testPath, status: "pending" }
  - So manifest keys are the journey-provided strings (often full relative paths).

- Status & orphan detection:
  - /src/lib/status.ts /src/lib/query.ts build a list of referencedScenarios from use-cases and requirements (they add area/feature/slug strings).
  - Later they iterate discovered scenarios (collected as featureId + slug) and if a discovered scenario fullId (featureId/slug) is not in referencedScenarios then it is treated as orphaned. That works when scenario canonicalization is consistent.

IV. Current gaps, conflicts, and where traceability breaks
1. Dual scenario identifier formats (core problem)
   - Use cases and requirements refer to scenarios using the compact form: "area/feature/slug".
   - Journeys reference scenarios by literal file path (e.g., "specs/features/area/feature/slug.feature").
   - The manifest (sync) uses the journey literal as the manifest.scenarios key.
   - Consequence: The code has two canonical forms. Validator enforces the "area/feature/slug" form; sync produces manifest keys in a different form. If anything relies on matching manifest.scenarios keys to the use-case references directly, they will not match unless normalized. This is the primary source of traceability fragility.

2. Feature metadata doesn't list scenarios
   - FeatureSpecSchema does not include an explicit list of scenario slugs for the feature. Scenarios are discovered by scanning the directory. That is not inherently bad, but it means there is no explicit typed "feature -> scenario list" link in YAML — only implicit via file layout. This makes programmatic lookups reliant on consistent filesystem layout.

3. Manifest uses journey-derived path strings as scenario keys (non-canonical)
   - Because sync stores scenario entries keyed by the journey-provided path, other tools that expect "area/feature/slug" may need to convert/match formats. There is no single canonical normalization function in code shared across validator, status, and sync — duplication of path handling occurs in multiple places (validateManifest, getProjectStatus, sync).

4. No strict canonical ID normalization utilities
   - Path manipulation and canonicalization logic is duplicated and ad-hoc across sync.ts, status.ts, validator.ts, query.ts. Creating a single canonicalizer (e.g., to convert between "area/feature/slug" and "specs/features/area/feature/slug.feature") would reduce bugs.

5. Journeys aren't validated against use-case IDs
   - Journeys link to scenarios directly (file paths). There is no mandatory step that ensures a journey also points to a use case id, nor that use-cases reference journey IDs. The manifest creates a journey-to-scenarios mapping, but the authoritative traceability from journey -> use-case -> scenario is only implicit and must be assembled by cross comparing use case scenario IDs with the manifest keys (after normalization). There is no explicit "use_case" field in journey files.

6. No explicit scenario ID field inside the generated .feature files
   - The scenario file's identity is derived from its path. There is no explicit YAML/metadata header inside .feature files that records canonical IDs. Using a consistent header or comment at top of feature files (e.g., "# id: area/feature/slug") would make linkage robust.

7. Manifest validation & schema: manifest shape checks are present (/src/commands/sync.ts validateManifest) but the validator in /src/lib/validator.ts expects and checks different formats (it maps use-case IDs to specs/features/... files). There is no cross-check that manifest.scenarios keys are normalized or match use-case referenced IDs.

V. File structure & patterns (how authors currently structure content)
- Use cases: YAML files in specs/use-cases/*.yml
  - Canonical example: /Users/nroth/workspace/udd/specs/use-cases/edge_case_hardening.yml
    - id: edge_case_hardening
    - outcomes[0].scenarios: [ "udd/cli/sync_edge_cases", ... ]
- Features: metadata in specs/features/**/_feature.yml
  - Example: /Users/nroth/workspace/udd/specs/features/udd/cli/_feature.yml includes id: "udd/cli" and use_cases: [ ... ]
  - Directory layout: specs/features/<area>/<feature>/*.feature (scenario files live here)
- Scenarios: files under specs/features/<area>/<feature>/<slug>.feature
  - Example: /Users/nroth/workspace/udd/specs/features/udd/cli/sync_edge_cases.feature (Gherkin)
- Journeys: author-authored markdown under product/journeys/*.md
  - Pattern:
    # Journey: <Name>
    **Actor:** ...
    **Goal:** ...
    1. Step description → `specs/features/auth/signup.feature`
  - Sync reads these markdown files and may create scenario and test files if scenario files are missing.
- Manifest: specs/.udd/manifest.yml (created/updated by sync) contains:
  - journeys: mapping of journeyKey -> { path, hash, scenarios: [ ... ] }
  - scenarios: mapping of scenarioPath -> { hash, test, status } (scenarioPath is the literal from journey steps)
- Tests: E2E tests are expected at tests/e2e/<relativeFeatureDir>/<slug>.e2e.test.ts and are created by sync when scenario files are generated.

VI. Actionable examples of the mismatches (concrete)
- Use-case entry (edge_case_hardening.yml):
  - "udd/cli/sync_edge_cases" -> validator expects file at specs/features/udd/cli/sync_edge_cases.feature (it constructs path using the scenario string).
- Journey step captured in sync.ts:
  - A journey step may contain `specs/features/udd/cli/sync_edge_cases.feature` (full path). sync stores this literal in manifest.scenarios under that exact key. Later validator's referencedScenarios uses "udd/cli/sync_edge_cases" (compact form). They are different strings, so direct manifest -> use-case comparison will fail unless normalized.

VII. Bottom line / Recommendations (concrete)
- Introduce a canonical scenario ID normalizer utility (single exported function) that:
  - Converts "area/feature/slug" <-> "specs/features/area/feature/slug.feature"
  - Normalize both journey-provided paths and use-case references to the same canonical token (prefer the compact "area/feature/slug" as canonical).
  - Update sync.ts to store manifest.scenarios keys using the canonical compact form rather than the raw journey path.
  - Update validator/status/query to always use the single canonicalizer when comparing references.
- Consider adding an explicit id header/comment inside generated .feature files (e.g., at top: "# id: area/feature/slug") so that discovery can confirm canonical identity without reconstructing from paths.
- Optionally add an optional use_case: <id> field to journey frontmatter to make journey->use-case linkage explicit.
- Consolidate duplicated path logic into a module (e.g., src/lib/identifiers.ts) used by sync, validator, status, query.
- Add a manifest normalization check: if manifest.scenarios contains non-canonical keys, migrate them to canonical keys on next sync (with a migration step that preserves test/status entries).

</answer>

<next_steps>
- If you want I can produce a PR sketch (read-only diff/patch plan) with:
  1) a canonicalizer utility and tests,
  2) a small sync.ts change to store canonical scenario keys,
  3) updates to validator/status/query to use canonical keys,
  4) a migration step for existing manifest entries.
- Or, if you prefer, start by adding a small RFC doc under docs/ describing canonical ID format and mapping rules. Tell me which path you prefer and I will outline the exact code changes and tests to implement (no files will be edited until you ask).
</next_steps>
</results>