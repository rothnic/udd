import chalk from "chalk";
import { Command } from "commander";
import { buildTraceGraph } from "../lib/trace-graph.js";
import { validateSpecs } from "../lib/validator.js";

export const lintCommand = new Command("lint")
	.description("Validate spec structure and relationships")
	.action(async () => {
		try {
			const results = await validateSpecs();
			if (results.valid) {
				const traceGraph = await buildTraceGraph();
				console.log(chalk.green("All specs are valid"));
				console.log(
					chalk.dim(
						`Trace graph: ${traceGraph.nodes.length} node(s), ${traceGraph.edges.length} edge(s), ${traceGraph.diagnostics.length} diagnostic(s)`,
					),
				);
				process.exit(0);
			} else {
				console.error(chalk.red("Spec validation failed:"));
				results.errors.forEach((err) => {
					console.error(chalk.red(`- ${err}`));
				});
				process.exit(1);
			}
		} catch (error) {
			console.error(
				chalk.red("An unexpected error occurred during linting:"),
				error,
			);
			process.exit(1);
		}
	});
