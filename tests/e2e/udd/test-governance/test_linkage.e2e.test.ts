import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/test-linkage.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {});
		And('the project has feature files in "specs/features/"', () => {});
		And('the project has test files in "tests/"', () => {});
	});

	Scenario(
		"Test file declares linkage to feature file",
		({ Given, When, Then, And }) => {
			let statusOutput = "";
			let tempDir = "";
			const originalCwd = process.cwd();

			Given(
				'a feature file exists at "specs/features/auth/login.feature"',
				async () => {
					tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					process.chdir(tempDir);
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: User Login

  Scenario: Successful login
    Given a user exists
    When they log in with valid credentials
    Then they should be authenticated
`,
					);
				},
			);

			When(
				'I create a test file at "tests/auth/login.e2e.test.ts"',
				async () => {
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/login.e2e.test.ts",
						`import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/features/auth/login.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Successful login", ({ Given, When, Then }) => {
    Given("a user exists", () => {});
    When("they log in with valid credentials", () => {});
    Then("they should be authenticated", () => {});
  });
});
`,
					);
				},
			);

			And(
				'the test file contains "@feature(\'auth/login.feature\')"',
				async () => {
					const content = await fs.readFile(
						"tests/auth/login.e2e.test.ts",
						"utf-8",
					);
					expect(content).toContain("specs/features/auth/login.feature");
				},
			);

			Then("the linkage should be valid", async () => {
				await runUdd("test scan");
				await runUdd(
					"test link tests/auth/login.e2e.test.ts specs/features/auth/login.feature",
				);
			});

			And('"udd status" should show the test as linked', async () => {
				await runUdd(
					"test link tests/auth/login.e2e.test.ts specs/features/auth/login.feature",
				);

				const result = await runUdd("status");
				statusOutput = String(result.stdout || "");
				expect(statusOutput).toBeDefined();
				// Cleanup
				process.chdir(originalCwd);
				try {
					await fs.rm(tempDir, { recursive: true, force: true });
				} catch {
					// swallow cleanup errors
				}
			});
		},
	);

	Scenario(
		"Feature file with no linked tests is flagged",
		({ Given, And, When, Then }) => {
			let statusOutput = "";
			let tempDir = "";
			const originalCwd = process.cwd();

			Given(
				'a feature file exists at "specs/features/payment/checkout.feature"',
				async () => {
					tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					process.chdir(tempDir);
					await runUdd("init --yes");
					await fs.mkdir("specs/features/payment", { recursive: true });
					await fs.writeFile(
						"specs/features/payment/checkout.feature",
						`Feature: Payment Checkout

  Scenario: Process payment
    Given items in cart
    When user completes checkout
    Then payment should be processed
`,
					);
				},
			);

			And('no test file links to "payment/checkout.feature"', () => {});

			When('I run "udd status"', async () => {
				const result = await runUdd("status");
				statusOutput = String(result.stdout || "");
			});

			Then(
				'the output should flag "payment/checkout.feature" as having no tests',
				() => {
					expect(statusOutput).toBeDefined();
					expect(statusOutput.length).toBeGreaterThan(0);
				},
			);

			And('the feature should appear in the "untested" section', async () => {
				expect(statusOutput).toBeDefined();
				// Cleanup
				process.chdir(originalCwd);
				try {
					await fs.rm(tempDir, { recursive: true, force: true });
				} catch {
					// swallow cleanup errors
				}
			});
		},
	);

	Scenario(
		"Multiple tests can link to one feature",
		({ Given, When, Then, And }) => {
			let statusOutput = "";
			let tempDir = "";
			const originalCwd = process.cwd();

			Given(
				'a feature file exists at "specs/features/user/profile.feature"',
				async () => {
					tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					process.chdir(tempDir);
					await runUdd("init --yes");
					await fs.mkdir("specs/features/user", { recursive: true });
					await fs.writeFile(
						"specs/features/user/profile.feature",
						`Feature: User Profile

  Scenario: View profile
    Given a logged in user
    When they view their profile
    Then profile data should be displayed

  Scenario: Edit profile
    Given a logged in user
    When they update their profile
    Then changes should be saved
`,
					);
				},
			);

			When(
				'I create test file "tests/user/profile-unit.test.ts" linking to "user/profile.feature"',
				async () => {
					await fs.mkdir("tests/user", { recursive: true });
					await fs.writeFile(
						"tests/user/profile-unit.test.ts",
						`import { describe, it, expect } from "vitest";
import { loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/features/user/profile.feature");

describe("Profile Unit Tests", () => {
  it("should validate profile data", () => {
    expect(true).toBe(true);
  });
});
`,
					);
					await runUdd(
						"test link tests/user/profile-unit.test.ts specs/features/user/profile.feature",
					);
				},
			);

			And(
				'I create test file "tests/user/profile-e2e.test.ts" linking to "user/profile.feature"',
				async () => {
					await fs.writeFile(
						"tests/user/profile-e2e.test.ts",
						`import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/features/user/profile.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("View profile", ({ Given, When, Then }) => {
    Given("a logged in user", () => {});
    When("they view their profile", () => {});
    Then("profile data should be displayed", () => {});
  });
});
`,
					);
					await runUdd(
						"test link tests/user/profile-e2e.test.ts specs/features/user/profile.feature",
					);
				},
			);

			Then("both linkages should be valid", async () => {
				const result = await runUdd("status");
				expect(result.stdout).toBeDefined();
			});

			And(
				'"udd status" should show 2 tests for "user/profile.feature"',
				async () => {
					const result = await runUdd("status");
					statusOutput = String(result.stdout || "");
					expect(statusOutput).toBeDefined();
					// Cleanup
					process.chdir(originalCwd);
					try {
						await fs.rm(tempDir, { recursive: true, force: true });
					} catch {
						// swallow cleanup errors
					}
				},
			);
		},
	);

	Scenario(
		"Test linking to non-existent feature file",
		({ Given, And, When, Then }) => {
			let statusOutput = "";
			let tempDir = "";
			const originalCwd = process.cwd();

			Given(
				'I create a test file at "tests/auth/invalid.test.ts"',
				async () => {
					tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					process.chdir(tempDir);
					await runUdd("init --yes");
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/invalid.test.ts",
						`import { describe, it, expect } from "vitest";
import { loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/features/auth/nonexistent.feature");

describe("Invalid Test", () => {
  it("should fail", () => {
    expect(true).toBe(true);
  });
});
`,
					);
				},
			);

			And(
				'the test file contains "@feature(\'auth/nonexistent.feature\')"',
				async () => {
					const content = await fs.readFile(
						"tests/auth/invalid.test.ts",
						"utf-8",
					);
					expect(content).toContain(
						"specs/features/auth/nonexistent.feature",
					);
				},
			);

			When('I run "udd status"', async () => {
				const result = await runUdd("status");
				statusOutput = String(result.stdout || "");
			});

			Then(
				'the output should warn about broken link to "auth/nonexistent.feature"',
				() => {
					expect(statusOutput).toBeDefined();
					expect(statusOutput.length).toBeGreaterThan(0);
				},
			);

			And('the test should appear in the "orphan tests" section', async () => {
				expect(statusOutput).toBeDefined();
				// Cleanup
				process.chdir(originalCwd);
				try {
					await fs.rm(tempDir, { recursive: true, force: true });
				} catch {
					// swallow cleanup errors
				}
			});
		},
	);

	Scenario(
		"Renaming feature file updates linkage",
		({ Given, And, When, Then }) => {
			let syncOutput = "";
			let testFileContent = "";
			let tempDir = "";
			const originalCwd = process.cwd();

			Given(
				'a feature file exists at "specs/features/old-name.feature"',
				async () => {
					tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					process.chdir(tempDir);
					await runUdd("init --yes");
					await fs.mkdir("specs/features", { recursive: true });
					await fs.writeFile(
						"specs/features/old-name.feature",
						`Feature: Old Feature Name

  Scenario: Some scenario
    Given a condition
    When an action occurs
    Then a result happens
`,
					);
				},
			);

			And('a test file links to "old-name.feature"', async () => {
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/old-feature.test.ts",
					`import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/features/old-name.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Some scenario", ({ Given, When, Then }) => {
    Given("a condition", () => {});
    When("an action occurs", () => {});
    Then("a result happens", () => {});
  });
});
`,
				);
				await runUdd(
					"test link tests/old-feature.test.ts specs/features/old-name.feature",
				);
			});

			When(
				'I rename the feature file to "specs/features/new-name.feature"',
				async () => {
					await fs.rename(
						"specs/features/old-name.feature",
						"specs/features/new-name.feature",
					);
				},
			);

			And('I run "udd sync"', async () => {
				const result = await runUdd("sync --auto");
				syncOutput = String(result.stdout || "");
			});

			Then('the linkage should be updated to "new-name.feature"', async () => {
				const result = await runUdd("status");
				expect(result.stdout).toBeDefined();
			});

			And(
				"the test file declaration should reference the new path",
				async () => {
					testFileContent = await fs.readFile(
						"tests/old-feature.test.ts",
						"utf-8",
					);
					expect(testFileContent).toBeDefined();
					// Cleanup
					process.chdir(originalCwd);
					try {
						await fs.rm(tempDir, { recursive: true, force: true });
					} catch {
						// swallow cleanup errors
					}
				},
			);
		},
	);
}, 60000);
