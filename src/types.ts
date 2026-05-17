import { z } from "zod";

export const VisionFrontmatterSchema = z.object({
	id: z.string(),
	name: z.string(),
	version: z.string().optional(),
	current_phase: z.number().optional(),
	phases: z.record(z.string(), z.string()).optional(),
	goals: z.array(z.string()),
	success_metrics: z.array(z.string()).optional(),
	use_cases: z.array(z.string()),
});

export const UseCaseSpecSchema = z.object({
	id: z.string(),
	name: z.string(),
	summary: z.string(),
	actors: z.array(z.string()).optional(),
	outcomes: z
		.array(
			z.object({
				description: z.string(),
				scenarios: z.array(z.string()).optional(),
			}),
		)
		.optional(),
	phase: z.number().optional(),
});

export const FeatureSpecSchema = z.object({
	id: z.string(),
	area: z.string(),
	name: z.string(),
	summary: z.string(),
	use_cases: z.array(z.string()).optional(),
	phase: z.number().optional(),
	kind: z.enum(["core", "extension", "experimental"]).optional(),
	// Research linkage
	requires_research: z.boolean().optional(), // If true, blocks scenarios until research decided
	research: z.string().optional(), // ID of related research in specs/research/<id>/
	// Tech spec linkage
	tech_spec: z.boolean().optional(), // If true, has _tech-spec.md in feature folder
});

export const ResearchStatus = z.enum(["active", "decided", "abandoned"]);

export const ResearchMetadataSchema = z.object({
	id: z.string(),
	title: z.string(),
	status: ResearchStatus,
	created: z.string(),
	timebox: z.string().optional(),
	decision: z.string().optional(),
	related_features: z.array(z.string()).optional(),
});

export const RequirementTypeSchema = z.enum(["functional", "non_functional"]);

export const TechnicalRequirementSchema = z.object({
	id: z.string(),
	key: z.string().optional(),
	type: RequirementTypeSchema,
	feature: z.string(),
	use_cases: z.array(z.string()).optional(),
	scenarios: z.array(z.string()),
	components: z.array(z.string()).optional(),
	tests: z.array(z.string()).optional(),
	description: z.string(),
	acceptance_criteria: z.array(z.string()).optional(),
	notes: z.array(z.string()).optional(),
});

export const SpecChangeSchema = z.object({
	id: z.string(),
	date: z.string(),
	feature: z.string(),
	reason: z.string(),
	scenarios: z
		.object({
			added: z.array(z.string()).optional(),
			updated: z.array(z.string()).optional(),
			removed: z.array(z.string()).optional(),
		})
		.optional(),
	requirements: z
		.object({
			added: z.array(z.string()).optional(),
			updated: z.array(z.string()).optional(),
			removed: z.array(z.string()).optional(),
		})
		.optional(),
});

export type VisionFrontmatter = z.infer<typeof VisionFrontmatterSchema>;
export type UseCaseSpec = z.infer<typeof UseCaseSpecSchema>;
export type FeatureSpec = z.infer<typeof FeatureSpecSchema>;
export type TechnicalRequirement = z.infer<typeof TechnicalRequirementSchema>;
export type SpecChange = z.infer<typeof SpecChangeSchema>;
export type ResearchMetadata = z.infer<typeof ResearchMetadataSchema>;

// -------------------------
// Test governance types
// -------------------------

// Test Review State
export const TestStatusSchema = z.enum(["dirty", "clean"]);

// Individual checklist item
export const TestReviewChecklistItemSchema = z.object({
	id: z.string(),
	question: z.string(),
	required: z.boolean(),
	automated: z.boolean().optional(),
	validationPattern: z.string().optional(), // Regex for automated checks
});

// Complete checklist definition
export const TestReviewChecklistSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	items: z.array(TestReviewChecklistItemSchema),
});

