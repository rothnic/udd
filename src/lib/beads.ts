import * as crypto from "node:crypto";
import { z } from "zod";

/**
 * BeadStatus - Lifecycle states for a bead
 */
export const BeadStatusSchema = z.enum([
	"pending", // Waiting for dependencies
	"ready", // Dependencies satisfied, can start
	"in_progress", // Currently being worked on
	"completed", // Work done and verified
	"failed", // Work failed, needs attention
	"blocked", // Has unresolved blockers
	"skipped", // Intentionally skipped
]);

export type BeadStatus = z.infer<typeof BeadStatusSchema>;

/**
 * ExecutionMode - Whether this bead can run in parallel with siblings
 */
export const ExecutionModeSchema = z.enum(["parallel", "serial", "exclusive"]);

export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;

/**
 * VerificationType - How to verify bead completion
 */
export const VerificationTypeSchema = z.enum([
	"manual", // Human confirms completion
	"file_exists", // Check if file exists
	"command_exit_code", // Run command, check exit code
	"test_pass", // Run specific test
	"lint_clean", // No lint errors
	"type_check", // TypeScript compiles
	"custom", // Custom verification logic
]);

export type VerificationType = z.infer<typeof VerificationTypeSchema>;

/**
 * VerificationSpec - Specification for verifying bead completion
 */
export const VerificationSpecSchema = z.object({
	type: VerificationTypeSchema,
	command: z.string().optional(),
	args: z.array(z.string()).optional(),
	file: z.string().optional(),
	expectedExitCode: z.number().optional(),
	description: z.string(),
});

export type VerificationSpec = z.infer<typeof VerificationSpecSchema>;

/**
 * BeadType - Categories of work beads
 */
export const BeadTypeSchema = z.enum([
	"plan_sync_journey", // Run udd sync for stale journey
	"plan_create_test", // Create missing test file
	"plan_fix_manifest", // Fix corrupt/missing manifest
	"plan_validate_spec", // Fix validation error
	"plan_review_orphan", // Review orphan scenario
	"plan_fix_test", // Fix failing test
	"plan_user_decision", // Requires human input
	"plan_checkpoint", // Save progress, await user
]);

export type BeadType = z.infer<typeof BeadTypeSchema>;

/**
 * BeadMetadata - Context and metadata for a bead
 */
export const BeadMetadataSchema = z.object({
	created: z.string().datetime(),
	started: z.string().datetime().optional(),
	completed: z.string().datetime().optional(),
	assignedTo: z.string().optional(),
	estimatedMinutes: z.number().optional(),
	actualMinutes: z.number().optional(),
	attempts: z.number().optional(),
	priority: z.number().optional(),
	tags: z.array(z.string()).optional(),
});

export type BeadMetadata = z.infer<typeof BeadMetadataSchema>;

/**
 * Bead - Core work unit in the DAG
 *
 * A bead represents a unit of work that:
 * - Has dependencies (must complete after its dependencies)
 * - Can block other beads (must complete before blocked beads)
 * - Has verification criteria to confirm completion
 * - Tracks related files for context
 */
export const BeadSchema = z.object({
	// Identity
	id: z.string(),
	namespace: z.string(), // e.g., "plan/2026-03-02"
	type: BeadTypeSchema,
	name: z.string(),
	description: z.string(),

	// DAG Structure
	dependencies: z.array(z.string()).default([]), // Bead IDs that must complete first
	blocks: z.array(z.string()).default([]), // Bead IDs that depend on this
	children: z.array(z.string()).optional(), // For hierarchical beads (parent/child)
	parent: z.string().optional(),

	// Execution
	status: BeadStatusSchema.default("pending"),
	executionMode: ExecutionModeSchema.default("serial"),
	canAutoExecute: z.boolean().default(false), // Can be auto-executed by agent

	// Context
	files: z.array(z.string()).default([]), // Related files for context
	verification: VerificationSpecSchema,

	// Outcome
	result: z
		.object({
			success: z.boolean(),
			message: z.string(),
			outputs: z.record(z.string(), z.string()).optional(),
		})
		.optional(),

	// Metadata
	metadata: BeadMetadataSchema,

	// Error tracking
	error: z
		.object({
			message: z.string(),
			stack: z.string().optional(),
			at: z.string().datetime(),
		})
		.optional(),
});

