/**
 * OpenCode Integration Tests
 *
 * These tests require a real OpenCode server and are NOT run by default.
 * They are excluded in vitest.config.ts.
 *
 * To run these tests manually:
 *   npx vitest run tests/e2e/opencode/integration --no-watch
 *
 * Prerequisites:
 * - OpenCode must be installed and configured
 * - API keys must be set for the models being tested
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupAllInstances,
	createSession,
	createTestInstance,
	isCompleteResponse,
	type OpencodeClient,
	promptSession,
	type TestInstance,
} from "../opencode-utils.js";

describe("OpenCode SDK Integration", () => {
	let instance: TestInstance | null = null;
	let client: OpencodeClient | null = null;

	beforeAll(async () => {
		instance = await createTestInstance(15000);
		if (instance) {
			client = instance.client;
		}
	}, 30000);

	afterAll(() => {
		cleanupAllInstances();
	});

	it("should create a session", async () => {
		if (!client) {
			console.log("OpenCode not available - skipping");
			return;
		}
		const sessionId = await createSession(client, "Test Session");
		expect(sessionId).toBeTruthy();
	});

	it("should send a prompt and get a response", async () => {
		if (!client) {
			console.log("OpenCode not available - skipping");
			return;
		}
		const sessionId = await createSession(client, "Prompt Test");
		const response = await promptSession(
			client,
			sessionId,
			"Say hello in one word",
		);
		expect(response).toBeTruthy();
	}, 60000);

	it("should run udd status via agent", async () => {
		if (!client) {
			console.log("OpenCode not available - skipping");
			return;
		}
		const sessionId = await createSession(client, "UDD Status Test");
		const response = await promptSession(
			client,
			sessionId,
			"Run `udd status --json` and tell me the current phase number only",
		);
		expect(response).toBeTruthy();
	}, 120000);
});

describe("Orchestrator Pattern Integration", () => {
	let instance: TestInstance | null = null;
	let client: OpencodeClient | null = null;

	beforeAll(async () => {
		instance = await createTestInstance(15000);
		if (instance) {
			client = instance.client;
		}
	}, 30000);

	afterAll(() => {
		cleanupAllInstances();
	});

	it("orchestrator can review project status", async () => {
		if (!client) {
			console.log("OpenCode not available - skipping");
			return;
		}

		const sessionId = await createSession(client, "Orchestrator Review");

		// First verify udd status works locally
		const localStatus = await runUdd("status --json");
		const status = JSON.parse(localStatus.stdout);
		expect(status.current_phase).toBeDefined();

		// Then have agent review it
		const response = await promptSession(
			client,
			sessionId,
			`Run \`udd status --json\` and analyze:
1. What is the current phase?
2. Are there any failing tests?
3. Should we signal COMPLETE or is there work remaining?

Respond with either "COMPLETE" if all is done, or describe what work remains.`,
		);

		expect(response).toBeTruthy();
		expect(
			response.includes("COMPLETE") ||
				response.toLowerCase().includes("work") ||
				response.toLowerCase().includes("test"),
		).toBe(true);
	}, 180000);

	it("completion detection works correctly", () => {
		// Test the isCompleteResponse helper - no OpenCode needed
		expect(isCompleteResponse("Project is COMPLETE")).toBe(true);
		expect(isCompleteResponse("PHASE_COMPLETE - moving to next")).toBe(true);
		expect(isCompleteResponse("Work remains on feature X")).toBe(false);
	});
});
