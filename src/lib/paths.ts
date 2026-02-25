import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

export interface UddConfig {
	project: {
		name: string;
		type: "product" | "example";
	};
	paths: {
		product: string;
		specs: string;
		tests: string;
	};
	examples: Record<
		string,
		{
			path: string;
			description: string;
		}
	>;
	traceability: {
		product: {
			strict: boolean;
			require_journey_links: boolean;
			require_test_coverage: boolean;
		};
		examples: {
			strict: boolean;
			require_journey_links: boolean;
			require_test_coverage: boolean;
		};
	};
}

export interface ResolvedPaths {
	product: string;
	specs: string;
	tests: string;
	root: string;
}

/**
 * Load UDD configuration from .udd/config.yml
 */
export function loadConfig(): UddConfig {
	const configPath = path.join(process.cwd(), ".udd", "config.yml");

	if (!fs.existsSync(configPath)) {
		// Return default config if not found
		return {
			project: { name: "udd", type: "product" },
			paths: { product: "product", specs: "specs", tests: "tests" },
			examples: {},
			traceability: {
				product: {
					strict: true,
					require_journey_links: true,
					require_test_coverage: true,
				},
				examples: {
					strict: false,
					require_journey_links: false,
					require_test_coverage: false,
				},
			},
		};
	}

	const content = fs.readFileSync(configPath, "utf-8");
	return yaml.parse(content) as UddConfig;
}

/**
 * Resolve paths based on context (product or example)
 */
export function resolvePaths(context?: string): ResolvedPaths {
	const config = loadConfig();
	const cwd = process.cwd();

	if (!context || context === "product") {
		return {
			root: cwd,
			product: path.join(cwd, config.paths.product),
			specs: path.join(cwd, config.paths.specs),
			tests: path.join(cwd, config.paths.tests),
		};
	}

	// Example context
	const example = config.examples[context];
	if (!example) {
		throw new Error(`Example '${context}' not found in config`);
	}

	const exampleRoot = path.join(cwd, example.path);
	return {
		root: exampleRoot,
		product: path.join(exampleRoot, "product"),
		specs: path.join(exampleRoot, "specs"),
		tests: path.join(exampleRoot, "tests"),
	};
}

/**
 * Get example configuration by name
 */
export function getExampleConfig(name: string) {
	const config = loadConfig();
	return config.examples[name];
}

/**
 * List all available examples
 */
export function listExamples(): Array<{
	name: string;
	description: string;
	path: string;
}> {
	const config = loadConfig();
	return Object.entries(config.examples).map(([name, example]) => ({
		name,
		description: example.description,
		path: example.path,
	}));
}

/**
 * Check if strict mode is required for the given context
 */
export function isStrictMode(context?: string): boolean {
	const config = loadConfig();
	if (!context || context === "product") {
		return config.traceability.product.strict;
	}
	return config.traceability.examples.strict;
}
