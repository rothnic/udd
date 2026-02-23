import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { userWarn } from "../lib/cli-error.js";

export const initCommand = new Command("init")
	.description("Initialize UDD in a project")
	.option("-y, --yes", "Skip prompts and use defaults")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");

		// Check initialization state and handle partial/corrupted states
		const specsUddDir = path.join(specsDir, ".udd");
		let productExists = false;
		let specsUddExists = false;

		// Check what exists
		try {
			await fs.access(productDir);
			productExists = true;
		} catch {
			// product/ doesn't exist
		}

		try {
			await fs.access(specsUddDir);
			specsUddExists = true;
		} catch {
			// specs/.udd doesn't exist
		}

		// Handle based on state
		if (productExists && specsUddExists) {
			// Normal already-initialized case
			console.log(
				chalk.yellow("UDD already initialized (product/ directory exists)"),
			);
			if (options.yes) {
				// With --yes and already initialized, exit cleanly without overwriting
				process.exit(0);
			}
			const overwrite = await confirm({
				message: "Reinitialize? This will overwrite existing files.",
				default: false,
			});
			if (!overwrite) {
				process.exit(0);
			}
		} else if (productExists && !specsUddExists) {
			// Partial state: product/ exists but specs/.udd is missing
			console.log(
				chalk.yellow(
					"Partial UDD state detected: product/ exists but specs/.udd is missing.",
				),
			);
			if (options.yes) {
				userWarn("Running with --yes: will create specs/.udd structure.");
			} else {
				const recover = await confirm({
					message: "Recover by creating specs/.udd?",
					default: true,
				});
				if (!recover) {
					process.exit(0);
				}
			}
		} else if (!productExists && specsUddExists) {
			// Partial state: specs/.udd exists but product/ is missing
			userWarn(
				"Partial UDD state detected: specs/.udd exists but product/ is missing.",
			);
			console.log(chalk.dim("  Recovering by creating product/ structure..."));
		}
		// else: neither exists - fresh init, continue normally

		console.log(chalk.cyan("\n🚀 Let's define your product!\n"));

		// Interview the user
		const productName = options.yes
			? "My Product"
			: await input({
					message: "What are you building? (one sentence)",
					default: "My Product",
				});

		const actorsInput = options.yes
			? "User"
			: await input({
					message: "Who uses it? (comma-separated)",
					default: "User",
				});

		const firstAction = options.yes
			? "Signs up and starts using the app"
			: await input({
					message: "What's the first thing a new user does?",
					default: "Signs up and starts using the app",
				});

		const constraintsInput = options.yes
			? ""
			: await input({
					message: "Any hard constraints? (security, performance, etc.)",
					default: "",
				});

		// Parse actors
		const actors = actorsInput
			.split(",")
			.map((a) => a.trim())
			.filter((a) => a.length > 0);

		// Create directories
		await fs.mkdir(path.join(productDir, "journeys"), { recursive: true });
		await fs.mkdir(path.join(specsDir, ".udd"), { recursive: true });

		// Create product/README.md
		const readmeContent = `# ${productName}

${productName}

## Structure

- [actors.md](actors.md) - Who uses this product
- [constraints.md](constraints.md) - Non-functional requirements
- [changelog.md](changelog.md) - Decision history
- [journeys/](journeys/) - User journeys

## Next Steps

1. Review and edit \`actors.md\`
2. Add constraints in \`constraints.md\`
3. Create user journeys in \`journeys/\`
4. Run \`udd sync\` to generate BDD scenarios
`;
		await fs.writeFile(path.join(productDir, "README.md"), readmeContent);
		console.log(chalk.green("✓ Created product/README.md"));

		// Create product/actors.md
		const actorRows = actors
			.map((actor) => `| ${actor} | TODO: Add description |`)
			.join("\n");
		const actorsContent = `# Actors

| Actor | Description |
|-------|-------------|
${actorRows}
`;
		await fs.writeFile(path.join(productDir, "actors.md"), actorsContent);
		console.log(chalk.green("✓ Created product/actors.md"));

		// Create product/constraints.md
		let constraintsContent = `# Constraints

Non-functional requirements and hard rules.
`;
		if (constraintsInput) {
			constraintsContent += `\n## From Interview\n\n- ${constraintsInput}\n`;
		} else {
			constraintsContent += `
## Performance

<!-- Add performance constraints -->

## Security

<!-- Add security constraints -->
`;
		}
		await fs.writeFile(
			path.join(productDir, "constraints.md"),
			constraintsContent,
		);
		console.log(chalk.green("✓ Created product/constraints.md"));

		// Create product/changelog.md
		const date = new Date().toISOString().split("T")[0];
		const changelogContent = `# Changelog

## ${date}

- Created: Initial product structure via \`udd init\`
`;
		await fs.writeFile(path.join(productDir, "changelog.md"), changelogContent);
		console.log(chalk.green("✓ Created product/changelog.md"));

		// Create initial journey
		const journeySlug = "new_user_onboarding";
		const primaryActor = actors[0] || "User";
		const journeyContent = `# Journey: New User Onboarding

**Actor:** ${primaryActor}  
**Goal:** ${firstAction}

## Steps

1. ${firstAction} → \`specs/auth/signup.feature\`

## Success

${primaryActor} has completed their first action.
`;
		await fs.writeFile(
			path.join(productDir, "journeys", `${journeySlug}.md`),
			journeyContent,
		);
		console.log(chalk.green(`✓ Created product/journeys/${journeySlug}.md`));

		// Create manifest
		const manifestContent = `# UDD Manifest
# Auto-generated by udd sync

journeys: {}
scenarios: {}
`;
		await fs.writeFile(
			path.join(specsDir, ".udd", "manifest.yml"),
			manifestContent,
		);
		console.log(chalk.green("✓ Created specs/.udd/manifest.yml"));

		console.log(
			chalk.cyan(
				"\n✨ UDD initialized! Next: Run `udd sync` to generate scenarios.\n",
			),
		);
	});
