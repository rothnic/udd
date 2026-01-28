import { Box, Text } from "ink";
import type React from "react";
import type { ProjectStatus } from "../../lib/status.js";

interface DashboardProps {
	status: ProjectStatus;
}

export const Dashboard: React.FC<DashboardProps> = ({ status }) => {
	const { git, use_cases, features, orphaned_scenarios } = status;

	// Calculate metrics
	let totalOutcomes = 0;
	let unsatisfiedOutcomes = 0;
	let deferredOutcomes = 0;
	let failingScenarios = 0;
	let missingScenarios = 0;

	for (const feature of Object.values(features)) {
		for (const scenario of Object.values(feature.scenarios)) {
			if (scenario.e2e === "deferred") {
				// deferred
			} else if (scenario.e2e === "missing") {
				missingScenarios++;
			} else if (scenario.e2e === "failing") {
				failingScenarios++;
			}
		}
	}

	for (const useCase of Object.values(use_cases)) {
		for (const outcome of useCase.outcomes) {
			totalOutcomes++;
			if (outcome.status === "deferred") deferredOutcomes++;
			else if (outcome.status !== "satisfied") unsatisfiedOutcomes++;
		}
	}

	return (
		<Box flexDirection="column">
			<Box flexDirection="column" marginBottom={1}>
				<Text bold underline>
					Git Status
				</Text>
				<Box marginLeft={2}>
					<Text>
						Branch: <Text color="cyan">{git.branch}</Text>
					</Text>
				</Box>
				<Box marginLeft={2}>
					<Text>
						State:{" "}
						{git.clean ? (
							<Text color="green">Clean</Text>
						) : (
							<Text color="yellow">Dirty</Text>
						)}
					</Text>
				</Box>
				{!git.clean && (
					<Box marginLeft={4} flexDirection="column">
						{git.staged > 0 && <Text>Staged: {git.staged}</Text>}
						{git.modified > 0 && <Text>Modified: {git.modified}</Text>}
						{git.untracked > 0 && <Text>Untracked: {git.untracked}</Text>}
					</Box>
				)}
			</Box>

			<Box flexDirection="column" marginBottom={1}>
				<Text bold underline>
					Health Summary
				</Text>
				{unsatisfiedOutcomes === 0 &&
				failingScenarios === 0 &&
				missingScenarios === 0 &&
				orphaned_scenarios.length === 0 ? (
					<Box marginLeft={2}>
						<Text color="green">✓ All systems nominal</Text>
					</Box>
				) : (
					<Box flexDirection="column">
						{unsatisfiedOutcomes > 0 && (
							<Box marginLeft={2}>
								<Text color="red">
									✗ {unsatisfiedOutcomes} outcomes unsatisfied
								</Text>
							</Box>
						)}
						{deferredOutcomes > 0 && (
							<Box marginLeft={2}>
								<Text color="blue">◇ {deferredOutcomes} outcomes deferred</Text>
							</Box>
						)}
						{failingScenarios > 0 && (
							<Box marginLeft={2}>
								<Text color="red">✗ {failingScenarios} scenarios failing</Text>
							</Box>
						)}
						{missingScenarios > 0 && (
							<Box marginLeft={2}>
								<Text color="yellow">
									○ {missingScenarios} scenarios missing tests
								</Text>
							</Box>
						)}
						{orphaned_scenarios.length > 0 && (
							<Box marginLeft={2}>
								<Text color="yellow">
									⚠ {orphaned_scenarios.length} orphaned scenarios
								</Text>
							</Box>
						)}
					</Box>
				)}
			</Box>

			<Box flexDirection="column">
				<Text bold underline>
					Active Features
				</Text>
				{status.active_features.length > 0 ? (
					status.active_features.map((f) => (
						<Box key={f} marginLeft={2}>
							<Text>- {f}</Text>
						</Box>
					))
				) : (
					<Box marginLeft={2}>
						<Text dimColor>No active features</Text>
					</Box>
				)}
			</Box>
		</Box>
	);
};
