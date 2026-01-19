import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { theme } from "../theme.js";

export const Journeys = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);

	useEffect(() => {
		getProjectStatus().then(setStatus);
	}, []);

	if (!status) {
		return <Text>Loading journeys...</Text>;
	}

	const journeys = Object.values(status.journeys || {});

	if (journeys.length === 0) {
		return <Text color={theme.colors.warning}>No journeys found.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Journeys</Text>
			</Box>
			{journeys.map((journey, _i) => (
				<Box
					key={journey.name}
					flexDirection="column"
					marginBottom={1}
					borderStyle="single"
					borderColor={theme.colors.dim}
					paddingX={1}
				>
					<Box justifyContent="space-between">
						<Text bold color={theme.colors.primary}>
							{journey.name}
						</Text>
						<Text color={theme.colors.dim}>{journey.actor}</Text>
					</Box>
					<Text>{journey.goal}</Text>
					<Box marginTop={1} gap={2}>
						<Text color={theme.colors.success}>
							{theme.symbols.check} {journey.scenariosPassing}
						</Text>
						<Text color={theme.colors.error}>
							{theme.symbols.cross} {journey.scenariosFailing}
						</Text>
						<Text color={theme.colors.warning}>
							{theme.symbols.dot} {journey.scenariosMissing}
						</Text>
					</Box>
				</Box>
			))}
		</Box>
	);
};
