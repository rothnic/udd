import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";

export const validateCommand = new Command("validate")
	.description("Check feature scenario completeness")
	.option(
		"-f, --feature <path>",
		"Validate specific feature file (default: all in specs/)",
	)
	.option("--strict", "Require all completeness checks to pass", false)
	.action(async (options) => {
		const rootDir = process.cwd();
		let featureFiles: string[] = [];

		if (options.feature) {
			featureFiles = [path.resolve(rootDir, options.feature)];
		} else {
			// Find all feature files
			const specsDir = path.join(rootDir, "specs");
			const pattern = path.join(specsDir, "**/*.feature");
			featureFiles = await glob(pattern);
		}

		if (featureFiles.length === 0) {
			console.log(chalk.yellow("No feature files found to validate."));
			process.exit(0);
		}

		console.log(
			chalk.blue.bold(
				`\n🔍 Validating Feature Completeness (${featureFiles.length} files)\n`,
			),
		);

		const results: Array<{
			file: string;
			issues: string[];
			warnings: string[];
			score: number;
		}> = [];

		for (const file of featureFiles) {
			const content = await fs.readFile(file, "utf-8");
			const relativePath = path.relative(rootDir, file);
			const analysis = analyzeFeatureCompleteness(content);

			results.push({
				file: relativePath,
				issues: analysis.issues,
				warnings: analysis.warnings,
				score: analysis.score,
			});
		}

		// Report results
		let hasIssues = false;
		let totalScore = 0;

		for (const result of results) {
			const scoreColor =
				result.score >= 80
					? chalk.green
					: result.score >= 60
						? chalk.yellow
						: chalk.red;

			console.log(
				`${scoreColor(`[${result.score}%]`)} ${chalk.white(result.file)}`,
			);

			if (result.issues.length > 0) {
				hasIssues = true;
				for (const issue of result.issues) {
					console.log(`  ${chalk.red("✗")} ${issue}`);
				}
			}

			if (result.warnings.length > 0) {
				for (const warning of result.warnings) {
					console.log(`  ${chalk.yellow("!")} ${warning}`);
				}
			}

			if (result.issues.length === 0 && result.warnings.length === 0) {
				console.log(`  ${chalk.green("✓")} Complete`);
			}

			console.log();
			totalScore += result.score;
		}

		// Summary
		const avgScore = Math.round(totalScore / results.length);
		const summaryColor =
			avgScore >= 80 ? chalk.green : avgScore >= 60 ? chalk.yellow : chalk.red;

		console.log(chalk.blue.bold("📊 Summary\n"));
		console.log(`Files analyzed: ${results.length}`);
		console.log(`Average completeness: ${summaryColor(`${avgScore}%`)}`);

		// Recommendations
		if (avgScore < 80) {
			console.log(chalk.yellow("\n💡 Recommendations:\n"));
			console.log(
				chalk.dim(
					"  • Add comments documenting user needs and alternatives considered",
				),
			);
			console.log(
				chalk.dim("  • Include error handling and edge case scenarios"),
			);
			console.log(
				chalk.dim("  • Use Background for common setup across scenarios"),
			);
			console.log(
				chalk.dim(
					"  • See docs/example-features/ for examples of complete features",
				),
			);
			console.log(
				chalk.dim("  • Use 'udd discover feature' for guided feature creation"),
			);
		}

		if (options.strict && hasIssues) {
			console.log(chalk.red("\n✗ Validation failed (strict mode)"));
			process.exit(1);
		}

		if (!hasIssues) {
			console.log(chalk.green("\n✓ All validations passed"));
		}
	});

interface FeatureAnalysis {
	issues: string[];
	warnings: string[];
	score: number;
}

function analyzeFeatureCompleteness(content: string): FeatureAnalysis {
	const issues: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	const lines = content.split("\n");

	// Check for Feature declaration
	if (!content.match(/^Feature:/m)) {
		issues.push("Missing Feature declaration");
		score -= 20;
	}

	// Check for at least one Scenario
	const scenarioCount = (content.match(/^\s*Scenario:/gm) || []).length;
	if (scenarioCount === 0) {
		issues.push("No scenarios defined");
		score -= 30;
	} else if (scenarioCount === 1) {
		warnings.push(
			"Only one scenario - consider adding error cases and edge cases",
		);
		score -= 10;
	}

	// Check for SysML-style context comments
	const hasUserNeed = content.includes("# User Need:");
	const hasAlternatives = content.includes("# Alternatives Considered:");
	const hasSuccessCriteria = content.includes("# Success Criteria:");

	if (!hasUserNeed) {
		warnings.push("Missing user need context (# User Need:)");
		score -= 10;
	}

	if (!hasAlternatives) {
		warnings.push("Missing alternatives analysis (# Alternatives Considered:)");
		score -= 10;
	}

	if (!hasSuccessCriteria) {
		warnings.push("Missing success criteria (# Success Criteria:)");
		score -= 10;
	}

	// Check for Given/When/Then structure
	const hasGiven = content.includes("Given");
	const hasWhen = content.includes("When");
	const hasThen = content.includes("Then");

	if (!hasGiven || !hasWhen || !hasThen) {
		issues.push("Incomplete Given/When/Then structure");
		score -= 15;
	}

	// Check for error handling scenarios
	const hasErrorScenario =
		content.toLowerCase().includes("error") ||
		content.toLowerCase().includes("fail") ||
		content.toLowerCase().includes("invalid");

	if (scenarioCount > 1 && !hasErrorScenario) {
		warnings.push(
			"No error handling scenarios found - consider adding failure cases",
		);
		score -= 5;
	}

	// Check for edge cases
	const hasEdgeCaseComment = content.includes("# Edge Cases");
	const hasEdgeCaseScenario =
		content.toLowerCase().includes("edge") ||
		content.toLowerCase().includes("boundary") ||
		content.toLowerCase().includes("empty") ||
		content.toLowerCase().includes("large");

	if (!hasEdgeCaseComment && !hasEdgeCaseScenario && scenarioCount > 1) {
		warnings.push(
			"No edge cases mentioned - consider boundary conditions and unusual inputs",
		);
		score -= 5;
	}

	// Check for Background (if multiple scenarios)
	if (scenarioCount > 2 && !content.includes("Background:")) {
		warnings.push(
			"Consider using Background for common setup across scenarios",
		);
		score -= 5;
	}

	// Check for template boilerplate
	if (content.includes("[Feature Name]") || content.includes("TODO:")) {
		warnings.push("Contains template placeholders - needs customization");
		score -= 10;
	}

	// Ensure score doesn't go below 0
	score = Math.max(0, score);

	return { issues, warnings, score };
}
