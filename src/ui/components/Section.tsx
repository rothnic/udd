import { Box, Text } from "ink";
import type React from "react";

type Props = {
	children: React.ReactNode;
	title: string;
};

export function Section({ children, title }: Props) {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Text bold underline>
				{title}
			</Text>
			<Box paddingLeft={1} flexDirection="column">
				{children}
			</Box>
		</Box>
	);
}
