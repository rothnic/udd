import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export const Dashboard = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStatus = async () => {
			try {
				const data = await getProjectStatus();
				setStatus(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		loadStatus();
	}, []);

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	if (!status) {
		return <Text color="red">Failed to load status.</Text>;
	}

	const journeyCount = Object.keys(status.journeys).length;
	const featureCount = Object.keys(status.features).length;
	const useCaseCount = Object.keys(status.use_cases).length;

	// Calculate total scenarios and tests
	let totalScenarios = 0;
	let passingScenarios = 0;
	let failingScenarios = 0;
	let missingTests = 0;

	for (const journey of Object.values(status.journeys)) {
		totalScenarios += journey.scenarioCount;
		passingScenarios += journey.scenariosPassing;
		failingScenarios += journey.scenariosFailing;
		missingTests += journey.scenariosMissing;
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
		>
			<Box marginBottom={1}>
				<Text bold underline>
					Project Dashboard
				</Text>
			</Box>

			<Box flexDirection="row" gap={4}>
				<Box flexDirection="column">
					<Text>
						Journeys:{" "}
						<Text color="blue" bold>
							{journeyCount}
						</Text>
					</Text>
					<Text>
						Use Cases:{" "}
						<Text color="blue" bold>
							{useCaseCount}
						</Text>
					</Text>
					<Text>
						Features:{" "}
						<Text color="blue" bold>
							{featureCount}
						</Text>
					</Text>
				</Box>

				<Box flexDirection="column">
					<Text>
						Scenarios:{" "}
						<Text color="white" bold>
							{totalScenarios}
						</Text>
					</Text>
					<Text>
						Passing:{" "}
						<Text color="green" bold>
							{passingScenarios}
						</Text>
					</Text>
					<Text>
						Failing:{" "}
						<Text color="red" bold>
							{failingScenarios}
						</Text>
					</Text>
					<Text>
						Missing:{" "}
						<Text color="yellow" bold>
							{missingTests}
						</Text>
					</Text>
				</Box>

				<Box flexDirection="column">
					<Text>
						Git Branch: <Text color="magenta">{status.git.branch}</Text>
					</Text>
					<Text>
						Phase: <Text color="magenta">{status.current_phase}</Text>
					</Text>
					<Text>
						Dirty:{" "}
						<Text color={status.git.clean ? "green" : "red"}>
							{status.git.clean ? "No" : "Yes"}
						</Text>
					</Text>
				</Box>
			</Box>

			{status.hasProductDir && (
				<Box marginTop={1}>
					<Text italic color="gray">
						Product directory detected (V2 model)
					</Text>
				</Box>
			)}
		</Box>
	);
};
