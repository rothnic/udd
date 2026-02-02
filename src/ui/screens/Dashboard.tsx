import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";
import type { ProjectStatus } from "../../lib/status.js";

const BigTextAny = BigText as any;
const GradientAny = Gradient as any;

interface DashboardProps {
	status: ProjectStatus;
}

export function Dashboard({ status }: DashboardProps) {
	return (
		<Box flexDirection="column">
			<GradientAny name="morning">
				<BigTextAny text="UDD" font="block" />
			</GradientAny>
			<Box flexDirection="column" marginTop={1}>
				<Text>
					Phase: <Text color="yellow">{status.current_phase}</Text>
				</Text>
				<Text>
					Branch: <Text color="blue">{status.git.branch}</Text>
				</Text>
				<Box marginTop={1}>
					<Text>Features: {status.active_features.length}</Text>
					<Text> | </Text>
					<Text>Use Cases: {Object.keys(status.use_cases).length}</Text>
					<Text> | </Text>
					<Text>Journeys: {Object.keys(status.journeys).length}</Text>
				</Box>
			</Box>
		</Box>
	);
}
