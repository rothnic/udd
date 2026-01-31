import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";

export const Dashboard = () => {
	return (
		<Box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			height="100%"
		>
			<Gradient name="morning">
				<BigText text="UDD" />
			</Gradient>
			<Text>Welcome to User Driven Development</Text>
			<Text color="gray">Maximize user value with systems thinking.</Text>
		</Box>
	);
};
