import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";
import type { ProjectStatus } from "../../lib/status.js";

type DashboardProps = {
	status: ProjectStatus;
};

export const Dashboard = ({ status }: DashboardProps) => {
	return (
		<Box flexDirection="column" gap={1}>
			<Gradient name="morning">
				<BigText text="UDD" font="block" />
			</Gradient>

			<Box flexDirection="column">
				<Text bold>
					Phase {status.current_phase}:{" "}
					{status.phases[status.current_phase.toString()] || "Unknown"}
				</Text>
				<Text>Branch: {status.git.branch}</Text>
			</Box>

			<Box flexDirection="column" borderStyle="single" padding={1}>
				<Text>Journeys: {Object.keys(status.journeys).length}</Text>
				<Text>Features: {Object.keys(status.features).length}</Text>
				<Text>Use Cases: {Object.keys(status.use_cases).length}</Text>
			</Box>
		</Box>
	);
};
