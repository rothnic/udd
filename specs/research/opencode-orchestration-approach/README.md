# Research: OpenCode Orchestration Approach

## Metadata

| Field | Value |
|-------|-------|
| Status | `decided` |
| Created | 2025-11-24 |
| Timebox | 2 days |
| Decision | Custom Commands + Plugins (for blocking behavior) |
| Related Features | [opencode/orchestration](../../features/opencode/orchestration/_feature.yml), [opencode/tools](../../features/opencode/tools/_feature.yml) |

## Question

How should we integrate UDD with OpenCode to enable autonomous iteration until project completion?

## Context

Currently, when using AI agents (VS Code Copilot, OpenCode, etc.) with UDD projects, the developer must manually re-prompt the agent to continue work after each step. The goal is to create a "set it and run" experience where:

1. The agent checks `udd status`
2. Identifies next action (fix failing test, implement scenario, etc.)
3. Performs the action
4. Loops back to step 1 until status is "complete" or "error"

OpenCode provides four extension mechanisms:
- **Custom Commands**: Prompt files with shell command injection (`.opencode/command/*.prompt.md`)
- **Plugins**: JavaScript/TypeScript modules with event hooks (stateful, can block actions)
- **Custom Tools**: Functions the LLM can call (for complex operations)
- **MCP Servers**: External tool integrations

## Alternatives

### Option A: Plugin-Based Orchestration

**Description**: Create an OpenCode plugin that hooks into `session.idle` events and automatically re-prompts the agent based on `udd status` output.

```typescript
// .opencode/plugin/udd-orchestrator.ts
export const UDDOrchestrator = async ({ project, client, $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        const status = await $`udd status --json`.json();
        if (status.complete) return; // Done!
        if (status.error) throw new Error(status.error);
        
        // Auto-continue with next action
        await client.send(getNextPrompt(status));
      }
    }
  }
}
```

**Pros**:
- Fully autonomous loop without user interaction
- Access to rich event system (`tool.execute.after`, `session.error`)
- Can implement sophisticated logic (max iterations, pause conditions)
- Plugin can maintain state across iterations

**Cons**:
- Requires OpenCode-specific code (not portable to other agents)
- Plugin API may change between OpenCode versions
- More complex to debug (runs in background)
- User loses visibility into decision-making

### Option B: Custom Tools Only

**Description**: Create custom tools that expose UDD functionality in a structured way, letting the LLM decide when to iterate.

```typescript
// .opencode/tool/udd-status.ts
export default tool({
  description: "Get UDD project status with recommended next action",
  args: {},
  async execute() {
    const status = await $`udd status --json`.json();
    return {
      ...status,
      recommendation: getRecommendation(status),
      shouldContinue: !status.complete && !status.error
    };
  }
});
```

**Pros**:
- LLM maintains agency and transparency
- Easier to debug (visible in conversation)
- Tools are simpler than plugins
- Can work with agent instructions to create loop

**Cons**:
- Relies on LLM to "remember" to keep calling the tool
- May need explicit "iterate until complete" instruction
- Less control over loop behavior
- Could be interrupted by LLM tangents

### Option C: CLI Wrapper Script

**Description**: Create a shell script or Node.js wrapper that runs `opencode run` in a loop, checking status between runs.

```bash
#!/bin/bash
# udd-iterate.sh
while true; do
  STATUS=$(udd status --json)
  if echo "$STATUS" | jq -e '.complete' > /dev/null; then
    echo "✅ Project complete!"
    exit 0
  fi
  if echo "$STATUS" | jq -e '.error' > /dev/null; then
    echo "❌ Error state"
    exit 1
  fi
  opencode run "Continue iterating on this UDD project. Check status and do next action."
done
```

**Pros**:
- Simple, portable, no OpenCode-specific code
- Easy to understand and debug
- Works with any agent that has CLI mode
- User can see each iteration clearly

**Cons**:
- Loses conversation context between runs (cold start each time)
- No access to OpenCode's event system
- Slower (re-initializes OpenCode each iteration)
- Less sophisticated control

### Option D: Hybrid (Plugin + Custom Tools)

