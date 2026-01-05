import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";

export const discoverCommand = new Command("discover").description(
	"Interactive feature discovery using SysML principles",
);

discoverCommand
	.command("feature")
	.argument("<path>", "Feature path (e.g., export/csv-export, auth/login)")
	.description("Guided feature discovery with SysML-style analysis")
	.action(async (featurePath: string) => {
		// Parse the path into domain and name
		const pathParts = featurePath.split("/");
		if (pathParts.length !== 2 || !pathParts[0] || !pathParts[1]) {
			console.error(
				chalk.red(
					"Error: Feature path must be in format <domain>/<name> (e.g., export/csv-export)",
				),
			);
			process.exit(1);
		}
		const [domain, name] = pathParts;
		console.log(chalk.blue.bold("\n🔍 SysML-Informed Feature Discovery\n"));
		console.log(
			chalk.dim(
				"Let's think through this feature thoroughly before writing scenarios.\n",
			),
		);

		try {
			// Step 1: Understand the user need
			console.log(chalk.yellow("📋 Step 1: User Need Analysis\n"));

			// Helper function to sanitize input for Gherkin comments
			const sanitizeForComment = (text: string): string => {
				return text
					.replace(/\n/g, " ") // Replace newlines with spaces
					.replace(/\r/g, "") // Remove carriage returns
					.trim();
			};

			const userNeed = sanitizeForComment(
				await input({
					message: "What user need does this feature address?",
					validate: (value) =>
						value.length > 0 || "Please describe the user need",
				}),
			);

			const who = sanitizeForComment(
				await input({
					message: "Who are the users/actors? (e.g., Data Analysts, Users)",
					validate: (value) => value.length > 0 || "Please specify the users",
				}),
			);

			const why = sanitizeForComment(
				await input({
					message: "Why does this matter? (Business value)",
					validate: (value) =>
						value.length > 0 || "Please explain the business value",
				}),
			);

			// Step 2: Alternatives
			console.log(chalk.yellow("\n🤔 Step 2: Alternatives Analysis\n"));
			console.log(
				chalk.dim("Consider different approaches before committing to one.\n"),
			);

			const alternatives: Array<{
				name: string;
				description: string;
				decision: string;
				reason: string;
			}> = [];

			let addMore = true;
			while (addMore) {
				const altName = sanitizeForComment(
					await input({
						message: "Alternative approach name:",
					}),
				);

				if (!altName) {
					if (alternatives.length === 0) {
						console.log(
							chalk.yellow(
								"\nAt least one alternative should be considered. Please add one.\n",
							),
						);
						continue;
					}
					break;
				}

				const altDescription = sanitizeForComment(
					await input({
						message: `Describe "${altName}":`,
					}),
				);

				const altDecision = await select({
					message: `Decision for "${altName}":`,
					choices: [
						{ name: "Chosen (this is the best option)", value: "CHOSEN" },
						{ name: "Deferred (maybe later)", value: "Deferred" },
						{ name: "Rejected (not suitable)", value: "Rejected" },
					],
				});

				const altReason = sanitizeForComment(
					await input({
						message: `Why ${altDecision.toLowerCase()}?`,
					}),
				);

				alternatives.push({
					name: altName,
					description: altDescription,
					decision: altDecision,
					reason: altReason,
				});

				addMore = await confirm({
					message: "Add another alternative?",
					default: true,
				});
			}

			// Step 3: Success Criteria
			console.log(chalk.yellow("\n✅ Step 3: Success Criteria\n"));
			console.log(
				chalk.dim("What does 'done' look like? Be specific and measurable.\n"),
			);

			const successCriteria: string[] = [];
			let addMoreCriteria = true;

			while (addMoreCriteria) {
				const criterion = sanitizeForComment(
					await input({
						message: "Success criterion (leave empty to finish):",
					}),
				);

				if (!criterion) break;

				successCriteria.push(criterion);

				addMoreCriteria = await confirm({
					message: "Add another criterion?",
					default: true,
				});
			}

			// Step 4: Edge Cases
			console.log(chalk.yellow("\n⚠️  Step 4: Edge Cases & Error Conditions\n"));
			console.log(
				chalk.dim(
					"Think about what could go wrong, boundaries, and unusual conditions.\n",
				),
			);

			const edgeCases: string[] = [];
			let addMoreEdgeCases = true;

			while (addMoreEdgeCases) {
				const edgeCase = sanitizeForComment(
					await input({
						message: "Edge case or error condition (leave empty to finish):",
					}),
				);

				if (!edgeCase) break;

				edgeCases.push(edgeCase);

				addMoreEdgeCases = await confirm({
					message: "Add another edge case?",
					default: true,
				});
			}

			// Step 5: Generate feature file
			console.log(chalk.yellow("\n📝 Step 5: Generating Feature File\n"));

			const featureName = name
				.split("_")
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");

			// Build alternatives section
			const alternativesText = alternatives
				.map(
					(alt) =>
						`  #   - ${alt.name}: ${alt.description} - ${alt.decision} (${alt.reason})`,
				)
				.join("\n");

			const successCriteriaText = successCriteria
				.map((c) => `  #   - ${c}`)
				.join("\n");

			const edgeCasesText = edgeCases.map((e) => `  #   - ${e}`).join("\n");

			const featureContent = `Feature: ${featureName}
  # User Need: ${userNeed}
  # Who: ${who}
  # Why: ${why}
  # 
  # Alternatives Considered:
${alternativesText}
  #
  # Success Criteria:
${successCriteriaText}
  #
  # Edge Cases to Cover:
${edgeCasesText}

  Background:
    Given [common preconditions that apply to all scenarios]

  Scenario: [Happy path - describe the main success scenario]
    Given [initial state]
    When [user action]
    Then [expected outcome]

  Scenario: [Error handling - what if it goes wrong?]
    Given [setup for error condition]
    When [action that triggers error]
    Then [appropriate error response]

  # Add more scenarios based on edge cases identified above
  # For each edge case, create a specific scenario that tests it
`;

			// Save feature file
			const rootDir = process.cwd();
			const specsDir = path.join(rootDir, "specs", domain);
			const filePath = path.join(specsDir, `${name}.feature`);

			await fs.mkdir(specsDir, { recursive: true });
			await fs.writeFile(filePath, featureContent);

			console.log(chalk.green(`\n✓ Created feature file: ${filePath}`));

			// Offer to create test stub
			const createTest = await confirm({
				message: "Create test stub?",
				default: true,
			});

			if (createTest) {
				const testDir = path.join(rootDir, "tests", "e2e", domain);
				const testFilePath = path.join(testDir, `${name}.e2e.test.ts`);
				const testContent = `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/${domain}/${name}.feature");

describeFeature(feature, ({ Scenario }) => {
	// Implement scenarios based on the feature file
	// Replace these placeholders with actual step implementations
	
	Scenario("Happy path - describe the main success scenario", ({ Given, When, Then }) => {
		Given(/(.+)/, (state: string) => {
			// Set up initial state
		});

		When(/(.+)/, (action: string) => {
			// Perform the action
		});

		Then(/(.+)/, (outcome: string) => {
			// Verify the outcome
			expect(true).toBe(true);
		});
	});

	Scenario("Error handling - what if it goes wrong?", ({ Given, When, Then }) => {
		Given(/(.+)/, (state: string) => {
			// Set up error condition
		});

		When(/(.+)/, (action: string) => {
			// Trigger the error
		});

		Then(/(.+)/, (response: string) => {
			// Verify error handling
			expect(true).toBe(true);
		});
	});
});
`;

				await fs.mkdir(testDir, { recursive: true });
				await fs.writeFile(testFilePath, testContent);
				console.log(chalk.green(`✓ Created test stub: ${testFilePath}`));
			}

			// Summary
			console.log(chalk.blue.bold("\n📊 Discovery Summary:\n"));
			console.log(chalk.white(`User Need: ${userNeed}`));
			console.log(chalk.white(`Actors: ${who}`));
			console.log(
				chalk.white(`Alternatives Considered: ${alternatives.length}`),
			);
			console.log(chalk.white(`Success Criteria: ${successCriteria.length}`));
			console.log(chalk.white(`Edge Cases Identified: ${edgeCases.length}`));

			console.log(chalk.yellow("\n📝 Next Steps:\n"));
			console.log(
				chalk.dim(
					"1. Review and refine the generated feature file with specific scenarios",
				),
			);
			console.log(
				chalk.dim("2. Add concrete Given/When/Then steps based on edge cases"),
			);
			console.log(chalk.dim("3. Implement test step definitions"));
			console.log(chalk.dim("4. Run tests (they should fail initially)"));
			console.log(chalk.dim("5. Implement the feature to make tests pass"));
			console.log(
				chalk.dim(
					"\nSee docs/example-features/ for examples of complete feature files.",
				),
			);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "User force closed the prompt"
			) {
				console.log(chalk.yellow("\n\nDiscovery cancelled."));
				process.exit(0);
			}
			console.error(chalk.red("Error during discovery:"), error);
			process.exit(1);
		}
	});
