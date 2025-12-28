/**
 * OpenCode SDK Test Utilities
 *
 * Provides helper functions for testing orchestrator/worker agent patterns
 * using the @opencode-ai/sdk.
 *
 * IMPORTANT: These utilities are for integration tests that require a real
 * OpenCode server. Tests using these should be marked appropriately and
 * only run when OpenCode is available.
 */

import {
	type OpencodeClient as _OpencodeClient,
	createOpencode,
	createOpencodeClient,
} from "@opencode-ai/sdk";

export type OpencodeClient = _OpencodeClient;

export interface OrchestratorConfig {
	model: string;
	maxIterations: number;
	pauseOn?: string[];
}

export interface WorkerConfig {
	model: string;
}

export interface OrchestrationResult {
	status: "complete" | "error" | "paused" | "max_iterations";
	iterations: number;
	finalMessage?: string;
	error?: string;
	sessionIds: {
		orchestrator: string;
		worker?: string;
	};
}

export interface TestInstance {
	client: OpencodeClient;
	server: { url: string; close: () => void };
}

// Track active instances for cleanup
const activeInstances: TestInstance[] = [];

/**
 * Creates an OpenCode instance with embedded server for testing.
 * The instance is tracked for cleanup.
 *
 * @param timeoutMs - Max time to wait for server startup (default 10s)
 * @returns The test instance or null if unavailable
 */
export async function createTestInstance(
	timeoutMs = 10000,
): Promise<TestInstance | null> {
	try {
		const timeoutPromise = new Promise<null>((resolve) => {
			setTimeout(() => resolve(null), timeoutMs);
		});

		const instancePromise = createOpencode();

		const result = await Promise.race([instancePromise, timeoutPromise]);

		if (result) {
			activeInstances.push(result);
			return result;
		}

		return null;
	} catch (error) {
		console.error("Failed to create OpenCode instance:", error);
		return null;
	}
}

/**
 * Creates an OpenCode client connected to a running server
 */
export async function createTestClient(
	directory: string,
): Promise<OpencodeClient> {
	return createOpencodeClient({ directory });
}

/**
 * Cleans up all active test instances.
 * Call this in afterAll/afterEach to prevent hanging processes.
 */
export function cleanupAllInstances(): void {
	for (const instance of activeInstances) {
		try {
			instance.server.close();
		} catch {
			// Ignore cleanup errors
		}
	}
	activeInstances.length = 0;
}

/**
 * Waits for a session to become idle (no longer busy)
 */
