import { Box, Text } from "ink";
import type React from "react";

type Props = {
	label: string;
	value: React.ReactNode;
	color?: string;
};

export const KeyValue = ({ label, value, color = "white" }: Props) => {
	return (
		<Box justifyContent="space-between" width="100%">
			<Text color="gray">{label}: </Text>
			<Text color={color}>{value}</Text>
		</Box>
	);
};
