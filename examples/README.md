# UDD Examples

Learn UDD by exploring these example projects:

## Available Examples

### todo-app/

Complete todo application showing:
- User journeys for todo management
- Feature scenarios for CRUD operations
- E2E tests validating behavior
- Full traceability from journeys to tests

[Explore todo-app/](todo-app/)

### feature-examples/

Feature-level examples for reference:
- `export_data.feature` - Complete feature with SysML context
- `password_reset.feature` - Multi-scenario feature
- Rich comments documenting user needs and alternatives

[Explore feature-examples/](feature-examples/)

## Usage

### Copy an Example

Copy an example to your project to get started quickly:

```bash
udd examples copy todo-app my-todo-app
cd my-todo-app
```

### Explore Examples In-Place

Navigate to an example directory and use UDD commands:

```bash
cd examples/todo-app

# Check traceability
udd status

# Validate specs
udd validate
```

### List Available Examples

```bash
udd examples list
```

## Creating New Examples

To add a new example:

1. Create directory in `examples/<name>/`
2. Add product structure (`product/actors.md`, `product/constraints.md`, `product/journeys/`)
3. Create feature scenarios in `specs/`
4. Add E2E tests in `tests/`
5. Register in `.udd/config.yml`
6. Create `examples/<name>/README.md`
7. Update this file

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## Learn More

- [Main README](../README.md)
- [Architecture Guide](../ARCHITECTURE.md)
- [Getting Started Guide](../docs/getting-started.md)
