import { Box, Text } from "ink";
import type React from "react";

export const Help: React.FC = () => {
	return (
		<Box flexDirection="column" gap={1}>
			<Text bold underline>
				Help
			</Text>
			<Box flexDirection="column">
				<Text bold>Navigation:</Text>
				<Text> 1 - Dashboard</Text>
				<Text> 2 - Journeys</Text>
				<Text> 3 - Inbox</Text>
				<Text> 4 - Help</Text>
				<Text> q / Esc - Quit</Text>
			</Box>
			<Box flexDirection="column" marginTop={1}>
				<Text bold>About:</Text>
				<Text>UDD (User Driven Development) CLI TUI.</Text>
				<Text>Use this tool to explore user journeys and project status.</Text>
			</Box>
		</Box>
	);
};
