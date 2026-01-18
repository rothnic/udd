import { Box, Text } from "ink";
import React from "react";
import { Header } from "./components/Header.js";
import { Dashboard } from "./screens/Dashboard.js";

export const App = () => {
	return (
		<Box flexDirection="column" padding={1}>
			<Header />
			<Dashboard />
			<Box marginTop={1}>
				<Text color="gray">Press Ctrl+C to exit.</Text>
			</Box>
		</Box>
	);
};
