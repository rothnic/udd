# Implement validateCreateTaskRequest function logic (@Sisyphus-Junior subagent)

**ID**: ses_36ee001d2ffe9rrHiU8V0xpsj0
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 1:28:38 PM
**Stats**: 1 files changed, +82 -2

---

## USER (1:28:39 PM)

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
	const details: Record<string, string> = {};

	const parseResult = CreateTaskRequestSchema.safeParse(request);
	if (!parseResult.success) {
		// If the shape is wrong, populate generic errors for missing top-level fields
		const err = parseResult.error;
		for (const issue of err.issues) {
			const path = issue.path.join(".") || "request";
			// Map zod issue to simple codes expected by callers
			switch (issue.code) {
				case z.ZodIssueCode.invalid_type:
				case z.ZodIssueCode.invalid_union:
				case z.ZodIssueCode.unrecognized_keys:
				case z.ZodIssueCode.invalid_key:
				case z.ZodIssueCode.invalid_element:
				case z.ZodIssueCode.invalid_value:
				case z.ZodIssueCode.invalid_format:
					details[path] = "invalid";
					break;
				case z.ZodIssueCode.too_small:
					details[path] = "required";
					break;
				case z.ZodIssueCode.too_big:
					details[path] = "max_length";
					break;
				default:
					details[path] = issue.message || "invalid";
			}
		}
	}

	// Now apply semantic rules from specs
	const maybe = (request ?? {}) as Record<string, unknown>;

	// title: required, trimmed, length 1-200
	const rawTitle = typeof maybe.title === "string" ? maybe.title : undefined;
	if (rawTitle === undefined) {
		details.title = details.title || "required";
	} else {
		const trimmed = rawTitle.trim();
		if (trimmed.length === 0) {
			details.title = "required";
		} else if (trimmed.length > 200) {
			details.title = "max_length";
		}
	}

	// notes: optional, max 4000
	if (maybe.notes !== undefined) {
		if (typeof maybe.notes !== "string") {
			details.notes = "invalid";
		} else if (maybe.notes.length > 4000) {
			details.notes = "max_length";
		}
	}

	// source: required, must be in enum
	if (maybe.source === undefined) {
		details.source = details.source || "required";
	} else if (
		typeof maybe.source !== "string" ||
		!TaskSourceSchema.safeParse(maybe.source).success
	) {
		details.source = "invalid";
	}

	// client_id: optional, alnum and hyphen only, max 64
	if (maybe.client_id !== undefined) {
		if (typeof maybe.client_id !== "string") {
			details.client_id = "invalid";
		} else if (maybe.client_id.length > 64) {
			details.client_id = "max_length";
		} else if (!/^[A-Za-z0-9-]+$/.test(maybe.client_id)) {
			details.client_id = "invalid_format";
		}
	}

	if (Object.keys(details).length > 0) {
		return { error: "validation_error", details };
	}

	return null;
}


