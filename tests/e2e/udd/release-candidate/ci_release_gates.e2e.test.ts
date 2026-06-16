import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import yaml from "yaml";
import { rootDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/release-candidate/ci_release_gates.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("CI runs release-candidate gates", ({ Given, When, Then, And }) => {
		let workflowText = "";
		let runCommands: string[] = [];
		let uploadArtifactStep = "";

		Given("the repository defines release-candidate CI", async () => {
			const workflowPath = path.join(
				rootDir,
				".github",
				"workflows",
				"production-readiness.yml",
			);
			workflowText = await fs.readFile(workflowPath, "utf-8");
		});

		When("a maintainer reviews the workflow", () => {
			const parsed = yaml.parse(workflowText) as {
				jobs?: Record<string, { steps?: Array<Record<string, unknown>> }>;
			};
			const steps = Object.values(parsed.jobs ?? {}).flatMap(
				(job) => job.steps ?? [],
			);
			runCommands = steps
				.map((step) => step.run)
				.filter((run): run is string => typeof run === "string");
			uploadArtifactStep =
				steps
					.find(
						(step) =>
							typeof step.uses === "string" &&
							step.uses.startsWith("actions/upload-artifact@"),
					)
					?.uses?.toString() ?? "";
		});

		Then(
			"CI should run lint, full tests, strict governance, repair dry-run, and clean package install smoke",
			() => {
				const commands = runCommands.join("\n");

				expect(commands).toContain("./bin/udd lint");
				expect(commands).toContain("npm test -- --run");
				expect(commands).toContain(
					"./bin/udd gate test-governance --strict --json",
				);
				expect(commands).toContain("./bin/udd repair --dry-run --json");
				expect(commands).toContain(
					"npm test -- tests/e2e/udd/cli/setup.e2e.test.ts --run",
				);
				expect(commands).toContain('npm install "git+file://');
				expect(commands).toContain("./bin/udd status --json");
			},
		);

		And("the workflow should preserve release evidence for review", () => {
			expect(runCommands.join("\n")).toContain(
				"docs/project/reviews/ci/latest",
			);
			expect(uploadArtifactStep).toBeTruthy();
		});
	});
});
