# Create examples command (@Sisyphus-Junior subagent)

**ID**: ses_369c6dd9affeSQ1WruxAUslc1R
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 1:14:12 PM
**Stats**: 1 files changed, +72 -0

---

## USER (1:14:12 PM)

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


