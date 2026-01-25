import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export const Dashboard = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const data = await getProjectStatus();
				setStatus(data);
			} catch (e: unknown) {
				setError((e as Error).message || String(e));
			} finally {
				setLoading(false);
			}
		};
		fetchStatus();
	}, []);

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading status...
				</Text>
			</Box>
		);
	}

	if (error) {
		return <Text color="red">Error: {error}</Text>;
	}

	if (!status) {
		return <Text color="red">Failed to load status.</Text>;
	}

	if (!status.hasProductDir) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow" bold>
					Product directory not found!
				</Text>
				<Text>
					Run{" "}
					<Text color="cyan" bold>
						udd init
					</Text>{" "}
					to initialize your product structure.
				</Text>
			</Box>
		);
	}

	// Calculate some summaries
	const journeyCount = Object.keys(status.journeys).length;
	let passingScenarios = 0;
	let failingScenarios = 0;
	let missingScenarios = 0;

	Object.values(status.journeys).forEach((j) => {
		passingScenarios += j.scenariosPassing;
		failingScenarios += j.scenariosFailing;
		missingScenarios += j.scenariosMissing;
	});

	return (
		<Box flexDirection="column">
			<Text bold underline>
				Project Status
			</Text>
			<Box marginY={1}>
				<Text>
					Current Phase:{" "}
					<Text color="cyan" bold>
						{status.current_phase}
					</Text>{" "}
					- {status.phases[status.current_phase] || "Unknown"}
				</Text>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				padding={1}
				borderColor="blue"
			>
				<Text bold>Journeys Summary</Text>
				<Box flexDirection="column">
					<Text>
						Total Journeys: <Text bold>{journeyCount}</Text>
					</Text>
					<Box marginLeft={2} flexDirection="column">
						<Text color="green">✓ Passing Scenarios: {passingScenarios}</Text>
						<Text color="red">✗ Failing Scenarios: {failingScenarios}</Text>
						<Text color="yellow">○ Missing Scenarios: {missingScenarios}</Text>
					</Box>
				</Box>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text>
					Git Branch: <Text color="magenta">{status.git.branch}</Text>
				</Text>
				<Text>
					Git State:{" "}
					{status.git.clean ? (
						<Text color="green">Clean</Text>
					) : (
						<Text color="yellow">Dirty</Text>
					)}
				</Text>
			</Box>
		</Box>
	);
};
