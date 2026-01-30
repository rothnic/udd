import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";

export const Dashboard = () => {
	return (
		<Box flexDirection="column">
			<Gradient name="pastel">
				<BigText text="UDD" font="block" />
			</Gradient>
			<Text>User Driven Development</Text>
			<Box marginTop={1}>
				<Text>Welcome to UDD! Navigate using the numbers above.</Text>
			</Box>
		</Box>
	);
};
