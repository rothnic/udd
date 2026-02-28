# Create Task Service source file scaffold (@Sisyphus-Junior subagent)

**ID**: ses_36ef56dd4ffeC0bW8Qb7fT2k5f
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 1:05:15 PM
**Stats**: 1 files changed, +67 -0

---

## USER (1:05:15 PM)

/**
 * @file task_service.ts
 * @description Quick-capture task creation for inbox (POST /api/v1/tasks).
 * Aligned to specs/components/task_service.md (Layer 4).
 */

import { z } from "zod";

export const TaskSourceSchema = z.enum([
	"mobile_widget",
	"voice_input",
	"desktop_shortcut",
]);
export type TaskSource = z.infer<typeof TaskSourceSchema>;

export const CreateTaskRequestSchema = z.object({
	title: z.string(),
	notes: z.string().optional(),
	source: TaskSourceSchema,
	created_at: z.string().optional(),
	client_id: z.string().optional(),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export interface CreateTaskResponse {
	id: string;
	title: string;
	notes?: string;
	inbox: true;
	created_at: string;
}

export interface TaskValidationError {
	error: "validation_error";
	details: Record<string, string>;
}

export type TaskServiceErrorCode =
	| "validation_error"
	| "unauthorized"
	| "duplicate"
	| "rate_limited"
	| "internal";

export interface TaskServiceError {
	code: TaskServiceErrorCode;
	message: string;
	details?: Record<string, string>;
}

export type CreateTaskResult =
	| { ok: true; task: CreateTaskResponse }
	| { ok: false; error: TaskServiceError };

export async function createTask(
	request: CreateTaskRequest,
): Promise<CreateTaskResult> {
	void request;
	throw new Error("createTask: not yet implemented");
}

export function validateCreateTaskRequest(
	request: unknown,
): TaskValidationError | null {
	void request;
	throw new Error("validateCreateTaskRequest: not yet implemented");
}


