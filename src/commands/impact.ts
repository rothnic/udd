import chalk from "chalk";
import { Command } from "commander";
import { analyzeImpact } from "../lib/trace-graph.js";

export const impactCommand = new Command("impact")
	.description("Show what a source artifact affects")
	.argument("<path>", "Spec, scenario, or test path to analyze")
	.option("--json", "Output deterministic impact JSON")
	.action(async (targetPath: string, options: { json?: boolean }) => {
		const result = await analyzeImpact(targetPath);

		if (options.json) {
			console.log(JSON.stringify(result, null, 2));
			return;
		}

		console.log(chalk.bold("UDD Impact"));
		console.log(chalk.dim("=========="));
		console.log("");
		console.log(`Input: ${result.input}`);
		console.log(`Matched nodes: ${result.resolved.length}`);
		console.log(
			`Affected: ${result.affected.use_cases.length} use case(s), ${result.affected.scenarios.length} scenario(s), ${result.affected.tests.length} test(s)`,
		);

		for (const useCase of result.affected.use_cases) {
			console.log(`- ${useCase.label} (${useCase.source.path})`);
		}
	});
