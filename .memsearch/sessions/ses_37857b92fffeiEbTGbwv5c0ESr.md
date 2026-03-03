# Session ses_37857b92fffeiEbTGbwv5c0ESr

## user (2026-02-22T23:21:28.955Z)

Search the codebase to understand how udd status detects orphaned scenarios. Look for:
1. How status command finds and lists orphaned scenarios
2. What conditions determine if a scenario is "orphaned" 
3. How the manifest tracks which scenarios are referenced by journeys

Focus on files in src/ related to status, orphan detection, and manifest handling. Return key findings about the logic.
---

## assistant (2026-02-22T23:21:28.985Z)

**glob:**

```
Found 15 file(s)

/Users/nroth/workspace/udd/src/commands/status.ts
/Users/nroth/workspace/udd/src/commands/sync.ts
/Users/nroth/workspace/udd/src/commands/init.ts
/Users/nroth/workspace/udd/src/lib/cli-error.ts
/Users/nroth/workspace/udd/src/lib/status.ts
/Users/nroth/workspace/udd/src/commands/validate.ts
/Users/nroth/workspace/udd/src/lib/query.ts
/Users/nroth/workspace/udd/src/commands/query.ts
/Users/nroth/workspace/udd/src/commands/new.ts
/Users/nroth/workspace/udd/src/commands/discover.ts...
```

**grep:**

```
Found 9 match(es) in 2 file(s)

src/lib/status.ts
  69: orphaned_scenarios: string[];
  150: orphaned_scenarios: [],
  486: // 4. Find orphaned scenarios
  491: status.orphaned_scenarios.push(fullId);

src/commands/status.ts
  103: status.orphaned_scenarios.length > 0;
  149: if (status.orphaned_scenarios.length > 0) {
  152: `  ⚠ ${status.orphaned_scenarios.length} orphaned scenario(s)`,
  225: if (status.orphaned_scenarios.length > 0) {
  229: status.orphaned_scenarios.forEach((s) => {

[Agent...
```

**grep:**