export async function waitForSessionIdle(
	client: OpencodeClient,
	sessionId: string,
	timeoutMs = 300000,
): Promise<void> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeoutMs) {
		const statusResponse = await client.session.status();
		const sessionStatus = statusResponse.data?.[sessionId];

		if (!sessionStatus || sessionStatus.type === "idle") {
			return;
		}

		if (sessionStatus.type === "retry") {
			console.log(
				`Session ${sessionId} retrying: ${sessionStatus.message} (attempt ${sessionStatus.attempt})`,
			);
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error(
		`Session ${sessionId} did not become idle within ${timeoutMs}ms`,
	);
}

/**
 * Creates a session with optional title
 */
export async function createSession(
	client: OpencodeClient,
	title: string,
): Promise<string> {
	const response = await client.session.create({
		body: { title },
	});

	if (!response.data?.id) {
		throw new Error("Failed to create session");
	}

	return response.data.id;
}

/**
 * Creates an orchestrator session with UDD iteration instructions
 */
export async function createOrchestratorSession(
	client: OpencodeClient,
	config: OrchestratorConfig,
): Promise<string> {
	return createSession(
		client,
		`UDD Orchestrator (max: ${config.maxIterations})`,
	);
}

/**
 * Creates a worker session for task execution
 */
export async function createWorkerSession(
	client: OpencodeClient,
	_config: WorkerConfig,
): Promise<string> {
	return createSession(client, "UDD Worker");
}

/**
 * Sends a prompt to a session and waits for completion
 */
export async function promptSession(
	client: OpencodeClient,
	sessionId: string,
	message: string,
	options?: {
		model?: { providerID: string; modelID: string };
		system?: string;
	},
): Promise<string> {
	await client.session.prompt({
		path: { id: sessionId },
		body: {
			parts: [{ type: "text", text: message }],
			model: options?.model,
			system: options?.system,
		},
	});

	await waitForSessionIdle(client, sessionId);

	const messagesResponse = await client.session.messages({
		path: { id: sessionId },
	});

	const messages = messagesResponse.data || [];
	const lastAssistantMessage = messages
		.filter((m) => m.info.role === "assistant")
		.pop();

	if (!lastAssistantMessage) {
		return "";
	}

	return lastAssistantMessage.parts
		.filter((p) => p.type === "text")
		.map((p) => ("text" in p ? p.text || "" : ""))
		.join("\n");
}

/**
 * Checks if the orchestrator response indicates completion
 */
export function isCompleteResponse(response: string): boolean {
	const completionIndicators = [
		"COMPLETE",
		"PHASE_COMPLETE",
		"all tests passing",
		"project is complete",
		"no more work needed",
	];

	const normalizedResponse = response.toLowerCase();
	return completionIndicators.some((indicator) =>
		normalizedResponse.includes(indicator.toLowerCase()),
	);
}

/**
 * Checks if the orchestrator response indicates an error
 */
export function isErrorResponse(response: string): boolean {
	const errorIndicators = [
		"ERROR",
		"FAILED",
		"MAX_RETRIES_EXCEEDED",
		"unrecoverable",
		"fatal error",
	];

	const normalizedResponse = response.toUpperCase();
	return errorIndicators.some((indicator) =>
		normalizedResponse.includes(indicator),
	);
}

/**
 * Checks if the orchestrator response indicates a pause
 */
export function isPausedResponse(response: string): boolean {
	const pauseIndicators = [
		"PAUSED",
		"MAX_ITERATIONS_REACHED",
		"awaiting review",
		"human review required",
	];

	const normalizedResponse = response.toUpperCase();
	return pauseIndicators.some((indicator) =>
		normalizedResponse.includes(indicator),
	);
}

/**
 * Parses model string into provider and model ID
 */
export function parseModelString(model: string): {
	providerID: string;
	modelID: string;
} {
	const parts = model.split("/");
	if (parts.length !== 2) {
		throw new Error(
			`Invalid model format: ${model}. Expected "provider/model"`,
		);
	}
	return {
		providerID: parts[0],
		modelID: parts[1],
	};
}

/**
 * Builds the system prompt for the orchestrator agent
 */
export function buildOrchestratorSystemPrompt(
	config: OrchestratorConfig,
): string {
	return `You are a UDD (User Driven Development) Orchestrator Agent.

Your role is to:
1. Review the project status using \`udd status --json\`
2. Determine if there is work remaining or if the project is complete
3. If work is needed, provide clear task instructions for a worker agent
4. After worker completes, review the work and decide next steps
5. Continue until the project is complete or an error occurs

RULES:
- Maximum iterations: ${config.maxIterations}
- ${config.pauseOn?.length ? `Pause on: ${config.pauseOn.join(", ")}` : "No pause conditions"}

RESPONSE FORMAT:
- When complete: Include "COMPLETE" in your response
- When error: Include "ERROR:" followed by details
- When paused: Include "PAUSED:" followed by reason
- When delegating: Provide clear task description for worker

Always start by running \`udd status --json\` to understand the current state.`;
}

/**
 * Builds the system prompt for the worker agent
 */
export function buildWorkerSystemPrompt(): string {
	return `You are a UDD (User Driven Development) Worker Agent.

Your role is to execute specific tasks delegated by the orchestrator:
1. Understand the task requirements
2. Make necessary code changes following UDD principles
3. Run tests to verify changes
4. Report completion status

RULES:
- Follow the spec-first approach: scenarios define behavior
- Make minimal, focused changes
- Commit frequently with clear messages
- Report any blockers or issues

When your task is complete, clearly state "TASK COMPLETE" with a summary of changes made.`;
}

/**
 * Runs the full orchestration loop
 */
export async function runOrchestrationLoop(
	client: OpencodeClient,
	orchestratorConfig: OrchestratorConfig,
	workerConfig: WorkerConfig,
	initialPrompt: string,
): Promise<OrchestrationResult> {
	const orchestratorSessionId = await createOrchestratorSession(
		client,
		orchestratorConfig,
	);
	let workerSessionId: string | undefined;

	let iterations = 0;
	const orchestratorModel = parseModelString(orchestratorConfig.model);
	const workerModel = parseModelString(workerConfig.model);
	const orchestratorSystem = buildOrchestratorSystemPrompt(orchestratorConfig);
	const workerSystem = buildWorkerSystemPrompt();

	try {
		let orchestratorResponse = await promptSession(
			client,
			orchestratorSessionId,
			initialPrompt,
			{ model: orchestratorModel, system: orchestratorSystem },
		);

		while (iterations < orchestratorConfig.maxIterations) {
			iterations++;

			if (isCompleteResponse(orchestratorResponse)) {
				return {
					status: "complete",
					iterations,
					finalMessage: orchestratorResponse,
					sessionIds: {
						orchestrator: orchestratorSessionId,
						worker: workerSessionId,
					},
				};
			}

			if (isErrorResponse(orchestratorResponse)) {
				return {
					status: "error",
					iterations,
					error: orchestratorResponse,
					sessionIds: {
						orchestrator: orchestratorSessionId,
						worker: workerSessionId,
					},
				};
			}

			if (isPausedResponse(orchestratorResponse)) {
				return {
					status: "paused",
					iterations,
					finalMessage: orchestratorResponse,
					sessionIds: {
						orchestrator: orchestratorSessionId,
						worker: workerSessionId,
					},
				};
			}

			if (!workerSessionId) {
				workerSessionId = await createWorkerSession(client, workerConfig);
			}

			const workerResponse = await promptSession(
				client,
				workerSessionId,
				orchestratorResponse,
				{ model: workerModel, system: workerSystem },
			);

			orchestratorResponse = await promptSession(
				client,
				orchestratorSessionId,
				`Worker completed with the following response:\n\n${workerResponse}\n\nReview the work and determine next steps. Run \`udd status --json\` to check current state.`,
				{ model: orchestratorModel, system: orchestratorSystem },
			);
		}

		return {
			status: "max_iterations",
			iterations,
			finalMessage: `Maximum iterations (${orchestratorConfig.maxIterations}) reached`,
			sessionIds: {
				orchestrator: orchestratorSessionId,
				worker: workerSessionId,
			},
		};
	} catch (error) {
		return {
			status: "error",
			iterations,
			error: error instanceof Error ? error.message : String(error),
			sessionIds: {
				orchestrator: orchestratorSessionId,
				worker: workerSessionId,
			},
		};
	}
}
