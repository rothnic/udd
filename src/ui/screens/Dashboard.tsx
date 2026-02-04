import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

// biome-ignore lint/suspicious/noExplicitAny: ink-spinner types mismatch
const SpinnerAny = Spinner as any;

export function Dashboard() {
	const { status, loading, error } = useProjectStatus();

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<SpinnerAny type="dots" /> Loading status...
				</Text>
			</Box>
		);
	}

	if (error) {
		return <Text color="red">Error loading status: {error.message}</Text>;
	}

	if (!status) {
		return <Text color="red">No status available.</Text>;
	}

	const { git, current_phase, phases, features, use_cases, journeys } = status;
	const phaseName = phases[current_phase] || "Unknown";

	const featureCount = Object.keys(features).length;
	const useCaseCount = Object.keys(use_cases).length;
	const journeyCount = Object.keys(journeys).length;
	const orphanedScenarios = status.orphaned_scenarios.length;

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Current Phase: </Text>
				<Text color="cyan">
					{current_phase} - {phaseName}
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text bold>Git: </Text>
				<Text color={git.clean ? "green" : "yellow"}>
					{git.branch} {git.clean ? "(Clean)" : "(Dirty)"}
				</Text>
			</Box>

			<Box borderStyle="single" padding={1} flexDirection="column">
				<Text underline>Stats</Text>
				<Box marginTop={1}>
					<Box marginRight={4} flexDirection="column">
						<Text bold>Journeys</Text>
						<Text>{journeyCount}</Text>
					</Box>
					<Box marginRight={4} flexDirection="column">
						<Text bold>Features</Text>
						<Text>{featureCount}</Text>
					</Box>
					<Box marginRight={4} flexDirection="column">
						<Text bold>Use Cases</Text>
						<Text>{useCaseCount}</Text>
					</Box>
					<Box flexDirection="column">
						<Text bold>Orphans</Text>
						<Text color={orphanedScenarios > 0 ? "red" : "green"}>
							{orphanedScenarios}
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
