# Add Query Commands for Agent Access to Requirements

**Labels:** enhancement, phase-3, agent-tools, json-api

## Overview

Add `udd query` commands to provide JSON output for agent consumption. Enables agents to programmatically understand project structure, identify gaps, and assist with requirements discovery.

## Problem

Currently, agents cannot easily:
- Check what actors, journeys exist
- Identify missing scenarios or tests
- Assess project completeness
- Get structured data for decision-making

## Solution

Add `udd query` command with simple subcommands that all support `--json` flag for structured output.

## Commands

### 1. Query Actors

```bash
udd query actors [--json]
```

**Output (JSON):**
```json
{
  "actors": [
    {
      "name": "Developer",
      "journeys": ["developer_adopts_udd", "developer_adds_feature"]
    }
  ]
}
```

### 2. Query Journeys

```bash
udd query journeys [--json]
```

### 3. Query Features

```bash
udd query features [--json]
```

### 4. Query Status with Gaps

```bash
udd query status [--json]
```

**Output (JSON):**
```json
{
  "features": {
    "total": 25,
    "with_tests": 20,
    "passing": 18
  },
  "gaps": {
    "features_without_tests": ["specs/features/export/filter.feature"]
  },
  "completeness": 72
}
```

## Implementation

**File:** `src/commands/query.ts`

```typescript
import { Command } from 'commander';
import { glob } from 'glob';

export function registerQueryCommand(program: Command) {
  const query = program.command('query')
    .description('Query project structure (use --json for agent consumption)');

  query.command('actors')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const actors = await getActors();
      if (options.json) {
        console.log(JSON.stringify({ actors }, null, 2));
      }
    });

  // ... other subcommands
}
```

## Acceptance Criteria

- [ ] `udd query actors` lists actors
- [ ] `udd query journeys` lists journeys
- [ ] `udd query features` lists feature files with test status
- [ ] `udd query status` shows overall project status
- [ ] All commands support `--json` flag
- [ ] JSON output is valid and parseable
- [ ] Tests created for query logic

## Benefits

**For Agents:**
- 🔍 Can understand project structure programmatically
- 📊 Can identify gaps to help fix
- ✅ JSON output easy to parse and use
- 🚀 Can make better decisions about what to suggest

**For Humans:**
- 👁️ Quick status overview
- 🎯 See gaps at a glance
- 📈 Track completeness
