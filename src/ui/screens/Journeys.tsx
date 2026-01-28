import { Box, Text } from "ink";
import type React from "react";
import type { ProjectStatus } from "../../lib/status.js";

interface JourneysProps {
	status: ProjectStatus;
}

export const Journeys: React.FC<JourneysProps> = ({ status }) => {
	const { journeys, hasProductDir } = status;

	if (!hasProductDir) {
		return (
			<Box>
				<Text dimColor>
					No product directory found. Run 'udd init' to start.
				</Text>
			</Box>
		);
	}

	const journeyKeys = Object.keys(journeys);

	if (journeyKeys.length === 0) {
		return (
			<Box>
				<Text dimColor>
					No journeys found. Run 'udd new journey' to create one.
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold underline>
					User Journeys
				</Text>
			</Box>
			{journeyKeys.map((key) => {
				const journey = journeys[key];
				const coverageColor =
					journey.scenariosMissing === 0
						? "green"
						: journey.scenariosMissing < journey.scenarioCount
							? "yellow"
							: "red";

				return (
					<Box key={key} flexDirection="column" marginBottom={1}>
						<Box>
							<Text bold>{journey.name}</Text>
							{journey.isStale && <Text color="yellow"> (needs sync)</Text>}
						</Box>
						<Box marginLeft={2}>
							<Text>Status: </Text>
							<Text color={coverageColor}>
								{journey.scenarioCount > 0
									? `${journey.scenariosPassing}/${journey.scenarioCount} scenarios passing`
									: "No scenarios linked"}
							</Text>
						</Box>
						{journey.scenariosMissing > 0 && (
							<Box marginLeft={4}>
								<Text dimColor>→ {journey.scenariosMissing} missing</Text>
							</Box>
						)}
						{journey.scenariosFailing > 0 && (
							<Box marginLeft={4}>
								<Text color="red">→ {journey.scenariosFailing} failing</Text>
							</Box>
						)}
					</Box>
				);
			})}
		</Box>
	);
};
