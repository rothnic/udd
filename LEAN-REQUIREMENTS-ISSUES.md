# UDD Enhancement Issues - Revised for Simplicity

**Date:** 2026-01-04  
**Status:** ✅ Updated - Simplified SysML-Informed Approach  
**Location:** `.github/issues/` (in repository)

## 🎯 Key Change: Keep It Simple

After the SysML principles merge, the original 12-issue plan was **revised down to 5 focused issues** that enhance UDD without adding complexity.

### The Right Approach ✅
- ✅ Use SysML thinking to create **better feature files**
- ✅ Let agents help with requirements discovery
- ✅ Keep feature files as single source of truth
- ✅ Document alternatives as comments in features
- ✅ Add practical tooling (query, discover)

### What NOT to Do ❌
- ❌ Don't add `functional_workflow` layers or separate use case schemas
- ❌ Don't create parallel SysML artifacts to maintain
- ❌ Don't add complexity without clear value
- ❌ Don't over-engineer with 12 separate issues when 5 will do

**See `docs/sysml-informed-discovery.md` for the complete philosophy.**

## Summary

**Revised approach:** **5 focused issues** (down from 12) that use SysML principles to enhance feature creation without adding artifact layers.

**All issue files are in the repository** at `.github/issues/` - ready to create!

## Revised Issues (5 focused, practical enhancements)

### Issue Files

1. **01-sysml-informed-feature-scenarios.md** (~9.4K)
   - Apply SysML thinking to create richer feature files
   - **Phase 3** | **Priority: HIGH** | Foundation for approach

2. **02-query-commands-for-agents.md** (~7.7K)
   - `udd query` commands (actors, journeys, features, status)
   - **Phase 3** | **Priority: HIGH** | Agent tooling

3. **03-enhance-discovery-workflow.md** (~10.2K)
   - Interactive `udd discover feature` command
   - **Phase 3** | **Priority: MEDIUM** | Guided discovery

4. **04-feature-template.md** (~8.1K)
   - Feature template with SysML context sections
   - **Phase 3** | **Priority: MEDIUM** | Consistency

5. **05-update-documentation.md** (~5.9K)
   - Update README, CONTRIBUTING.md, getting-started
   - **Phase 3** | **Priority: LOW** | Documentation

### Supporting Files
- **README.md** - Complete guide to revised issues
- **create-issues.sh** - Automated creation script

## Why 5 Issues Instead of 12?

The original plan proposed adding many separate layers and artifacts:
- ❌ Separate use case schemas (adds layer)
- ❌ Enhanced manifests (premature optimization)
- ❌ JTBD templates (too formal)
- ❌ Multiple analyze/suggest commands (complex)

**The SysML merge showed us the simpler path:**
- ✅ Use SysML thinking to enhance existing artifacts
- ✅ Don't add layers or parallel structures
- ✅ Focus on practical agent assistance
- ✅ Keep UDD simple and maintainable

## Implementation Path

```
1. SysML-Informed Features (#01) → Foundation
   ↓
2. Feature Template (#04) → Makes it easy
   ↓
3. Query (#02) + Discovery (#03) → Agent tools (parallel)
   ↓
4. Documentation (#05) → Polish
```

**Estimated effort:** 2-3 weeks (vs 8-10 weeks for original 12)

## How to Create Issues

**Note:** Issue files are in `.github/issues/` directory in the repository.

### Option 1: Run the Script (Recommended)

```bash
cd .github/issues
bash create-issues-simple.sh
```

### Option 2: GitHub CLI (Manual)

```bash
cd .github/issues

gh issue create --repo rothnic/udd \
  --title "Use SysML Principles to Enhance Feature Scenarios" \
  --body-file 01-sysml-informed-feature-scenarios.md \
  --label "enhancement,phase-3,documentation,methodology"

# Repeat for issues 02-05 (see .github/issues/README.md for all commands)
```

### Option 3: Web UI

1. Go to https://github.com/rothnic/udd/issues/new
2. Copy title and content from `.github/issues/<nn>-*.md`
3. Add appropriate labels from the `**Labels:**` line
4. Submit

**See `.github/issues/README.md` for detailed steps.**

## Key Benefits of Simplified Approach

### For Humans
- 📝 Richer feature documentation with context
- 🎯 Focused on user needs, not implementation
- ⚡ Less overhead to maintain (single source of truth)
- 🎨 No parallel artifacts to sync

### For Agents
- 🔍 Can query project structure via JSON API
- 🤖 Can help with discovery workflow
- ✅ Clear how to assist users
- 🚀 Practical tools they can actually use

### For UDD
- 🏆 Maintains core simplicity
- 💡 Improves requirements quality
- 🧠 Better thinking process (SysML principles)
- 🤝 Agent-friendly without complexity

## Files Location

```
/tmp/udd-issues-updated/
├── README.md                                    # Complete guide
├── create-issues.sh                             # Automation script
├── 01-sysml-informed-feature-scenarios.md       # HIGH
├── 02-query-commands-for-agents.md              # HIGH
├── 03-enhance-discovery-workflow.md             # MEDIUM
├── 04-feature-template.md                       # MEDIUM
└── 05-update-documentation.md                   # LOW
```

**Also in repository:**
- `/home/runner/work/udd/udd/LEAN-REQUIREMENTS-ISSUES.md` - This summary

## Success Criteria

- [ ] 5 issues created in GitHub
- [ ] Feature template exists
- [ ] Query commands provide JSON API
- [ ] Discovery workflow guides users
- [ ] Documentation updated
- [ ] All changes maintain UDD simplicity
- [ ] Agents can effectively assist with discovery

---

**Remember:** Use SysML principles to **think better**, not to **create more artifacts**.

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
