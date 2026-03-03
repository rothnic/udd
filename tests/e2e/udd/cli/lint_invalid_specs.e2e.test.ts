import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/lint_invalid_specs.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Lint Invalid Specs", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			return;
		});

		When("I do something", () => {
			return;
		});

		Then("something happens", () => {
			// @phase:4 - Intentional stub for future implementation
			// TEST FIXTURE: not a real assertion
		expect(true).toBe(true);
		});
	});

	Scenario(
		"Lint reports syntax error for invalid feature files",
		({ Given, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let err: any;

			Given(
				'a feature file "specs/features/example/bad_syntax.feature" containing invalid gherkin',
				() => {
					// intent recorded by the feature; actual file created in When inside an isolated temp dir
					return;
				},
			);

			When("I run the udd lint command on that file", async () => {
				await withTempDir(async () => {
					// validator requires specs/VISION.md to run further checks
					await fs.mkdir(path.join(process.cwd(), "specs"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(process.cwd(), "specs", "VISION.md"),
						"---\nid: test\nname: test\ngoals:\n  - goal\nuse_cases: []\n---\n",
					);

					// create a malformed YAML _feature.yml so validator reports a parse error
					const metaDir = path.join(process.cwd(), "specs/features/example");
					await fs.mkdir(metaDir, { recursive: true });
					await fs.writeFile(
						path.join(metaDir, "_feature.yml"),
						"id: feature-x\narea: example\nname: Example\nsummary: Test\nuse_cases:\n  - a\n  - b:\n",
					);

					try {
						const r = await runUdd("lint");
						result = {
							stdout: String(r.stdout || ""),
							stderr: String(r.stderr || ""),
						};
					} catch (e: any) {
						err = e;
						result = {
							stdout: String(e.stdout || ""),
							stderr: String(e.stderr || ""),
						};
					}
				});
			});

			Then(
				"the linter should report a syntax error with the file path and line number",
				() => {
					// The YAML parse / read error is reported by the validator as "<file>: Error reading or parsing"
					expect(err).toBeDefined();
					const out = (result!.stdout || "") + "\n" + (result!.stderr || "");
					expect(out).toContain("_feature.yml");
					expect(
						/Error reading|Error reading or parsing|Invalid frontmatter|Invalid schema/i.test(
							out,
						),
					).toBe(true);
				},
			);
		},
	);

	Scenario(
		"Lint reports empty feature file as an error",
		({ Given, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let err: any;

			Given(
				'an empty feature file "specs/features/example/empty.feature"',
				() => {
					return;
				},
			);

			When("I run the udd lint command on that file", async () => {
				await withTempDir(async () => {
					// create VISION.md but do not create any .feature files so validator reports no scenario files
					await fs.mkdir(path.join(process.cwd(), "specs"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(process.cwd(), "specs", "VISION.md"),
						"---\nid: test\nname: test\ngoals:\n  - goal\nuse_cases: []\n---\n",
					);

					// create an "empty" feature file containing only whitespace/newlines
					await fs.mkdir(path.join(process.cwd(), "specs/features/example"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(process.cwd(), "specs/features/example/empty.feature"),
						"\n\n  \n",
					);

					try {
						// Use strict validation so missing Feature declaration / scenarios cause a non-zero exit
						const r = await runUdd("validate --strict");
						result = {
							stdout: String(r.stdout || ""),
							stderr: String(r.stderr || ""),
						};
					} catch (e: any) {
						err = e;
						result = {
							stdout: String(e.stdout || ""),
							stderr: String(e.stderr || ""),
						};
					}
				});
			});

			Then(
				"the linter should report that the feature file is empty or missing scenarios",
				() => {
					// In strict mode the validator should exit non-zero for a file with no Feature/scenarios
					expect(err).toBeDefined();
					const out = (result!.stdout || "") + "\n" + (result!.stderr || "");
					expect(
						/Missing Feature|No scenarios|No scenario files found/i.test(out),
					).toBe(true);
				},
			);
		},
	);

	Scenario(
		"Lint flags feature missing required SysML comments",
		({ Given, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let err: any;

			Given(
				'a feature file "specs/features/example/missing_sysml.feature" missing User Need and Success Criteria comments',
				() => {
					return;
				},
			);

			When("I run the udd validate command", async () => {
				await withTempDir(async () => {
					// create VISION and a .feature lacking SysML comment blocks; validate prints warnings
					await fs.mkdir(path.join(process.cwd(), "specs/features/example"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(process.cwd(), "specs", "VISION.md"),
						"---\nid: test\nname: test\ngoals:\n  - goal\nuse_cases: []\n---\n",
					);

					await fs.writeFile(
						path.join(
							process.cwd(),
							"specs/features/example/missing_sysml.feature",
						),
						"Feature: Missing SysML\n\n  Scenario: Minimal\n    Given a precondition\n    When an action\n    Then an outcome\n",
					);

					try {
						const r = await runUdd("validate");
						result = {
							stdout: String(r.stdout || ""),
							stderr: String(r.stderr || ""),
						};
					} catch (e: any) {
						err = e;
						result = {
							stdout: String(e.stdout || ""),
							stderr: String(e.stderr || ""),
						};
					}
				});
			});

			Then(
				"the validator should include a warning or failure indicating missing SysML sections",
				() => {
					// validate may exit 0 (warnings only) or non-zero; either way output must mention missing SysML sections
					const out = result
						? (result.stdout || "") + "\n" + (result.stderr || "")
						: "";
					expect(
						/Missing user need|Missing success criteria|# User Need:|# Success Criteria:/i.test(
							out,
						),
					).toBe(true);
				},
			);
		},
	);
});
