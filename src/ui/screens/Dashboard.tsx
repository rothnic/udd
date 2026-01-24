import { Box, Text } from "ink";

const Dashboard = () => {
	return (
		<Box flexDirection="column">
			<Text bold>Welcome to UDD TUI</Text>
			<Text>Use the keyboard to navigate:</Text>
			<Box marginLeft={2} flexDirection="column">
				<Text>[D] Dashboard - This screen</Text>
				<Text>[A] Actors - View User Personas</Text>
				<Text>[J] Journeys - View User Journeys</Text>
			</Box>
		</Box>
	);
};

export default Dashboard;
