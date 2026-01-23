import { Box, Text } from "ink";
import type React from "react";

type Props = {
	label: string;
	value: React.ReactNode;
	color?: string;
};

export function KeyValue({ label, value, color }: Props) {
	return (
		<Box>
			<Text color="gray">{label}: </Text>
			<Text color={color} bold={!!color}>
				{value}
			</Text>
		</Box>
	);
}
