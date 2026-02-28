# Create path resolution module for multi-project (@Sisyphus-Junior subagent)

**ID**: ses_369c71b11ffeKMsSvrV5D7WT4I
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 1:13:56 PM
**Stats**: 2 files changed, +210 -0

---

## USER (1:13:57 PM)

import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { getExampleConfig, listExamples } from "../lib/paths.js";

export const examplesCommand = new Command("examples")
	.description("List and copy example projects")
	.addCommand(
		new Command("list").description("List available examples").action(() => {
			const examples = listExamples();

			if (examples.length === 0) {
				console.log(chalk.yellow("No examples configured"));
				return;
			}

			console.log(chalk.bold("\nAvailable Examples:\n"));
			for (const example of examples) {
				console.log(`  ${chalk.cyan(example.name)}`);
				console.log(`    ${example.description}`);
				console.log(`    Path: ${example.path}\n`);
			}
		}),
	)
	.addCommand(
		new Command("copy")
			.description("Copy an example to a destination")
			.argument("<name>", "Name of the example to copy")
			.argument("<destination>", "Destination directory")
			.action((name: string, destination: string) => {
				const example = getExampleConfig(name);

				if (!example) {
					console.error(chalk.red(`Error: Example '${name}' not found`));
					console.log(
						chalk.dim("\nRun 'udd examples list' to see available examples"),
					);
					process.exit(1);
				}

				const sourcePath = path.join(process.cwd(), example.path);
				const destPath = path.resolve(destination);

				// Check if source exists
				if (!fs.existsSync(sourcePath)) {
					console.error(
						chalk.red(`Error: Example source not found at ${sourcePath}`),
					);
					process.exit(1);
				}

				// Check if destination already exists
				if (fs.existsSync(destPath)) {
					console.error(
						chalk.red(`Error: Destination already exists: ${destPath}`),
					);
					process.exit(1);
				}

				try {
					fs.cpSync(sourcePath, destPath, { recursive: true });
					console.log(chalk.green(`✓ Copied ${name} to ${destPath}`));
					console.log(chalk.dim(`\nNext steps:`));
					console.log(chalk.dim(`  cd ${destination}`));
					console.log(chalk.dim(`  udd status`));
				} catch (error) {
					console.error(chalk.red(`Error copying example: ${error}`));
					process.exit(1);
				}
			}),
	);


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


