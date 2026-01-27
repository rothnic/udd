import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

// Cast Spinner to any to avoid type mismatch issues between ink and react types
const SpinnerAny = Spinner as any;

export const Loading = ({ text = "Loading..." }: { text?: string }) => {
	return (
		<Box>
			<Text color="green">
				<SpinnerAny type="dots" />
			</Text>
			<Text> {text}</Text>
		</Box>
	);
};
