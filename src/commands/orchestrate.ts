import chalk from "chalk";
import { Command } from "commander";
import { describeProjectState } from "../lib/agent-integration.js";
import { getProjectStatus } from "../lib/status.js";
import { detectDrift } from "./doctor.js";

/**
 * Orchestrator Configuration
 */
export interface OrchestratorConfig {
	maxIterations: number;
	pauseOn: string[];
}

/**
 * Iteration State
 */
interface IterationState {
	iteration: number;
	status: "running" | "paused" | "complete" | "error" | "max_iterations";
	message: string;
	pauseReason?: string;
	actions: IterationAction[];
}

/**
 * Individual action taken during an iteration
 */
interface IterationAction {
	type: string;
	description: string;
	status: "success" | "failure" | "pending";
	result?: string;
}

/**
 * Overall orchestration result
 */
export interface OrchestrationResult {
	success: boolean;
	status: "complete" | "paused" | "error" | "max_iterations";
	iterations: number;
	durationMs: number;
	message: string;
	pauseReason?: string;
	finalState?: IterationState;
	actions: IterationAction[];
}

/**
 * Pause condition types
 */
const PAUSE_CONDITIONS = ["error", "test_failure", "manual", "milestone"];

/**
 * Check if a pause condition is valid
 */
function isValidPauseCondition(condition: string): boolean {
	return PAUSE_CONDITIONS.includes(condition.trim().toLowerCase());
}

/**
 * Parse pause conditions from comma-separated string
 */
function parsePauseConditions(conditions: string): string[] {
	if (!conditions.trim()) return [];
	return conditions
		.split(",")
		.map((c) => c.trim().toLowerCase())
		.filter((c) => c);
}

/**
 * Determine if we should pause based on current state and pause conditions
 */
function shouldPause(
	state: IterationState,
	pauseConditions: string[],
): { shouldPause: boolean; reason?: string } {
	for (const condition of pauseConditions) {
		switch (condition) {
			case "error":
				if (state.status === "error") {
					return { shouldPause: true, reason: "error" };
				}
				break;
			case "test_failure":
				if (state.actions.some((a) => a.status === "failure")) {
					return { shouldPause: true, reason: "test_failure" };
				}
				break;
			case "manual":
				// Always pause on manual condition
				return { shouldPause: true, reason: "manual" };
			case "milestone":
				// Pause if a journey was completed
				if (state.message.toLowerCase().includes("journey complete")) {
					return { shouldPause: true, reason: "milestone" };
				}
				break;
		}
	}
	return { shouldPause: false };
}

/**
 * Execute a single iteration of the orchestration loop
 */
