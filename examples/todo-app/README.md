# Todo App Example

Complete example of UDD managing a todo application.

## Overview

This example demonstrates a full UDD workflow for a simple todo app:
- User journeys for todo management
- Feature scenarios for CRUD operations
- E2E tests validating behavior
- Full traceability from journeys to tests

## Structure

```
examples/todo-app/
├── product/
│   ├── actors.md          # Who uses the app
│   ├── constraints.md     # NFRs
│   └── journeys/
│       └── todo-app.manifest.yml  # Journey definitions
├── specs/                 # Feature scenarios (to be created)
└── tests/                 # E2E tests (to be created)
```

## Quick Start

```
# Navigate to example
cd examples/todo-app

# Check current status
udd status

# Validate specs
udd validate

# Run tests
npm test
```

## Using This Example

### Copy to Your Project

```
# From repository root
udd examples copy todo-app my-todo-app

cd my-todo-app

# Initialize
npm init -y
npm install  # Install dependencies

# Start using UDD
udd status
```

### Learn From It

Explore the files to understand:
- How actors are defined in `product/actors.md`
- How constraints are documented in `product/constraints.md`
- How journeys link to scenarios in the manifest

## Next Steps

After copying this example:

1. **Customize actors** - Update `product/actors.md` for your domain
2. **Define journeys** - Create user journeys in `product/journeys/`
3. **Sync to scenarios** - Run `udd sync` to generate specs
4. **Implement** - Write code to make tests pass
5. **Iterate** - Update journeys as requirements evolve

## See Also

- [Main UDD Documentation](../../README.md)
- [Architecture Guide](../../ARCHITECTURE.md)
- [Contributing Guide](../../CONTRIBUTING.md)
