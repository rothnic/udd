import { Box, Text } from "ink";
import type React from "react";

export const Help: React.FC = () => {
	return (
		<Box flexDirection="column">
			<Text bold>Keyboard Shortcuts:</Text>
			<Text>1: Dashboard</Text>
			<Text>2: Journeys</Text>
			<Text>3: Inbox</Text>
			<Text>4: Help</Text>
			<Text>q: Quit</Text>
		</Box>
	);
};
