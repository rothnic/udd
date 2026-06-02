import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/local-gate-validation.feature",
);

let tempDir: string | undefined;

async function cleanupProject(): Promise<void> {
	process.chdir(rootDir);
	if (tempDir) {
		await fs.rm(tempDir, { recursive: true, force: true });
		tempDir = undefined;
	}
}

async function enterProject(): Promise<void> {
	await cleanupProject();
	tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-governance-"));
	process.chdir(tempDir);
	await runUdd("init --yes");
}

async function writeFeature(filePath: string): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		filePath,
		`Feature: Login
  Scenario: User logs in
    Given a user exists
    When the user logs in
    Then the user is authenticated
`,
	);
}

async function writeTest(filePath: string, content: string): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, content);
}

async function runUddFailure(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	try {
		await runUdd(args);
		throw new Error(`Expected udd ${args} to fail`);
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return {
			stdout: failure.stdout ?? "",
			stderr: failure.stderr ?? "",
		};
	}
}

afterAll(cleanupProject);

describeFeature(feature, ({ Background, Scenario }) => {
	Background(({ Given }) => {
		Given("a UDD project is initialized", async () => {
			await enterProject();
		});
	});

	Scenario(
		"Scan tests for governance findings",
		({ Given, When, Then, And }) => {
			let scan: {
				summary: {
					linked: number;
					unlinked: number;
					orphaned: number;
					stubbed: number;
				};
				tests: Array<{ path: string; feature?: string; status: string }>;
			};

			Given(
				"the project has linked, unlinked, orphaned, and stubbed tests",
				async () => {
					await writeFeature("specs/features/auth/login.feature");
					await writeTest(
						"tests/auth/login.e2e.test.ts",
						`import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
const feature = await loadFeature("specs/features/auth/login.feature");
describeFeature(feature, ({ Scenario }) => {
  Scenario("User logs in", ({ Then }) => {
    Then("the user is authenticated", () => {
      expect(1 + 1).toBe(2);
    });
  });
});
`,
					);
					await writeTest(
						"tests/auth/unlinked.test.ts",
						`import { expect, test } from "vitest";
test("unlinked", () => expect(1 + 1).toBe(2));
`,
					);
					await writeTest(
						"tests/auth/orphaned.test.ts",
						`// @feature auth/missing
import { expect, test } from "vitest";
test("orphaned", () => expect(1 + 1).toBe(2));
`,
					);
					await writeTest(
						"tests/auth/stubbed.test.ts",
						`import { expect, test } from "vitest";
test("stubbed", () => expect(true).toBe(true));
`,
					);
				},
			);

			When('I run "udd test-scan --json"', async () => {
				const result = await runUdd("test-scan --json");
				scan = JSON.parse(result.stdout);
			});

			Then(
				"the scan reports linked, unlinked, orphaned, and stubbed counts",
				() => {
					expect(scan.summary.linked).toBe(1);
					expect(scan.summary.unlinked).toBe(2);
					expect(scan.summary.orphaned).toBe(1);
					expect(scan.summary.stubbed).toBe(1);
				},
			);

			And("the linked test includes its feature path", () => {
				expect(scan.tests).toContainEqual(
					expect.objectContaining({
						path: "tests/auth/login.e2e.test.ts",
						feature: "specs/features/auth/login.feature",
						status: "linked",
					}),
				);
			});
		},
	);

	Scenario(
		"Resolve feature comment references with feature extension",
		({ Given, When, Then }) => {
			let scan: {
				tests: Array<{ path: string; feature?: string; status: string }>;
			};

			Given(
				'the project has a test linked by an "@feature" comment ending in ".feature" plus punctuation',
				async () => {
					await writeFeature("specs/features/auth/login.feature");
					await writeTest(
						"tests/auth/comment-linked.e2e.test.ts",
						`// @feature auth/login.feature.
import { expect, test } from "vitest";
test("login", () => expect(1 + 1).toBe(2));
`,
					);
				},
			);

			When('I run "udd test-scan --json"', async () => {
				const result = await runUdd("test-scan --json");
				scan = JSON.parse(result.stdout);
			});

			Then("the feature comment test is reported as linked", () => {
				expect(scan.tests).toContainEqual(
					expect.objectContaining({
						path: "tests/auth/comment-linked.e2e.test.ts",
						feature: "specs/features/auth/login.feature",
						status: "linked",
					}),
				);
			});
		},
	);

	Scenario(
		"Record a source-controlled test review",
		({ Given, When, Then, And }) => {
			let reviewOutput = "";

			Given("the project has a meaningful linked test", async () => {
				await writeFeature("specs/features/auth/login.feature");
				await writeTest(
					"tests/auth/login.e2e.test.ts",
					`import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
const feature = await loadFeature("specs/features/auth/login.feature");
describeFeature(feature, ({ Scenario }) => {
  Scenario("User logs in", ({ Then }) => {
    Then("the user is authenticated", () => {
      expect(1 + 1).toBe(2);
    });
  });
});
`,
				);
			});

			When('I run "udd test review tests/auth/login.e2e.test.ts"', async () => {
				const result = await runUdd("test review tests/auth/login.e2e.test.ts");
				reviewOutput = result.stdout;
			});

			Then("the test review manifest records the test as clean", async () => {
				const manifest = await fs.readFile("specs/test-reviews.yml", "utf-8");
				expect(manifest).toContain("path: tests/auth/login.e2e.test.ts");
				expect(manifest).toContain("status: clean");
				expect(reviewOutput).toContain("Test reviewed");
			});

			And('"udd test status --json" reports the review record', async () => {
				const status = JSON.parse((await runUdd("test status --json")).stdout);
				expect(status.tests).toContainEqual(
					expect.objectContaining({
						path: "tests/auth/login.e2e.test.ts",
						status: "clean",
					}),
				);
			});
		},
	);

	Scenario("Run an explicit local gate", ({ Given, When, Then }) => {
		let advisory = "";
		let strict = "";

		Given("the project has dirty local review state", async () => {
			await fs.mkdir("specs", { recursive: true });
			await fs.writeFile(
				"specs/test-reviews.yml",
				`tests:
  - path: tests/auth/login.e2e.test.ts
    status: dirty
    lastReviewed: null
    reviewCount: 1
    dirtyReason: Feature changed after review
`,
			);
		});

		When('I run "udd gate test-governance"', async () => {
			const result = await runUdd("gate test-governance");
			advisory = result.stdout;
		});

		Then("the gate reports findings without failing", () => {
			expect(advisory).toContain("Test governance findings");
			expect(advisory).toContain("Dirty review: tests/auth/login.e2e.test.ts");
			expect(advisory).toContain("Advisory only");
		});

		When('I run "udd gate test-governance --strict"', async () => {
			const result = await runUddFailure("gate test-governance --strict");
			strict = `${result.stdout}\n${result.stderr}`;
		});

		Then("the strict gate fails with the dirty test listed", () => {
			expect(strict).toContain("Dirty review: tests/auth/login.e2e.test.ts");
		});
	});

	Scenario(
		"Block strict gates on invalid source-controlled review state",
		({ Given, When, Then }) => {
			let strict = "";

			Given(
				"the project has an invalid source-controlled review manifest",
				async () => {
					await fs.mkdir("specs", { recursive: true });
					await fs.writeFile(
						"specs/test-reviews.yml",
						`tests:
  - path: tests/auth/login.e2e.test.ts
    status: unknown
    lastReviewed: null
    reviewCount: 1
    dirtyReason: null
`,
					);
				},
			);

			When('I run "udd gate test-governance --strict"', async () => {
				const result = await runUddFailure("gate test-governance --strict");
				strict = `${result.stdout}\n${result.stderr}`;
			});

			Then(
				"the strict gate fails with the review manifest issue listed",
				() => {
					expect(strict).toContain("Review manifest issue");
					expect(strict).toContain("specs/test-reviews.yml");
				},
			);
		},
	);

	Scenario(
		"Ignore invalid local review cache for gate decisions",
		({ Given, When, Then }) => {
			let strict = "";
			let commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given(
				"the project has an invalid ignored local review cache",
				async () => {
					await fs.mkdir(".udd", { recursive: true });
					await fs.writeFile(
						".udd/test-reviews.yml",
						`tests:
  - path: tests/auth/login.e2e.test.ts
    status: unknown
    lastReviewed: null
    reviewCount: 1
    dirtyReason: null
`,
					);
				},
			);

			When('I run "udd gate test-governance --strict"', async () => {
				try {
					const result = await runUdd("gate test-governance --strict");
					strict = result.stdout;
				} catch (error) {
					commandError = error as {
						code: number;
						stdout: string;
						stderr: string;
					};
				}
			});

			Then("the strict gate does not fail because of local cache state", () => {
				expect(commandError).toBeUndefined();
				expect(strict).toContain("Test governance gate passed");
			});
		},
	);
});
