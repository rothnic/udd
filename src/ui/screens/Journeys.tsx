import { Box, Text } from "ink";

const Journeys = () => {
	return (
		<Box flexDirection="column">
			<Text bold underline>
				User Journeys
			</Text>
			<Box marginTop={1}>
				<Text>
					This screen will list user journeys found in product/journeys/.
				</Text>
				<Text color="gray">(Feature not yet implemented)</Text>
			</Box>
		</Box>
	);
};

export default Journeys;
