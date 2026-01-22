import { Box, Text } from "ink";
import React from "react";
import type { ProjectStatus } from "../../lib/status.js";

export const Dashboard = ({ status }: { status: ProjectStatus }) => {
	return (
		<Box flexDirection="column">
			<Text bold>Project Phase: {status.current_phase}</Text>
			<Text>Git Branch: {status.git.branch}</Text>
			<Box marginTop={1} flexDirection="column">
				<Text underline>Stats:</Text>
				<Text> Active Features: {status.active_features.length}</Text>
				<Text> Journeys: {Object.keys(status.journeys).length}</Text>
				<Text> Use Cases: {Object.keys(status.use_cases).length}</Text>
			</Box>
		</Box>
	);
};