```
Found 50 match(es) in 4 file(s)

src/commands/sync.ts
  99: ): Promise<{ manifest: Manifest; wasCorrupted: boolean }> {
  100: const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
  102: const content = await fs.readFile(manifestPath, "utf-8");
  106: userWarn(`Invalid manifest: ${validation.reason}`);
  107: return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
  110: manifest: {
  119: await fs.access(manifestPath);
  122: `Could not parse manifest: ${String((e...
```
---

## assistant (2026-02-22T23:21:36.837Z)

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
<path>/Users/nroth/workspace/udd/src/commands/status.ts</path>
<type>file</type>
<content>1: import chalk from "chalk";
2: import { Command } from "commander";
3: import { getProjectStatus } from "../lib/status.js";
4: 
5: export const statusCommand = new Command("status")
6: 	.description("Summarize current test-based status")
7: 	.option("--json", "Output status as JSON")
8: 	.action(async (options) => {
9: 		try {
10: 			const status = await getProjectStatus();
11: 
12: 			if (options.json) {...
```

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
---

## assistant (2026-02-22T23:21:41.344Z)

**read:**

```
<path>/Users/nroth/workspace/udd/src/commands/init.ts</path>
<type>file</type>
<content>1: import fs from "node:fs/promises";
2: import path from "node:path";
3: import { confirm, input } from "@inquirer/prompts";
4: import chalk from "chalk";
5: import { Command } from "commander";
6: import { userWarn } from "../lib/cli-error.js";
7: 
8: export const initCommand = new Command("init")
9: 	.description("Initialize UDD in a project")
10: 	.option("-y, --yes", "Skip prompts and use defaults")
11: ...
```
---

## assistant (2026-02-22T23:21:48.567Z)

<analysis>
**Literal Request**: "Search the codebase to understand how udd status detects orphaned scenarios. Look for: 1) How status command finds and lists orphaned scenarios 2) What conditions determine if a scenario is 'orphaned' 3) How the manifest tracks which scenarios are referenced by journeys. Focus on files in src/ related to status, orphan detection, and manifest handling. Return key findings about the logic."

**Actual Need**: You need an actionable explanation of the code paths and rules that implement "orphaned scenario" detection so you can (a) verify or change the behaviour, (b) fix false positives/negatives, or (c) extend status to consider journey references from the manifest. You also need exact files/locations to inspect or edit.

**Success Looks Like**: A clear description with exact file paths and the specific code locations (functions/lines) that:
- build the set of referenced scenarios,
- compute orphaned scenarios,
- read/update the manifest and its shape,
and a short recommendation for the next code change if you want the manifest/journeys to be included in orphan detection.
</analysis>

Key automated searches were executed in parallel (file-glob + content grep + multi-file reads). I inspected the returned files to extract the logic and cross-checked manifest handling.

<results>
<files>
- /Users/nroth/workspace/udd/src/lib/status.ts — Main implementation of getProjectStatus(). Builds features, reads use-cases, collects referenced scenarios and computes orphaned_scenarios. Primary place orphan detection happens.
- /Users/nroth/workspace/udd/src/commands/status.ts — CLI command that calls getProjectStatus() and prints orphaned_scenarios; contains display/health logic that uses the orphan list.
- /Users/nroth/workspace/udd/src/commands/sync.ts — Implements sync workflow, manifest load/save/validation and how sync writes manifest.journeys and manifest.scenarios. Shows how journeys map to scenario paths in the manifest.
- /Users/nroth/workspace/udd/src/lib/query.ts — Additional code that reads manifest and product/journeys; mirrors some logic in status.ts for journey staleness and demonstrates manifest usage elsewhere.
- /Users/nroth/workspace/udd/src/commands/init.ts — Shows how an initial manifest is created (specs/.udd/manifest.yml) and confirms manifest shape used by sync/status.
</files>

<answer>
Summary of how "orphaned scenarios" are detected and how the manifest tracks scenario references.

1) Where status finds and lists orphaned scenarios
- The orphan detection is implemented in getProjectStatus() in /Users/nroth/workspace/udd/src/lib/status.ts.
  - Steps:
    - It enumerates all features by finding specs/features/**/_feature.yml and then lists .feature files in each feature directory (lines ~238–279 and ~280–356).
    - It builds status.features[featureId].scenarios with each scenario's slug and E2E status.
    - It parses specs/use-cases/*.yml and builds a Set called referencedScenarios by adding scenario IDs found in:
      - useCase.outcomes entries with outcome.scenarios (each scenarioId added via referencedScenarios.add(...)) (lines ~401–458 and ~420–422).
      - useCase.scenarios list at top-level of the use-case YAML (lines ~461–483 and ~463–464).
    - After building referencedScenarios, it iterates all discovered scenarios and if a scenario's fullId (constructed as `${featureId}/${slug}`) is not in referencedScenarios, it appends that id to status.orphaned_scenarios (lines ~486–494).
  - The CLI printing is in /Users/nroth/workspace/udd/src/commands/status.ts. If status.orphaned_scenarios.length > 0 it prints the list under "Orphaned Scenarios (Not linked to Use Case):" (lines ~225 and ~225–231 and ~149–155 in printing logic).

2) What conditions determine if a scenario is "orphaned"
- A scenario is considered orphaned iff:
  - It exists on disk under specs/features/... (discovered into status.features) AND
  - No use case (files in specs/use-cases/*.yml) references it (i.e., the Set referencedScenarios does not contain the scenario id).
- Important details about expected ID format:
  - Scenarios are referenced in use-cases as strings like "area/feature/slug" (the code splits on the last '/' to get featureId and slug) (see parsing logic lines ~420–436 and ~466–474).
  - The featureId used when constructing fullId comes from the feature metadata file _feature.yml's id field (status.ts reads that into featureId at line ~265).
- Consequence / nuance:
  - getProjectStatus() only considers use-case references (specs/use-cases/*.yml) when deciding referencedScenarios. It does not use the product/journeys or the manifest.scenarios entries as part of referencedScenarios.
  - Therefore, a scenario that is referenced only from product/journeys/ (and possibly present in the manifest) but not referenced in any use-case YAML will be reported as orphaned by status. The code that parses product/journeys (earlier in getProjectStatus, lines ~155–236) collects linkedScenarios per journey for status.journeys, but those linkedScenarios are not added to the referencedScenarios set that determines orphaned scenarios.

3) How the manifest tracks which scenarios are referenced by journeys
- manifest format and handling is implemented in /Users/nroth/workspace/udd/src/commands/sync.ts:
  - Manifest shape:
    - top-level keys: journeys (map) and scenarios (map).
    - Each manifest.journeys[journeyKey] has { path: string, hash: string, scenarios: string[] } (see ManifestJourney interface at top of sync.ts lines ~24–28 and validateManifest checks lines ~160–176).
    - Each manifest.scenarios[scenarioPath] has { hash: string, test: string, status: "pending" | "passing" | "failing" } (see ManifestScenario interface lines ~30–34 and validateManifest lines ~179–201).
  - sync behaviour:
    - loadManifest(specsDir) reads specs/.udd/manifest.yml and validates shape (loadManifest/validateManifest lines ~97–129 and ~131–205).
    - When sync parses journeys (product/journeys/*.md), it collects the scenario paths referenced in each journey and sets updatedManifest.journeys[journeyKey].scenarios = scenarios (lines ~369–437 and specifically updating manifest at ~432–437).
    - When sync creates missing scenario files it also creates tests and updates updatedManifest.scenarios[step.scenarioPath] = { hash, test, status } (lines ~422–427).
    - sync also checks manifest entries for missing files and hash mismatches and warns (lines ~304–326).
- Where manifest is used elsewhere:
  - getProjectStatus() and query.getJourneys() read the manifest to determine if journeys are stale by comparing journey file content hash with manifest.journeys[journeyKey].hash (status.ts lines ~160–183; query.ts lines ~129–132).
  - But the manifest's scenario lists are not currently consulted by getProjectStatus() to mark a scenario as referenced for orphan detection.

Key code locations (for quick reference)
- Orphan detection: /Users/nroth/workspace/udd/src/lib/status.ts — referencedScenarios set creation and orphan loop (approx lines 380–486). Specifically:
  - referencedScenarios.add(...) for outcomes and scenarios: lines ~420–424 and ~461–464
  - orphaning condition: lines ~486–494 (if !referencedScenarios.has(fullId) -> push to orphaned_scenarios)
- Manifest load/save/validate: /Users/nroth/workspace/udd/src/commands/sync.ts — loadManifest(), validateManifest(), saveManifest() (lines ~97–129, ~131–205, ~207–215)
- Manifest updates: /Users/nroth/workspace/udd/src/commands/sync.ts — updatedManifest.journeys[...] and updatedManifest.scenarios[...] assignments when syncing (lines ~432–437 and ~422–427)
- CLI display of orphan list: /Users/nroth/workspace/udd/src/commands/status.ts — printing of status.orphaned_scenarios (lines ~225–231 and ~149–156)

Implications and gotchas
- If you expect journeys (product/journeys/*) or manifest.journeys to count as references to scenarios, that is not currently the case: only specs/use-cases/*.yml are considered "authoritative" references for the orphan calculation. This can produce false positives: scenarios created by sync from journeys that are not yet added to use-cases will be shown as orphaned.
- The manifest accurately records which scenario paths are referenced by each journey (sync writes journey.scenarios arrays), and the manifest also tracks scenario metadata when sync creates tests. But that manifest data isn't used when computing orphaned_scenarios.

If your goal is to change orphan detection to consider manifest.journeys or the product/journeys references, the logical change-point is getProjectStatus() in /src/lib/status.ts: add manifest or journey-linked scenario IDs into referencedScenarios before the orphanization loop.

</answer>

<next_steps>
- If you want orphan detection to include journey/manifest references: modify getProjectStatus() (/Users/nroth/workspace/udd/src/lib/status.ts) to load specs/.udd/manifest.yml (or reuse sync.ts's loadManifest()) and add manifest.journeys[j].scenarios entries into referencedScenarios before the orphan loop.
- To debug a specific orphaned scenario right now: run udd status --json to see status.orphaned_scenarios, open the scenario file to confirm feature id (from _feature.yml), then check specs/use-cases/*.yml for a matching reference or product/journeys/*.md and specs/.udd/manifest.yml to see if it's referenced only by journeys.
- Ready to proceed — I can:
  - produce a patch that adds manifest-based references into orphan detection (diff + suggested code),
  - or write a short unit test demonstrating the current behaviour and the desired change.
</next_steps>
</results>