export type Bead = z.infer<typeof BeadSchema>;

/**
 * BeadGraph - Container for a DAG of beads
 */
export const BeadGraphSchema = z.object({
	id: z.string(),
	namespace: z.string(),
	name: z.string(),
	description: z.string(),
	created: z.string().datetime(),
	updated: z.string().datetime(),
	status: z.enum(["active", "paused", "completed", "failed"]).default("active"),

	// The beads in this graph
	beads: z.record(z.string(), BeadSchema),

	// Entry points (beads with no dependencies)
	roots: z.array(z.string()),

	// Terminal points (beads that block nothing)
	leaves: z.array(z.string()),

	// Current ready beads (dependencies satisfied, waiting to start)
	ready: z.array(z.string()),

	// Currently in-progress beads
	inProgress: z.array(z.string()),

	// Statistics
	stats: z.object({
		total: z.number(),
		pending: z.number(),
		ready: z.number(),
		inProgress: z.number(),
		completed: z.number(),
		failed: z.number(),
		blocked: z.number(),
		skipped: z.number(),
	}),
});

export type BeadGraph = z.infer<typeof BeadGraphSchema>;

/**
 * Generate a unique bead ID
 */
export function generateBeadId(prefix = "bead"): string {
	const timestamp = Date.now().toString(36);
	const random = crypto.randomBytes(4).toString("hex");
	return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a namespace for plan beads
 */
export function generatePlanNamespace(): string {
	const date = new Date().toISOString().split("T")[0];
	const random = crypto.randomBytes(2).toString("hex");
	return `plan/${date}-${random}`;
}

/**
 * Create a bead graph from drift issues
 */
export function createBeadGraphFromDrift(
	driftIssues: Array<{
		id: string;
		type: string;
		severity: string;
		file: string;
		message: string;
		autoFixable: boolean;
		requiresUserInput: boolean;
	}>,
	options: {
		namespace?: string;
		name?: string;
	} = {},
): BeadGraph {
	const namespace = options.namespace || generatePlanNamespace();
	const now = new Date().toISOString();

	const beads: Record<string, Bead> = {};
	const dependencies: Map<string, string[]> = new Map();

	// First pass: Create beads from drift issues
	for (const issue of driftIssues) {
		const bead = driftIssueToBead(issue, namespace);
		beads[bead.id] = bead;
		dependencies.set(bead.id, []);
	}

	// Second pass: Analyze dependencies between beads
	for (const [id, bead] of Object.entries(beads)) {
		// Test failures depend on scenario fixes
		if (bead.type === "plan_fix_test") {
			const relatedScenario = Object.values(beads).find(
				(b) =>
					b.type === "plan_review_orphan" &&
					bead.files.some((f) =>
						f.includes(b.files[0]?.replace(".feature", "")),
					),
			);
			if (relatedScenario) {
				dependencies.get(id)?.push(relatedScenario.id);
				bead.dependencies.push(relatedScenario.id);
				relatedScenario.blocks.push(id);
			}
		}

		// Validation errors depend on manifest fixes
		if (bead.type === "plan_validate_spec") {
			const manifestBead = Object.values(beads).find(
				(b) =>
					b.type === "plan_fix_manifest" &&
					bead.files.some((f) => f.includes("specs/")),
			);
			if (manifestBead) {
				dependencies.get(id)?.push(manifestBead.id);
				bead.dependencies.push(manifestBead.id);
				manifestBead.blocks.push(id);
			}
		}
	}

	// Calculate roots (beads with no dependencies)
	const roots = Object.values(beads)
		.filter((b) => b.dependencies.length === 0)
		.map((b) => b.id);

	// Calculate leaves (beads that block nothing)
	const leaves = Object.values(beads)
		.filter((b) => b.blocks.length === 0)
		.map((b) => b.id);

	// Calculate ready beads
	const ready = Object.values(beads)
		.filter((b) => b.dependencies.length === 0 && b.status === "pending")
		.map((b) => b.id);

	// Update status for beads with dependencies
	for (const bead of Object.values(beads)) {
		if (bead.dependencies.length > 0) {
			bead.status = "pending";
		} else {
			bead.status = "ready";
		}
	}

	return {
		id: generateBeadId("graph"),
		namespace,
		name: options.name || `Recovery Plan: ${new Date().toLocaleDateString()}`,
		description: `Auto-generated plan from ${driftIssues.length} drift issues`,
		created: now,
		updated: now,
		status: "active",
		beads,
		roots,
		leaves,
		ready,
		inProgress: [],
		stats: calculateBeadStats(beads),
	};
}

/**
 * Convert a drift issue to a bead
 */
function driftIssueToBead(
	issue: {
		id: string;
		type: string;
		severity: string;
		file: string;
		message: string;
		autoFixable: boolean;
		requiresUserInput: boolean;
	},
	namespace: string,
): Bead {
	const now = new Date().toISOString();

	// Map drift issue type to bead type
	const typeMap: Record<string, BeadType> = {
		journey_stale: "plan_sync_journey",
		test_missing: "plan_create_test",
		manifest_corrupt: "plan_fix_manifest",
		manifest_missing: "plan_fix_manifest",
		validation_error: "plan_validate_spec",
		scenario_orphan: "plan_review_orphan",
		test_failing: "plan_fix_test",
		journey_missing: "plan_user_decision",
		low_coverage: "plan_user_decision",
	};

	const beadType = typeMap[issue.type] || "plan_user_decision";

	// Determine verification based on type
	const verification = getVerificationForBeadType(beadType, issue.file);

	// Determine execution mode
	const executionMode = getExecutionModeForBeadType(beadType);

	// Estimate effort
	const estimatedMinutes = estimateEffort(beadType);

	return {
		id: issue.id, // Use drift issue ID for traceability
		namespace,
		type: beadType,
		name: `${issue.type}: ${issue.file.split("/").pop()}`,
		description: issue.message,
		dependencies: [],
		blocks: [],
		status: "pending",
		executionMode,
		canAutoExecute: issue.autoFixable && !issue.requiresUserInput,
		files: [issue.file],
		verification,
		metadata: {
			created: now,
			estimatedMinutes,
			priority:
				issue.severity === "critical"
					? 10
					: issue.severity === "warning"
						? 5
						: 1,
			tags: [issue.severity, issue.type],
			attempts: 0,
		},
	};
}

/**
 * Get verification specification for a bead type
 */
function getVerificationForBeadType(
	type: BeadType,
	file: string,
): VerificationSpec {
	switch (type) {
		case "plan_create_test":
			return {
				type: "file_exists",
				file,
				description: `Test file exists at ${file}`,
			};

		case "plan_fix_manifest":
			return {
				type: "file_exists",
				file: "specs/.udd/manifest.yml",
				description: "Manifest file exists and is valid YAML",
			};

		case "plan_sync_journey":
			return {
				type: "command_exit_code",
				command: "udd",
				args: ["sync", "--dry-run"],
				description: "udd sync --dry-run shows no stale journeys",
			};

		case "plan_validate_spec":
			return {
				type: "command_exit_code",
				command: "udd",
				args: ["lint"],
				description: "udd lint passes with no validation errors",
			};

		case "plan_fix_test":
			return {
				type: "test_pass",
				file,
				description: `Test at ${file} passes`,
			};

		case "plan_review_orphan":
		case "plan_user_decision":
		default:
			return {
				type: "manual",
				description: "Human confirms completion via udd doctor --continue",
			};
	}
}

/**
 * Get execution mode for a bead type
 */
function getExecutionModeForBeadType(type: BeadType): ExecutionMode {
	switch (type) {
		case "plan_create_test":
			return "parallel"; // Can create multiple tests in parallel

		case "plan_sync_journey":
			return "serial"; // Sync one at a time to avoid conflicts

		case "plan_fix_manifest":
			return "exclusive"; // Must complete before anything else

		case "plan_fix_test":
			return "parallel";

		case "plan_validate_spec":
			return "serial";

		default:
			return "serial";
	}
}

/**
 * Estimate effort in minutes for a bead type
 */
function estimateEffort(type: BeadType): number {
	const estimates: Record<BeadType, number> = {
		plan_sync_journey: 5,
		plan_create_test: 2,
		plan_fix_manifest: 5,
		plan_validate_spec: 15,
		plan_review_orphan: 10,
		plan_fix_test: 30,
		plan_user_decision: 5,
		plan_checkpoint: 1,
	};
	return estimates[type] || 10;
}

/**
 * Calculate statistics for a bead graph
 */
function calculateBeadStats(beads: Record<string, Bead>): BeadGraph["stats"] {
	const values = Object.values(beads);
	return {
		total: values.length,
		pending: values.filter((b) => b.status === "pending").length,
		ready: values.filter((b) => b.status === "ready").length,
		inProgress: values.filter((b) => b.status === "in_progress").length,
		completed: values.filter((b) => b.status === "completed").length,
		failed: values.filter((b) => b.status === "failed").length,
		blocked: values.filter((b) => b.status === "blocked").length,
		skipped: values.filter((b) => b.status === "skipped").length,
	};
}

/**
 * Update bead graph statistics
 */
export function updateBeadGraphStats(graph: BeadGraph): void {
	graph.stats = calculateBeadStats(graph.beads);
	graph.updated = new Date().toISOString();
}

/**
 * Get beads that are ready to execute (dependencies satisfied)
 */
export function getReadyBeads(graph: BeadGraph): Bead[] {
	return Object.values(graph.beads).filter(
		(b) =>
			b.status === "ready" || (b.status === "pending" && isBeadReady(b, graph)),
	);
}

/**
 * Check if a bead's dependencies are all completed
 */
function isBeadReady(bead: Bead, graph: BeadGraph): boolean {
	if (bead.dependencies.length === 0) return true;
	return bead.dependencies.every((depId) => {
		const dep = graph.beads[depId];
		return dep?.status === "completed" || dep?.status === "skipped";
	});
}

/**
 * Mark a bead as complete and update downstream beads
 */
export function completeBead(
	graph: BeadGraph,
	beadId: string,
	result: Bead["result"],
): void {
	const bead = graph.beads[beadId];
	if (!bead) return;

	bead.status = "completed";
	bead.result = result;
	bead.metadata.completed = new Date().toISOString();

	// Update beads that depend on this one
	for (const blockedId of bead.blocks) {
		const blocked = graph.beads[blockedId];
		if (!blocked) continue;

		// Check if all dependencies are now satisfied
		if (isBeadReady(blocked, graph)) {
			blocked.status = "ready";
			if (!graph.ready.includes(blockedId)) {
				graph.ready.push(blockedId);
			}
		}
	}

	// Remove from in-progress if present
	graph.inProgress = graph.inProgress.filter((id) => id !== beadId);

	updateBeadGraphStats(graph);
}

/**
 * Mark a bead as failed
 */
export function failBead(graph: BeadGraph, beadId: string, error: Error): void {
	const bead = graph.beads[beadId];
	if (!bead) return;

	bead.status = "failed";
	bead.error = {
		message: error.message,
		stack: error.stack,
		at: new Date().toISOString(),
	};

	graph.inProgress = graph.inProgress.filter((id) => id !== beadId);
	updateBeadGraphStats(graph);
}

/**
 * Start working on a bead
 */
export function startBead(
	graph: BeadGraph,
	beadId: string,
	assignedTo?: string,
): void {
	const bead = graph.beads[beadId];
	if (!bead) return;

	bead.status = "in_progress";
	bead.metadata.started = new Date().toISOString();
	bead.metadata.attempts = (bead.metadata.attempts || 0) + 1;
	if (assignedTo) {
		bead.metadata.assignedTo = assignedTo;
	}

	if (!graph.inProgress.includes(beadId)) {
		graph.inProgress.push(beadId);
	}

	graph.ready = graph.ready.filter((id) => id !== beadId);
	updateBeadGraphStats(graph);
}

/**
 * Serialize bead graph to YAML-friendly object
 */
export function serializeBeadGraph(graph: BeadGraph): unknown {
	return {
		...graph,
		beads: Object.values(graph.beads),
	};
}

/**
 * Deserialize bead graph from YAML
 */
export function deserializeBeadGraph(data: unknown): BeadGraph {
	const parsed = data as any;
	const beads: Record<string, Bead> = {};

	for (const bead of parsed.beads) {
		beads[bead.id] = bead;
	}

	return {
		...parsed,
		beads,
	};
}
