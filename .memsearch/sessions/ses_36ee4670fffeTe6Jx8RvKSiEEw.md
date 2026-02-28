# Implement createTask logic in service module (@Sisyphus-Junior subagent)

**ID**: ses_36ee4670fffeTe6Jx8RvKSiEEw
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 1:23:50 PM
**Stats**: 1 files changed, +36 -2

---

## USER (1:23:51 PM)

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
	const trimmedTitle = request.title.trim();

	if (trimmedTitle.length === 0) {
		return {
			ok: false,
			error: {
				code: "validation_error",
				message: "Title is required",
				details: { title: "required" },
			},
		};
	}

	if (trimmedTitle.length > 200) {
		return {
			ok: false,
			error: {
				code: "validation_error",
				message: "Title must not exceed 200 characters",
				details: { title: "max_length" },
			},
		};
	}

	const task: CreateTaskResponse = {
		id: crypto.randomUUID(),
		title: trimmedTitle,
		inbox: true,
		created_at: new Date().toISOString(),
	};

	if (request.notes !== undefined) {
		task.notes = request.notes;
	}

	return { ok: true, task };
}

export function validateCreateTaskRequest(
	request: unknown,
): TaskValidationError | null {
	void request;
	throw new Error("validateCreateTaskRequest: not yet implemented");
}


