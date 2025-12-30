# Example: Todo App with UDD

This walkthrough demonstrates UDD on a simple todo app.

## 1. Initialize

```bash
mkdir todo-app && cd todo-app
npm init -y
npx udd init
```

Answer prompts:
- **Building:** A todo app for personal productivity
- **Actors:** User
- **First action:** Creates their first todo
- **Constraints:** Works offline, syncs when online

Creates:
```
product/
├── README.md
├── actors.md
├── constraints.md
├── changelog.md
└── journeys/new_user_onboarding.md
```

## 2. Define a Journey

Edit `product/journeys/new_user_onboarding.md`:

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Create their first todo and mark it complete

## Steps

1. User opens the app → `specs/todos/view_empty_state.feature`
2. User adds a todo → `specs/todos/add_todo.feature`
3. User completes the todo → `specs/todos/complete_todo.feature`

## Success

User has added and completed their first todo within 2 minutes.
```

## 3. Sync Journey to Scenarios

```bash
udd sync
```

Output:
```
🔄 Syncing journeys to scenarios...

📝 Journey: New User Onboarding (new)
  → specs/todos/view_empty_state.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/view_empty_state.feature
    ✓ Created tests/todos/view_empty_state.e2e.test.ts
  → specs/todos/add_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/add_todo.feature
    ✓ Created tests/todos/add_todo.e2e.test.ts
  → specs/todos/complete_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/complete_todo.feature
    ✓ Created tests/todos/complete_todo.e2e.test.ts

📊 Sync Summary:
   Journeys processed: 1
   Changes detected: 1
   Scenarios created: 3
```

## 4. Review Generated Scenarios

`specs/todos/add_todo.feature`:
```gherkin
Feature: New User Onboarding

  Scenario: User adds a todo
    Given I am a User
    When I user adds a todo
    Then the action is completed successfully
```

Edit to be more specific:
```gherkin
Feature: Todo Management

  Scenario: User adds a todo
    Given I have no todos
    When I add a todo with title "Buy groceries"
    Then I should see "Buy groceries" in my todo list
```

## 5. Run Tests (Fail First)

```bash
npm test
```

Tests fail because there's no implementation.

## 6. Implement

Create `src/todos.ts`:
```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

export function addTodo(title: string): Todo {
  const todo = { id: Date.now().toString(), title, completed: false };
  todos.push(todo);
  return todo;
}

export function getTodos(): Todo[] {
  return todos;
}

export function completeTodo(id: string): void {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.completed = true;
}
```

## 7. Update Test

`tests/todos/add_todo.e2e.test.ts`:
```typescript
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { addTodo, getTodos } from "../../src/todos";

const feature = await loadFeature("specs/todos/add_todo.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User adds a todo", ({ Given, When, Then }) => {
    Given("I have no todos", () => {
      // Reset state for test
    });

    When(/I add a todo with title "(.+)"/, (title: string) => {
      addTodo(title);
    });

    Then(/I should see "(.+)" in my todo list/, (title: string) => {
      const todos = getTodos();
      expect(todos.some(t => t.title === title)).toBe(true);
    });
  });
});
```

## 8. Run Tests (Pass)

```bash
npm test
# ✓ All tests pass
```

## 9. Check Status

```bash
udd status
```

Output:
```
Project Status
==============

User Journeys:
  New User Onboarding: 3/3
```

## 10. Iterate

Add more journeys for new features:
- `product/journeys/manage_multiple_todos.md`
- `product/journeys/filter_todos.md`

Then `udd sync` and repeat.

## Summary

The UDD workflow:
1. **Intent** → User journeys describe what users accomplish
2. **Behavior** → BDD scenarios define testable behaviors
3. **Verification** → E2E tests verify the system works
4. **Implementation** → Code makes tests pass

This keeps development user-focused and spec-driven.
