import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

// biome-ignore lint/suspicious/noExplicitAny: ink-spinner types mismatch
const SpinnerAny = Spinner as any;

export function Journeys() {
	const { status, loading, error } = useProjectStatus();

	if (loading)
		return (
			<Text color="green">
				<SpinnerAny type="dots" /> Loading...
			</Text>
		);
	if (error) return <Text color="red">Error: {error.message}</Text>;
	if (!status) return <Text color="red">No status.</Text>;

	const journeys = Object.entries(status.journeys);

	if (journeys.length === 0) {
		return <Text>No journeys found in product/journeys/.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text underline>Journeys</Text>
			</Box>
			{journeys.map(([id, j]) => (
				<Box
					key={id}
					flexDirection="column"
					marginBottom={1}
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
				>
					<Box justifyContent="space-between">
						<Text bold color="blue">
							{j.name}
						</Text>
						<Text color="gray">({id})</Text>
					</Box>
					<Text>Actor: {j.actor}</Text>
					<Text>Goal: {j.goal}</Text>
					<Box marginTop={1}>
						<Text>Scenarios: </Text>
						<Text color="green">{j.scenariosPassing} pass</Text>
						<Text> / </Text>
						<Text color="red">{j.scenariosFailing} fail</Text>
						<Text> / </Text>
						<Text color="yellow">{j.scenariosMissing} missing</Text>
					</Box>
				</Box>
			))}
		</Box>
	);
}
