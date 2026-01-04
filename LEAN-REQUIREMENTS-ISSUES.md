# Lean Requirements Model - GitHub Issues Created

**Date:** 2026-01-04  
**Status:** Ready for creation  
**Location:** `/tmp/udd-issues/`

## Summary

I have created **12 detailed GitHub issues** (plus README and automation script) for implementing the Lean Requirements Model with JTBD and Agent Query Interface in UDD. These issues break down the comprehensive analysis from the problem statement into manageable, well-defined implementation tasks.

## What Was Created

### Issue Files (13 files, ~4,500 lines)

1. **01-research-lean-requirements-model.md** (4.5K)
   - Research document capturing problem, alternatives, and decision
   - **Phase 3** | **Priority: HIGHEST** | Blocks all other work

2. **02-simplify-use-case-schema.md** (5.9K)
   - New lean YAML format with Zod validation (~30 lines)
   - **Phase 3** | **Priority: HIGH**

3. **03-implement-query-interface.md** (9.1K)
   - `udd query` commands (actors, journeys, use-cases, gaps)
   - **Phase 3** | **Priority: HIGH**

4. **04-update-actor-model.md** (6.6K)
   - External actors only, remove internal components
   - **Phase 3** | **Priority: HIGH**

5. **05-enhance-manifest.md** (8.4K)
   - Add completeness metrics and full traceability
   - **Phase 3** | **Priority: MEDIUM**

6. **12-enhance-lint-command.md** (7.6K)
   - Add completeness checks to `udd lint`
   - **Phase 3** | **Priority: MEDIUM**

7. **09-create-core-documentation.md** (15K)
   - Requirements model, use case spec, discovery guide docs
   - **Phase 3** | **Priority: MEDIUM**

8. **11-update-existing-docs.md** (9.0K)
   - Update README, AGENTS.md, CONTRIBUTING.md
   - **Phase 3** | **Priority: LOW**

9. **06-implement-analyze-commands.md** (9.7K)
   - `udd analyze` for coverage and completeness
   - **Phase 4** | **Deferred** | Scenarios tagged `@phase:4`

10. **07-implement-suggest-commands.md** (12K)
    - `udd suggest` for AI-assisted discovery
    - **Phase 4** | **Deferred**

11. **08-add-jtbd-template.md** (12K)
    - JTBD framework and discovery workflow
    - **Phase 4** | **Deferred**

12. **10-create-agent-guide.md** (13K)
    - Complete guide for AI agents using UDD
    - **Phase 4** | **Deferred**

### Supporting Files

- **README.md** (7.0K) - Complete guide to using the issues
- **create-issues.sh** (3.7K) - Automated issue creation script

## Issue Quality

Each issue includes:

✅ **Clear description** of the problem and solution  
✅ **Detailed changes** required with file paths  
✅ **Code examples** showing exact implementation  
✅ **Acceptance criteria** for completion  
✅ **Testing approach** with example scenarios  
✅ **Dependencies** clearly stated  
✅ **Benefits** for humans, agents, and UDD  
✅ **References** to relevant documentation  
✅ **Labels** for organization (phase, type, priority)

## How to Create Issues

### Option 1: GitHub CLI (Automated)

```bash
cd /tmp/udd-issues
chmod +x create-issues.sh
./create-issues.sh
```

This will:
1. Create all Phase 3 issues
2. Ask if you want to create Phase 4 issues
3. Apply appropriate labels automatically

### Option 2: GitHub Web UI (Manual)

For each issue file:
1. Go to https://github.com/rothnic/udd/issues/new
2. Copy the title (first line without `#`)
3. Copy the entire content as the body
4. Add labels from the **Labels:** line
5. Click "Submit new issue"

### Option 3: GitHub CLI (Individual)

```bash
gh issue create \
  --repo rothnic/udd \
  --title "Research: Lean Requirements Model with JTBD" \
  --body-file /tmp/udd-issues/01-research-lean-requirements-model.md \
  --label "research,phase-3,architecture,enhancement"
```

## Recommended Implementation Order

### Phase 3 (Current Phase)

