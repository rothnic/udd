import chalk from "chalk";
import { Command } from "commander";
import { buildTraceGraph } from "../lib/trace-graph.js";

export const traceCommand = new Command("trace")
	.description(
		"Show the canonical Objective -> Use Case -> Scenario -> E2E graph",
	)
	.option("--json", "Output deterministic graph JSON")
	.action(async (options: { json?: boolean }) => {
		const graph = await buildTraceGraph();

		if (options.json) {
			console.log(JSON.stringify(graph, null, 2));
			return;
		}

		console.log(chalk.bold("UDD Trace Graph"));
		console.log(chalk.dim("==============="));
		console.log("");
		console.log(`Nodes: ${graph.nodes.length}`);
		console.log(`Edges: ${graph.edges.length}`);
		console.log(`Diagnostics: ${graph.diagnostics.length}`);

		for (const diagnostic of graph.diagnostics.slice(0, 20)) {
			const color =
				diagnostic.severity === "error"
					? chalk.red
					: diagnostic.severity === "warning"
						? chalk.yellow
						: chalk.blue;
			console.log("");
			console.log(
				color(`${diagnostic.severity.toUpperCase()} ${diagnostic.type}`),
			);
			console.log(`  ${diagnostic.message}`);
			console.log(chalk.dim(`  Source: ${diagnostic.source.path}`));
		}
	});
