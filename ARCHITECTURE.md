# UDD Architecture

## Overview

User Driven Development (UDD) uses a **three-tier architecture** that separates concerns between product requirements, learning materials, and reference documentation.

## Three-Tier Structure

### Tier 1: product/ - Dogfooding

UDD uses itself to manage its own development. The `product/` directory contains UDD's own requirements:

- **journeys/** - User journeys describing what UDD should do
- **actors.md** - Personas (Developer, AI Agent, Product Manager)
- **constraints.md** - Non-functional requirements

**Why this matters:** By using UDD to manage UDD, we ensure the tool works for real-world use cases. If a feature is hard to use for UDD's own development, it's too complex.

### Tier 2: examples/ - Learning

Standalone example projects that users can copy and learn from:

- **todo-app/** - Complete project with full UDD workflow
- **feature-examples/** - Individual feature examples

**Key characteristics:**
- Self-contained (have their own product/, specs/, tests/)
- Educational (demonstrate patterns and best practices)
- Copyable (`udd examples copy todo-app`)

### Tier 3: docs/ - Reference

Documentation that explains concepts and guides users:

- **architecture/** - Design documentation
- **process/** - Playbooks and workflows
- **getting-started.md** - Quick start guide

## Why Dogfooding?

**Benefits:**
1. **Real validation** - We use the tool daily, so bugs get caught quickly
2. **Feature prioritization** - If we need it, users probably do too
3. **Documentation** - Our own journeys serve as examples
4. **Continuous improvement** - Pain points drive enhancements

**How it works:**
```bash
# Check UDD's own status
udd status

# See UDD's journeys
ls product/journeys/

# Validate UDD's requirements
udd validate --strict
```

## Adding UDD Features

Since UDD uses itself, adding features requires:

1. **Define the journey** in `product/journeys/<feature>.md`
2. **Create scenarios** in `specs/udd/<domain>/<feature>.feature`
3. **Write tests** in `tests/e2e/udd/<domain>/<feature>.e2e.test.ts`
4. **Implement** the feature
5. **Validate** with `udd validate --strict`

## Adding Examples

To add a new example:

1. **Create directory** in `examples/<name>/`
2. **Add structure:**
   ```
   examples/<name>/
   ├── product/
   │   ├── journeys/
   │   ├── actors.md
   │   └── constraints.md
   ├── specs/
   └── tests/
   ```
3. **Register in** `.udd/config.yml`:
   ```yaml
   examples:
     <name>:
       path: "examples/<name>"
       description: "Description of example"
   ```
4. **Update** `examples/README.md`

## Multi-Project CLI

UDD supports managing multiple projects:

```bash
# Work with UDD itself (default)
udd status
udd sync

# Work with an example
udd status --example todo-app
udd sync --example todo-app

# Work with all projects
udd status --all
udd sync --all
```

The CLI uses `.udd/config.yml` to know which examples exist and how strict validation should be.

## Configuration

`.udd/config.yml` controls:

- **Project type** - Product vs Example (affects strictness)
- **Paths** - Where product/, specs/, tests/ live
- **Examples** - List of available examples
- **Traceability rules** - Strict vs relaxed validation

## Design Principles

1. **Separation of concerns** - Product, examples, docs are distinct
2. **Self-management** - UDD uses itself
3. **Composability** - Examples are standalone and copyable
4. **Progressive disclosure** - Simple examples, complex product
