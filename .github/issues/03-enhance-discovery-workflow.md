# Enhance Feature Discovery Workflow

**Labels:** enhancement

## Overview

Add `udd discover feature` command that guides users through SysML-informed requirements discovery, creating rich feature files with comprehensive context.

## Problem

Current workflow:
1. User creates feature file manually
2. File often lacks context (why, alternatives)
3. Scenarios may be incomplete
4. No structured way for agents to help

## Solution

Interactive discovery command that:
- Asks SysML-style questions (who, what, why)
- Prompts for alternatives considered
- Helps identify comprehensive scenarios
- Creates feature file with rich context

## Command

```bash
udd discover feature <domain>/<feature-name>

# Example
udd discover feature export/csv-export
```

## Interactive Workflow

```
$ udd discover feature export/csv-export

🔍 Let's discover requirements for: CSV Export

Understanding User Needs

? Who needs this feature?
  › Data analysts, project managers

? What are they trying to accomplish?
  › Export project data to analyze in Excel

? Why is this important to them?
  › Need to create custom reports and pivot tables

Evaluating Alternatives

? Which approach best serves the user need?
  ❯ CSV export
    Direct Excel export
    REST API

✓ Feature file created: specs/features/export/csv-export.feature
```

## Implementation

**File:** `src/commands/discover.ts`

```typescript
import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';

export function registerDiscoverCommand(program: Command) {
  const discover = program.command('discover')
    .description('Interactive requirements discovery');

  discover.command('feature')
    .argument('<path>', 'Feature path')
    .action(async (featurePath) => {
      // Interactive prompts...
      const featureContent = generateFeature(responses);
      await writeFile(fullPath, featureContent);
    });
}
```

## Acceptance Criteria

- [ ] `udd discover feature` command exists
- [ ] Interactive prompts guide user through discovery
- [ ] Questions follow SysML principles (who, what, why)
- [ ] Generates feature file with rich context
- [ ] Feature file is valid Gherkin
- [ ] Tests created for command

## Benefits

**For Humans:**
- 🎯 Structured process for requirements
- 📝 Don't forget important aspects
- 💡 Prompts help think through alternatives
- ✅ Consistent, high-quality features

**For Agents:**
- 🤖 Can guide discovery process
- 📋 Know what questions to ask
- ✨ Help users create better requirements
