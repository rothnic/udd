# Create task service unit test file (@Sisyphus-Junior subagent)

**ID**: ses_36ec296ecffeqcrpf6k7e238Yl
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:00:46 PM
**Stats**: 1 files changed, +76 -0

---

## USER (2:00:47 PM)

import { describe, expect, it } from "vitest";
import type { CreateTaskRequest } from "../../../src/services/task_service.js";
import {
	createTask,
	validateCreateTaskRequest,
} from "../../../src/services/task_service.js";

describe("task_service:createTask", () => {
	it("returns ok true and trims title, sets inbox and created_at, generates id", async () => {
		const req = {
			title: "  Buy milk  ",
			source: "mobile_widget",
		} as CreateTaskRequest;
		const res = await createTask(req);
		expect(res.ok).toBe(true);
		if (!res.ok) return;
		const task = res.task;
		expect(task.title).toBe("Buy milk");
		expect(task.inbox).toBe(true);
		expect(typeof task.id).toBe("string");
		expect(typeof task.created_at).toBe("string");
	});

	it("returns validation_error when title is empty after trim", async () => {
		const req = { title: "   ", source: "mobile_widget" } as CreateTaskRequest;
		const res = await createTask(req);
		expect(res.ok).toBe(false);
		if (res.ok) return;
		expect(res.error.code).toBe("validation_error");
		expect(res.error.details).toBeDefined();
		expect(res.error.details?.title).toBe("required");
	});

	it("returns validation_error when title too long", async () => {
		const long = "x".repeat(201);
		const req = { title: long, source: "mobile_widget" } as CreateTaskRequest;
		const res = await createTask(req);
		expect(res.ok).toBe(false);
		if (res.ok) return;
		expect(res.error.code).toBe("validation_error");
		expect(res.error.details).toBeDefined();
		expect(res.error.details?.title).toBe("max_length");
	});
});

describe("task_service:validateCreateTaskRequest", () => {
	it("returns null for valid payload", () => {
		const valid = { title: "Do work", source: "voice_input" };
		const err = validateCreateTaskRequest(valid);
		expect(err).toBeNull();
	});

	it("flags missing title, source", () => {
		const bad = { notes: "note" };
		const err = validateCreateTaskRequest(bad);
		expect(err).not.toBeNull();
		if (!err) return;
		expect(err.error).toBe("validation_error");
		expect(err.details.title).toBeDefined();
		expect(err.details.source).toBeDefined();
	});

	it("enforces client_id rules and notes max length", () => {
		const bad = {
			title: "t",
			source: "desktop_shortcut",
			client_id: "invalid id!",
			notes: "n".repeat(5000),
		};
		const err = validateCreateTaskRequest(bad);
		expect(err).not.toBeNull();
		if (!err) return;
		expect(err.details.client_id).toBeDefined();
		expect(err.details.notes).toBeDefined();
	});
});