// Single review record for a test
export const TestReviewRecordSchema = z.object({
	testPath: z.string(),
	status: TestStatusSchema,
	lastReviewed: z.string().datetime().nullable(),
	reviewCount: z.number().default(0),
	reviewedBy: z.string().nullable(), // Git user or name
	checklistUsed: z.string(),
	answers: z.record(z.string(), z.boolean()), // itemId -> passed
	notes: z.array(z.string()).default([]),
	dependencies: z.array(z.string()).default([]), // Files test depends on
	expiresAt: z.string().datetime().nullable(),
	dirtyReason: z.string().nullable(), // Why marked dirty
});

// Governance configuration
export const TestGovernanceConfigSchema = z.object({
	checklists: z.record(z.string(), TestReviewChecklistSchema),
	settings: z.object({
		reviewExpirationDays: z.number().default(90),
		autoMarkDirtyOnDependencyChange: z.boolean().default(true),
		requireReviewOnPhaseEntry: z.boolean().default(true),
		failOnDirtyTests: z.boolean().default(false),
		defaultChecklist: z.string().default("default"),
		autoDetectDependencies: z.boolean().default(true),
	}),
});

// Extended manifest test entry
export const ManifestTestEntrySchema = z.object({
	path: z.string(),
	feature: z.string().optional(), // Associated feature file
	status: TestStatusSchema,
	phase: z.number().optional(),
	lastReviewed: z.string().datetime().nullable(),
	reviewCount: z.number().default(0),
	dirtyReason: z.string().nullable(),
});

// Type exports
export type TestStatus = z.infer<typeof TestStatusSchema>;
export type TestReviewChecklistItem = z.infer<
	typeof TestReviewChecklistItemSchema
>;
export type TestReviewChecklist = z.infer<typeof TestReviewChecklistSchema>;
export type TestReviewRecord = z.infer<typeof TestReviewRecordSchema>;
export type TestGovernanceConfig = z.infer<typeof TestGovernanceConfigSchema>;
export type ManifestTestEntry = z.infer<typeof ManifestTestEntrySchema>;

// -------------------------
// Manifest / Drift tracking
// -------------------------

export const ManifestJourneySchema = z.object({
	path: z.string(),
	hash: z.string().optional(),
	scenarios: z.array(z.string()).optional(),
});

export const ManifestScenarioSchema = z.object({
	hash: z.string().optional(),
	test: z.string().optional(),
	status: z.string().optional(),
});

export const DriftIssueSchema = z.object({
	id: z.string(),
	severity: z.enum(["critical", "warning", "info"]),
	type: z.enum([
		"journey_stale",
		"scenario_orphan",
		"test_missing",
		"manifest_corrupt",
		"test_failing",
		"manifest_missing",
		"journey_missing",
		"validation_error",
		"low_coverage",
	]),
	file: z.string(),
	message: z.string().optional(),
	auto_fixable: z.boolean().optional(),
	requires_user_input: z.boolean().optional(),
});

export const DriftStateSchema = z.object({
	status: z.enum([
		"clean",
		"drift-detected",
		"remediation-in-progress",
		"verified",
	]),
	last_check: z.string().optional(),
	issues: z.array(DriftIssueSchema).optional(),
	summary: z
		.object({
			critical: z.number().optional(),
			warning: z.number().optional(),
			info: z.number().optional(),
			total: z.number().optional(),
		})
		.optional(),
});

export const RemediationLogEntrySchema = z.object({
	timestamp: z.string(),
	action: z.string(),
	issue_id: z.string().optional(),
	agent: z.string().optional(),
	result: z.enum(["success", "checkpoint", "failed"]),
});

export const ManifestSchema = z.object({
	journeys: z.record(z.string(), ManifestJourneySchema).optional(),
	scenarios: z.record(z.string(), ManifestScenarioSchema).optional(),
	// Optional drift tracking and remediation history
	drift_state: DriftStateSchema.optional(),
	remediation_log: z.array(RemediationLogEntrySchema).optional(),
});

export type DriftIssue = z.infer<typeof DriftIssueSchema>;
export type DriftState = z.infer<typeof DriftStateSchema>;
export type RemediationLogEntry = z.infer<typeof RemediationLogEntrySchema>;
export type Manifest = z.infer<typeof ManifestSchema>;
