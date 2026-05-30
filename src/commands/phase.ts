import chalk from "chalk";
import { Command } from "commander";
import {
	loadRoadmapState,
	setCurrentPhase,
	validatePhaseConsistency,
} from "../lib/phase.js";

function printPhaseList(rootDir: string): void {
	const roadmap = loadRoadmapState(rootDir);
	console.log(chalk.blue.bold("\nDevelopment Phases\n"));
	for (const phase of roadmap.phases) {
		const marker =
			phase.number === roadmap.currentPhase ? chalk.green("->") : "  ";
		const suffix =
			phase.number === roadmap.currentPhase ? chalk.green(" (current)") : "";
		console.log(`${marker} ${phase.number}: ${phase.name}${suffix}`);
	}
}

export const phaseCommand = new Command("phase")
	.description("Inspect and manage roadmap phases")
	.addCommand(
		new Command("current")
			.description("Show current roadmap phase")
			.action(() => {
				const roadmap = loadRoadmapState(process.cwd());
				console.log(
					`Phase ${roadmap.currentPhase}: ${roadmap.phaseNames[String(roadmap.currentPhase)]}`,
				);
			}),
	)
	.addCommand(
		new Command("list").description("List roadmap phases").action(() => {
			printPhaseList(process.cwd());
		}),
	)
	.addCommand(
		new Command("set")
			.description("Set current roadmap phase")
			.argument("<number>", "Phase number", (value) =>
				Number.parseInt(value, 10),
			)
			.action((phaseNumber: number) => {
				if (!Number.isFinite(phaseNumber)) {
					console.error(chalk.red("Phase number must be an integer."));
					process.exit(1);
				}
				const roadmap = setCurrentPhase(process.cwd(), phaseNumber);
				console.log(
					chalk.green(
						`Phase set to ${roadmap.currentPhase}: ${roadmap.phaseNames[String(roadmap.currentPhase)]}`,
					),
				);
			}),
	)
	.addCommand(
		new Command("check")
			.description("Validate roadmap phases against feature @phase tags")
			.option("--json", "Output report as JSON")
			.option("--strict", "Exit non-zero when phase errors are found")
			.action((options) => {
				const report = validatePhaseConsistency(process.cwd());
				const errors = report.issues.filter((issue) => issue.level === "error");

				if (options.json) {
					console.log(JSON.stringify(report, null, 2));
				} else {
					console.log(
						chalk.blue.bold(
							`Current phase: ${report.currentPhase} - ${report.currentPhaseName}`,
						),
					);
					if (report.issues.length === 0) {
						console.log(chalk.green("No phase consistency issues found."));
					}
					for (const issue of report.issues) {
						const icon =
							issue.level === "error"
								? chalk.red("error")
								: chalk.yellow("warn");
						const location = issue.file ? `${issue.file}: ` : "";
						console.log(`${icon} ${location}${issue.message}`);
						if (issue.suggestion) {
							console.log(chalk.dim(`  ${issue.suggestion}`));
						}
					}
				}

				if (options.strict && errors.length > 0) {
					process.exit(1);
				}
			}),
	);
