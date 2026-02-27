import { Box, Text } from "ink";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

export function Journeys() {
	const { status, loading } = useProjectStatus();

	if (loading) {
		return <Text>Loading...</Text>;
	}

	if (!status) return <Text>Error loading status.</Text>;

	const journeys = Object.entries(status.journeys);

	if (journeys.length === 0) {
		return <Text>No journeys found.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text bold underline>
				Journeys
			</Text>
			{journeys.map(([key, journey]) => (
				<Box
					key={key}
					flexDirection="column"
					marginTop={1}
					borderStyle="single"
					borderColor="gray"
					padding={1}
				>
					<Text bold color="cyan">
						{journey.name}
					</Text>
					<Text>Goal: {journey.goal}</Text>
					<Box marginTop={0}>
						<Text>Scenarios: </Text>
						<Text color="green">{journey.scenariosPassing} passing</Text>
						<Text> | </Text>
						<Text color="red">{journey.scenariosFailing} failing</Text>
						<Text> | </Text>
						<Text color="yellow">{journey.scenariosMissing} missing</Text>
					</Box>
				</Box>
			))}
		</Box>
	);
}
