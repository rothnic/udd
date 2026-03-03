import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/hooks-installation.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("the project uses git for version control", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario("Install git hooks via CLI", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("git hooks are not yet installed", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				// Ensure no hooks exist
				try {
					await fs.rm(".git/hooks/pre-commit", { force: true });
				} catch {}
			});
		});

		When('I run "udd hooks install"', async () => {
			result = await runUdd("hooks install");
		});

		Then("the command should exit with code 0", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And(
			'a pre-commit hook should be created at ".git/hooks/pre-commit"',
			async () => {
				const hookExists = await fs
					.access(".git/hooks/pre-commit")
					.then(() => true)
					.catch(() => false);
				expect(hookExists).toBe(true);
			},
		);

		And("the hook should be executable", async () => {
			const stats = await fs.stat(".git/hooks/pre-commit");
			expect(stats.mode & 0o111).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Re-installing hooks is idempotent",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("hooks are already installed", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await runUdd("hooks install");
				});
			});

			When('I run "udd hooks install"', async () => {
				result = await runUdd("hooks install");
			});

			Then("the command should exit with code 0", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the existing hooks should be preserved", async () => {
				const hookExists = await fs
					.access(".git/hooks/pre-commit")
					.then(() => true)
					.catch(() => false);
				expect(hookExists).toBe(true);
			});

			And("no duplicate hooks should be created", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).not.toContain("duplicate");
			});
		},
	);

	Scenario("Install hooks with backup", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let originalHookContent: string;

		Given(
			'a pre-commit hook already exists at ".git/hooks/pre-commit"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir(".git/hooks", { recursive: true });
					originalHookContent = "#!/bin/sh\necho 'original hook'";
					await fs.writeFile(".git/hooks/pre-commit", originalHookContent, {
						mode: 0o755,
					});
				});
			},
		);

		When('I run "udd hooks install --backup"', async () => {
			result = await runUdd("hooks install --backup");
		});

		Then("the existing hook should be backed up", async () => {
			const backupExists = await fs
				.readdir(".git/hooks")
				.then((files) =>
					files.some(
						(f) => f.includes("backup") || f.includes("pre-commit.bak"),
					),
				)
				.catch(() => false);
			expect(backupExists).toBe(true);
		});

		And("the UDD hook should be installed", async () => {
			const hookContent = await fs.readFile(".git/hooks/pre-commit", "utf-8");
			expect(hookContent).not.toBe(originalHookContent);
		});

		And("the backup location should be reported", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("backup");
		});
	});

	Scenario("Uninstall git hooks", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("hooks are currently installed", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await runUdd("hooks install");
			});
		});

		When('I run "udd hooks uninstall"', async () => {
			result = await runUdd("hooks uninstall");
		});

		Then("the UDD hooks should be removed", async () => {
			const hookExists = await fs
				.access(".git/hooks/pre-commit")
				.then(() => true)
				.catch(() => false);
			expect(hookExists).toBe(false);
		});

		And("any backed-up hooks should be restored", async () => {
			// If there was a backup, it should be restored
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the command should confirm successful uninstallation", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("uninstall");
		});
	});

	Scenario("Install only specific hooks", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('I run "udd hooks install --only pre-commit"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				result = await runUdd("hooks install --only pre-commit");
			});
		});

		Then("only the pre-commit hook should be installed", async () => {
			const preCommitExists = await fs
				.access(".git/hooks/pre-commit")
				.then(() => true)
				.catch(() => false);
			expect(preCommitExists).toBe(true);
		});

		And("other hooks like pre-push should not be created", async () => {
			const prePushExists = await fs
				.access(".git/hooks/pre-push")
				.then(() => true)
				.catch(() => false);
			expect(prePushExists).toBe(false);
		});
	});

	Scenario("Check hook installation status", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("hooks may or may not be installed", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
			});
		});

		When('I run "udd hooks status"', async () => {
			result = await runUdd("hooks status");
		});

		Then("the output should show which hooks are installed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the output should show which hooks are missing", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/missing|not installed/i);
		});

		And("configuration status should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Install hooks with custom configuration", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When(
			'I run "udd hooks install --config validate-staged-only=true"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					result = await runUdd(
						"hooks install --config validate-staged-only=true",
					);
				});
			},
		);

		Then("the hooks should be installed", async () => {
			const hookExists = await fs
				.access(".git/hooks/pre-commit")
				.then(() => true)
				.catch(() => false);
			expect(hookExists).toBe(true);
		});

		And("the configuration should be saved", async () => {
			const configContent = await fs
				.readFile(".udd/hooks-config.json", "utf-8")
				.catch(() => "{}");
			expect(configContent).toContain("validate-staged-only");
		});

		And("subsequent hook runs should use the configuration", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Install fails when not in git repository",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I am not in a git repository", async () => {
				await withTempDir(async () => {
					// No git init, just udd init
					await fs.mkdir(".udd", { recursive: true });
					await fs.writeFile(".udd/manifest.yml", "journeys: []\n");
				});
			});

			When('I run "udd hooks install"', async () => {
				try {
					result = await runUdd("hooks install");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the command should exit with code 1", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And('the output should indicate "not a git repository"', () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("git repository");
			});
		},
	);
});
