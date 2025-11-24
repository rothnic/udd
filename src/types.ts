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
});

export const RequirementTypeSchema = z.enum(["functional", "non_functional"]);

export const TechnicalRequirementSchema = z.object({
	key: z.string(),
	type: RequirementTypeSchema,
	feature: z.string(),
	use_cases: z.array(z.string()).optional(),
	scenarios: z.array(z.string()),
	description: z.string(),
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