**Description**: Use custom tools for structured data access, plugin for orchestration loop.

```typescript
// .opencode/tool/udd-status.ts - Structured status tool
// .opencode/tool/udd-next.ts - Get recommended next action

// .opencode/plugin/udd-orchestrator.ts
export const UDDOrchestrator = async ({ project, client, $ }) => {
  let iterations = 0;
  const MAX_ITERATIONS = 50;
  
  return {
    "session.idle": async () => {
      if (iterations++ >= MAX_ITERATIONS) {
        throw new Error(`Max iterations (${MAX_ITERATIONS}) reached`);
      }
      // Plugin triggers, but tools provide the data
      await client.send("Run udd-status and continue if needed");
    },
    "tool.execute.after": async (input, output) => {
      if (input.tool === "udd-status" && output.result.complete) {
        // Don't auto-continue, we're done
      }
    }
  }
}
```

**Pros**:
- Best of both worlds: tools for transparency, plugin for automation
- Custom tools work even without plugin (degraded but functional)
- Plugin can be disabled for manual mode
- Clear separation of concerns

**Cons**:
- More code to maintain
- Need to coordinate between plugin and tools
- Complexity may not be justified initially

## Evaluation Criteria

| Criterion | Weight | Option A (Plugin) | Option B (Tools) | Option C (CLI) | Option D (Hybrid) |
|-----------|--------|-------------------|------------------|----------------|-------------------|
| Autonomy | 3 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Transparency | 2 | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Simplicity | 2 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Portability | 1 | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Control | 2 | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ |

## Findings

### 2025-11-24: Initial Analysis

From OpenCode documentation review:

1. **Plugin Events Available**:
   - `session.idle` - Fires when agent completes a turn
   - `session.error` - Fires on errors
   - `tool.execute.before/after` - Can intercept tool calls
   - `todo.updated` - Can track task progress

2. **Custom Tool Capabilities**:
   - Full TypeScript/Zod support
   - Can invoke shell commands via Bun.$
   - Can return structured data for LLM reasoning

3. **CLI Limitations**:
   - `opencode run` is stateless (no session continuity)
   - `opencode serve` + `--attach` could maintain session

4. **Key Insight from PDF**: The user wants to avoid manual re-prompting. This strongly favors Plugin (A) or Hybrid (D) approaches that can auto-continue without user intervention.

## Decision

**Selected**: Custom Commands for status injection, Plugins for blocking/enforcement

**Rationale**: 
1. **Custom Commands are simplest for status**: `.opencode/command/iterate.prompt.md` can inject `udd status` output via `!`udd status --json`` syntax - no code needed.
2. **Plugins for enforcement**: Use `tool.execute.before` hooks to block file writes when project is in bad state (failing tests, missing specs).
3. **Custom Tools reserved for complex operations**: Only needed if we want stateful tool behavior or complex return values.
4. **Agent guidance via prompts**: The iterate prompt already defines the workflow; commands inject the context.

**Architecture**:
```
.opencode/
├── command/
│   └── iterate.prompt.md      # Injects !`udd status --json`
├── plugin/
│   └── udd-enforcement.ts     # Blocks writes when tests fail
└── tool/                      # Reserved for future complex tools
```

**Trade-offs Accepted**:
- Agent must be instructed to call `/iterate` command - acceptable
- Enforcement plugin adds complexity - but critical for spec-first discipline
- No automatic re-prompting (yet) - can add `session.idle` hook in Phase 4

## Learnings

1. **Commands > Tools for context injection**: Simpler, no code, agent can run any command
2. **Plugins for blocking**: Use `tool.execute.before` to enforce project state before allowing changes
3. **Tools for complex returns**: Only when we need structured data beyond CLI output
4. **udd status --json already exists**: No new implementation needed for status!

## Follow-up

- [x] Decide on approach
- [x] `udd status --json` already implemented!
- [ ] Create `.opencode/command/iterate.prompt.md`
- [ ] Create `.opencode/plugin/udd-enforcement.ts` for blocking behavior
- [ ] Test with OpenCode `opencode run "/iterate"`
- [ ] Consider `session.idle` auto-continue in Phase 4