async function executeIteration(
	iteration: number,
	_config: OrchestratorConfig,
): Promise<IterationState> {
	const actions: IterationAction[] = [];

	try {
		// Step 1: Check project status
		actions.push({
			type: "check_status",
			description: "Checking project status",
			status: "pending",
		});

		const [status, drift] = await Promise.all([
			getProjectStatus(),
			detectDrift(),
		]);

		actions[0].status = "success";
		actions[0].result = describeProjectState(status);

		// Step 2: Determine if there's work to do
		actions.push({
			type: "analyze",
			description: "Analyzing project state",
			status: "pending",
		});

		const hasCriticalIssues = drift.issues.some(
			(i) => i.severity === "critical",
		);
		const hasWork =
			drift.issues.length > 0 ||
			Object.values(status.journeys).some(
				(j) => j.scenariosMissing > 0 || j.isStale,
			);

		actions[1].status = "success";

		if (!hasWork) {
			return {
				iteration,
				status: "complete",
				message: "All work complete - no remaining tasks",
				actions,
			};
		}

		// Step 3: Identify next work item
		actions.push({
			type: "plan",
			description: "Planning next action",
			status: "pending",
		});

		let planMessage = "";

		if (hasCriticalIssues) {
			planMessage = "Critical issues detected - run 'udd doctor --fix'";
		} else {
			// Find incomplete journey
			const incompleteJourneys = Object.entries(status.journeys)
				.filter(([, j]) => j.scenariosMissing > 0)
				.sort(([, a], [, b]) => b.scenariosMissing - a.scenariosMissing);

			if (incompleteJourneys.length > 0) {
				const [journeyKey, journey] = incompleteJourneys[0];
				planMessage = `Work on journey: ${journeyKey} (${journey.scenariosMissing} scenarios missing)`;
			} else if (Object.values(status.journeys).some((j) => j.isStale)) {
				planMessage = "Run 'udd sync' to update stale journeys";
			} else {
				planMessage = "Address drift issues or create new journeys";
			}
		}

		actions[2].status = "success";
		actions[2].result = planMessage;

		return {
			iteration,
			status: "running",
			message: planMessage,
			actions,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Mark last pending action as failed
		for (const action of actions) {
			if (action.status === "pending") {
				action.status = "failure";
				action.result = errorMessage;
			}
		}

		return {
			iteration,
			status: "error",
			message: `Error in iteration ${iteration}: ${errorMessage}`,
			actions,
		};
	}
}

/**
 * Run the orchestration loop until completion or limit reached
 */
async function runOrchestration(
	config: OrchestratorConfig,
): Promise<OrchestrationResult> {
	const startTime = Date.now();
	const allActions: IterationAction[] = [];
	let currentState: IterationState = {
		iteration: 0,
		status: "running",
		message: "Starting orchestration",
		actions: [],
	};

	try {
		for (let i = 1; i <= config.maxIterations; i++) {
			currentState = await executeIteration(i, config);
			allActions.push(...currentState.actions);

			// Check pause conditions
			const pauseCheck = shouldPause(currentState, config.pauseOn);
			if (pauseCheck.shouldPause) {
				currentState.status = "paused";
				currentState.pauseReason = pauseCheck.reason;
				break;
			}

			// Check for completion
			if (currentState.status === "complete") {
				break;
			}

			// Check for error
			if (currentState.status === "error") {
				break;
			}
		}

		// If we've hit max iterations without completion
		if (
			currentState.iteration >= config.maxIterations &&
			currentState.status === "running"
		) {
			currentState.status = "max_iterations";
			currentState.message = `Maximum iterations (${config.maxIterations}) reached`;
		}
	} catch (error) {
		currentState.status = "error";
		currentState.message =
			error instanceof Error ? error.message : String(error);
	}

	const durationMs = Date.now() - startTime;

	// Convert "running" status to "max_iterations" for result
	// (if still running when loop exits, we hit the iteration limit)
	const resultStatus: OrchestrationResult["status"] =
		currentState.status === "running" ? "max_iterations" : currentState.status;

	return {
		success: resultStatus === "complete",
		status: resultStatus,
		iterations: currentState.iteration,
		durationMs,
		message: currentState.message,
		pauseReason: currentState.pauseReason,
		finalState: currentState,
		actions: allActions,
	};
}

/**
 * Format orchestration result for human-readable output
 */
function formatResult(result: OrchestrationResult): string {
	const lines: string[] = [];

	// Header
	lines.push(chalk.bold("\n🔄 Orchestration Results"));
	lines.push(chalk.dim("========================\n"));

	// Status
	const statusColor =
		result.status === "complete"
			? chalk.green
			: result.status === "paused"
				? chalk.yellow
				: chalk.red;

	lines.push(chalk.bold("Status: ") + statusColor(result.status.toUpperCase()));

	// Metrics
	lines.push(chalk.bold("Iterations: ") + result.iterations.toString());
	lines.push(
		`${chalk.bold("Duration: ")}${(result.durationMs / 1000).toFixed(2)}s`,
	);

	// Message
	if (result.message) {
		lines.push(chalk.bold("\nMessage:"));
		lines.push(`  ${result.message}`);
	}

	// Pause reason
	if (result.pauseReason) {
		lines.push(chalk.yellow(`\n⏸️  Paused: ${result.pauseReason}`));
	}

	// Actions summary
	if (result.actions.length > 0) {
		lines.push(chalk.bold("\nActions Taken:"));
		for (const action of result.actions) {
			const icon =
				action.status === "success"
					? "✓"
					: action.status === "failure"
						? "✗"
						: "○";
			const color =
				action.status === "success"
					? chalk.green
					: action.status === "failure"
						? chalk.red
						: chalk.gray;

			lines.push(`  ${color(icon)} ${action.description}`);
			if (action.result) {
				lines.push(chalk.dim(`    → ${action.result}`));
			}
		}
	}

	lines.push("");
	return lines.join("\n");
}

/**
 * Orchestrate command - Autonomous iteration with configurable limits
 */
export const orchestrateCommand = new Command("orchestrate")
	.description("Autonomous iteration with configurable limits")
	.option("--max-iterations <n>", "Maximum iterations before stopping", "10")
	.option("--pause-on <conditions>", "Comma-separated pause triggers", "")
	.option("--json", "Output results as JSON")
	.action(async (options) => {
		try {
			// Parse and validate options
			const maxIterations = parseInt(options.maxIterations, 10);
			if (Number.isNaN(maxIterations) || maxIterations < 1) {
				throw new Error(
					`Invalid max-iterations: ${options.maxIterations}. Must be a positive integer.`,
				);
			}

			// Parse pause conditions
			const pauseOn = parsePauseConditions(options.pauseOn || "");
			const invalidConditions = pauseOn.filter(
				(c) => !isValidPauseCondition(c),
			);
			if (invalidConditions.length > 0) {
				console.error(
					chalk.red(
						`Invalid pause conditions: ${invalidConditions.join(", ")}`,
					),
				);
				console.error(
					chalk.yellow(`Valid conditions: ${PAUSE_CONDITIONS.join(", ")}`),
				);
				process.exit(1);
			}

			const config: OrchestratorConfig = {
				maxIterations,
				pauseOn,
			};

			// Run orchestration
			const result = await runOrchestration(config);

			// Output results
			if (options.json) {
				const jsonOutput = {
					success: result.success,
					status: result.status,
					iterations: result.iterations,
					duration_ms: result.durationMs,
					message: result.message,
					pause_reason: result.pauseReason,
					actions: result.actions.map((a) => ({
						type: a.type,
						description: a.description,
						status: a.status,
						result: a.result,
					})),
					generated_at: new Date().toISOString(),
				};
				console.log(JSON.stringify(jsonOutput, null, 2));
			} else {
				console.log(formatResult(result));
			}

			// Exit with appropriate code
			if (result.status === "error") {
				process.exit(1);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							status: "error",
							error: errorMessage,
							generated_at: new Date().toISOString(),
						},
						null,
						2,
					),
				);
			} else {
				console.error(chalk.red("Orchestration failed:"), errorMessage);
			}
			process.exit(1);
		}
	});
