import { Box, Text } from "ink";

export const Help = () => {
	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold underline>
					UDD TUI Help
				</Text>
			</Box>

			<Text>
				<Text bold>User Driven Development (UDD)</Text> is a spec-first tool
				where journeys are requirements and scenarios are tests.
			</Text>

			<Box marginTop={1} flexDirection="column">
				<Text bold underline>
					Navigation
				</Text>
				<Text>
					{" "}
					<Text bold>1</Text> Dashboard: Project overview and status.
				</Text>
				<Text>
					{" "}
					<Text bold>2</Text> Journeys: List of user journeys and feature
					status.
				</Text>
				<Text>
					{" "}
					<Text bold>3</Text> Inbox: Tasks and research items to explore.
				</Text>
				<Text>
					{" "}
					<Text bold>4</Text> Help: This screen.
				</Text>
				<Text>
					{" "}
					<Text bold>q</Text> or <Text bold>Esc</Text>: Quit the TUI.
				</Text>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text bold underline>
					Concepts
				</Text>
				<Text>
					{" "}
					• <Text bold>Journeys</Text>: High level user workflows defined in{" "}
					<Text color="cyan">product/journeys/</Text>.
				</Text>
				<Text>
					{" "}
					• <Text bold>Features</Text>: Functional requirements in{" "}
					<Text color="cyan">specs/features/</Text>.
				</Text>
				<Text>
					{" "}
					• <Text bold>Scenarios</Text>: BDD tests (Given/When/Then) that verify
					features.
				</Text>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text bold underline>
					Commands
				</Text>
				<Text>
					Run <Text color="yellow">udd --help</Text> in your terminal to see all
					CLI commands.
				</Text>
			</Box>
		</Box>
	);
};
