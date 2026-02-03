import { Box, Text } from "ink";
import type React from "react";
import type { ProjectStatus } from "../../lib/status.js";

interface JourneysProps {
	status: ProjectStatus;
}

export const Journeys: React.FC<JourneysProps> = ({ status }) => {
	const journeys = Object.entries(status.journeys);

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold underline>
				User Journeys
			</Text>
			{journeys.length === 0 ? (
				<Text italic>
					No journeys defined. Run `udd new journey` to create one.
				</Text>
			) : (
				journeys.map(([id, journey]) => (
					<Box
						key={id}
						flexDirection="column"
						borderStyle="single"
						borderColor="gray"
						padding={1}
					>
						<Box justifyContent="space-between">
							<Text bold color="blue">
								{journey.name}
							</Text>
							<Text color="dim">
								{journey.actor} -&gt; {journey.goal}
							</Text>
						</Box>
						<Box marginTop={0}>
							<Text>
								<Text color="green">✓ {journey.scenariosPassing}</Text> |
								<Text color="red"> ✗ {journey.scenariosFailing}</Text> |
								<Text color="yellow"> ? {journey.scenariosMissing}</Text>
							</Text>
						</Box>
					</Box>
				))
			)}
		</Box>
	);
};