1. **Research First** (#01) - Foundation for all other work
2. **Core Changes** (#02, #04) - Schema and actor model
3. **Agent Tooling** (#03, #05, #12) - Query, manifest, lint
4. **Documentation** (#09, #11) - Can be incremental

### Phase 4 (Deferred)

5. **Intelligence** (#06, #07, #08, #10) - Analyze, suggest, JTBD, agent guide

## Key Features by Phase

### Phase 3: Foundation & Tooling
- ✅ Simplified use case schema (black box, ~30 lines)
- ✅ External actors only (no internal components)
- ✅ Query interface for agent consumption
- ✅ Enhanced manifest with metrics
- ✅ Lint with completeness checks
- ✅ Comprehensive documentation

### Phase 4: Agent Intelligence
- 🔮 Analyze commands (coverage, completeness)
- 🔮 Suggest commands (AI-assisted discovery)
- 🔮 JTBD template and workflow
- 🔮 Complete agent guide

## Success Criteria

### Phase 3 Complete When:
- [ ] All 8 Phase 3 issues resolved
- [ ] Use cases are ≤50 lines (black box)
- [ ] Agents can query requirements via JSON
- [ ] Completeness calculated automatically
- [ ] Gap analysis automated
- [ ] Documentation complete
- [ ] All tests pass

### Phase 4 Complete When:
- [ ] All 4 Phase 4 issues resolved
- [ ] Analyze commands working
- [ ] Suggest commands providing good recommendations
- [ ] JTBD analysis available
- [ ] Agent guide complete

## Benefits Summary

### For Humans
- 📊 Clear completeness metrics
- 🎯 Gap analysis shows what's missing
- 📖 Richer user context via JTBD
- 🎨 Less specification overhead

### For Agents
- 🔍 Queryable requirements (JSON API)
- 🤖 Suggestion engine guides discovery
- ✅ Automated completeness checking
- 🚀 Focus on WHAT to build, figure out HOW during implementation

### For UDD
- 🏆 Theoretically sound (requirements vs. architecture separation)
- ⚡ Efficient (no over-specification)
- 🧠 Deep user understanding (JTBD)
- 🤝 Agent-friendly (structured, queryable)

## File Locations

All issue files are in `/tmp/udd-issues/`:

```
/tmp/udd-issues/
├── README.md                                    # Guide to using issues
├── create-issues.sh                             # Automation script
├── 01-research-lean-requirements-model.md       # Research (Phase 3)
├── 02-simplify-use-case-schema.md              # Schema (Phase 3)
├── 03-implement-query-interface.md              # Query (Phase 3)
├── 04-update-actor-model.md                     # Actors (Phase 3)
├── 05-enhance-manifest.md                       # Manifest (Phase 3)
├── 06-implement-analyze-commands.md             # Analyze (Phase 4)
├── 07-implement-suggest-commands.md             # Suggest (Phase 4)
├── 08-add-jtbd-template.md                      # JTBD (Phase 4)
├── 09-create-core-documentation.md              # Core docs (Phase 3)
├── 10-create-agent-guide.md                     # Agent guide (Phase 4)
├── 11-update-existing-docs.md                   # Update docs (Phase 3)
└── 12-enhance-lint-command.md                   # Lint (Phase 3)
```

## Next Steps

1. **Review the issues** in `/tmp/udd-issues/`
2. **Choose creation method** (automated script or manual)
3. **Create issues** in GitHub
4. **Start with Research** (#01) - it's the foundation
5. **Follow recommended order** for implementation
6. **Use UDD methodology** - create specs first!

## Notes

- Issues follow UDD methodology (spec-first)
- Each issue is detailed enough to implement independently
- Dependencies clearly marked
- Phase 4 work properly tagged with `@phase:4`
- All tests have acceptance criteria
- Code examples show exact implementation patterns

## References

- [Jobs to Be Done Framework](https://www.userinterviews.com/ux-research-field-guide-chapter/jobs-to-be-done-jtbd-framework)
- [SysML Requirements vs. Architecture](https://www.omgsysml.org/)
- [Behavior-Driven Development](https://cucumber.io/docs/bdd/)
- [Analysis of Alternatives (AoA)](https://www.sebokwiki.org/wiki/Analysis_of_Alternatives)

---

**Created by:** Copilot Agent  
**Based on:** Comprehensive analysis in problem statement  
**Purpose:** Enable implementation of lean requirements model in UDD
