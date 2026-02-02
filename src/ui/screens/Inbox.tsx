import { Box, Text } from "ink";
import React from "react";

export function Inbox() {
	return (
		<Box flexDirection="column">
			<Text bold underline>
				Inbox
			</Text>
			<Text>No new items.</Text>
			<Text color="gray">
				Use the inbox to triage failing tests, missing specs, and TODOs.
			</Text>
		</Box>
	);
}
